'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Globe, Mail, Phone, Users, Crown, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getSchoolById, type StaticSchool, type SchoolEvent, type SchoolAdmin } from '@/data/schools-static'

export default function SchoolDetailPage() {
  const params = useParams()
  const schoolId = params?.id as string
  
  const school = useMemo(() => getSchoolById(schoolId), [schoolId])

  if (!school) {
    return (
      <div className="min-h-screen bg-n-8 flex flex-col items-center justify-center">
        <div className="text-n-1 text-xl mb-4">School not found</div>
        <Link href="/school-hub">
          <Button variant="outline" className="border-n-6 text-n-1 hover:bg-n-7">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Schools
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-n-8">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={school.bannerUrl}
          alt={school.name}
          className="w-full h-full object-cover"
        />
        {/* Enhanced overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-8 px-4">
            {/* Back button */}
            <Link href="/school-hub" className="inline-block mb-4">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Schools
              </Button>
            </Link>
            
            {/* Title and description container with enhanced contrast */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-2xl max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {school.name}
              </h1>
              <p className="text-lg text-gray-100 leading-relaxed drop-shadow-md">
                {school.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* School Info */}
        <Card className="bg-n-7 border-n-6 text-n-1">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-color-1" />
                <span className="text-n-3">{school.location}</span>
              </div>
              {school.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-color-1" />
                  <a href={school.website} target="_blank" rel="noopener noreferrer" 
                     className="text-color-1 hover:text-color-1/80 transition-colors">
                    Website
                  </a>
                </div>
              )}
              {school.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-color-1" />
                  <a href={`mailto:${school.email}`} className="text-color-1 hover:text-color-1/80 transition-colors">
                    {school.email}
                  </a>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-color-1" />
                  <span className="text-n-3">{school.phone}</span>
                </div>
              )}
            </div>
            
            {/* School Statistics */}
            <div className="border-t border-n-6 pt-6">
              <h3 className="text-lg font-semibold text-n-1 mb-4">School Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-n-6 rounded-lg">
                  <div className="p-2 bg-color-1/10 rounded-lg">
                    <Users className="w-6 h-6 text-color-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-n-1">{school.activeMembers}</p>
                    <p className="text-sm text-n-3">Active Members</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-n-6 rounded-lg">
                  <div className="p-2 bg-color-2/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-color-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-n-1">{school.volunteerHours.toLocaleString()}</p>
                    <p className="text-sm text-n-3">Volunteer Hours</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admins Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 text-purple-100 shadow-xl">
          <CardHeader className="border-b border-purple-500/20">
            <CardTitle className="flex items-center space-x-3">
              <Shield className="w-7 h-7 text-purple-400" />
              <span className="text-purple-100 text-xl font-bold">School Board & Administrators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {school.admins.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {school.admins.map((admin) => (
                  <AdminCard key={admin.id} admin={admin} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-purple-950/20 rounded-lg border border-purple-500/20">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 font-medium">No administrators assigned to this school yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 text-purple-100 shadow-xl">
          <CardHeader className="border-b border-purple-500/20">
            <CardTitle className="flex items-center space-x-3">
              <Calendar className="w-7 h-7 text-purple-400" />
              <span className="text-purple-100 text-xl font-bold">Events & Announcements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {school.events.length > 0 ? (
              <div className="space-y-4">
                {school.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-purple-950/20 rounded-lg border border-purple-500/20">
                <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 font-medium">No events or announcements yet.</p>
                <p className="text-purple-300 text-sm mt-2">Check back later for updates!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminCard({ admin }: { admin: SchoolAdmin }) {
  return (
    <div className="flex items-center space-x-3 p-4 rounded-lg bg-purple-950/20 border border-purple-500/20 hover:bg-purple-950/30 transition-colors">
      <Avatar className="w-12 h-12">
        <AvatarImage src={admin.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.name}`} />
        <AvatarFallback className="bg-purple-600 text-white font-semibold">
          {admin.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-semibold text-purple-100 text-base">{admin.name}</div>
        <div className="text-sm text-purple-300">{admin.email}</div>
        <Badge 
          variant={admin.role === 'CHAPTER_SUPER_ADMIN' ? 'destructive' : 'secondary'} 
          className={admin.role === 'CHAPTER_SUPER_ADMIN' 
            ? 'bg-purple-600 hover:bg-purple-700 text-white text-xs mt-1' 
            : 'bg-purple-100 text-purple-800 text-xs mt-1'
          }
        >
          {admin.role === 'CHAPTER_SUPER_ADMIN' ? (
            <>
              <Crown className="w-3 h-3 mr-1" />
              Super Admin
            </>
          ) : (
            <>
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </>
          )}
        </Badge>
      </div>
    </div>
  )
}

function EventCard({ event }: { event: SchoolEvent }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-purple-950/20 rounded-lg border border-purple-500/20 overflow-hidden">
      {event.imageUrl && (
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant={event.postType === 'EVENT' ? 'default' : 'secondary'}
            className={event.postType === 'EVENT' 
              ? 'bg-color-1 text-white' 
              : 'bg-yellow-500 text-black'
            }
          >
            {event.postType}
          </Badge>
          <span className="text-sm text-purple-300">{formatDate(event.date)}</span>
        </div>
        <h4 className="text-lg font-semibold text-purple-100 mb-2">{event.title}</h4>
        <p className="text-purple-200 text-sm">{event.content}</p>
      </div>
    </div>
  )
}
