// v0.0.01 salah

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAdminAccess } from '@/lib/admin'

// Define protected admin routes
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isTrackerRoute = createRouteMatcher(['/tracker(.*)'])
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/assets(.*)',
  '/home(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = auth()
  const url = request.nextUrl

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated for tracker routes
  if (isTrackerRoute(request) && !userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Check admin routes
  if (isAdminRoute(request)) {
    // Check if user has admin access
    if (!hasAdminAccess(userId)) {
      // Redirect to dashboard with error message
      const dashboardUrl = new URL('/dashboard', request.url)
      dashboardUrl.searchParams.set('error', 'admin_access_required')
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
