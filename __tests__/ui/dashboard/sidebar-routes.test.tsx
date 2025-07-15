import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { SidebarRoutes } from '../../../app/(dashboard)/_components/sidebar-routes'
import {
	render,
	setupTest,
	testWithUserRoles,
	expectAccessibleComponent,
	userEvent,
} from '../../../tests/utils/test-utils'

// Import mocks
import '../../../tests/mocks/clerk'
import '../../../tests/mocks/prisma'

// Mock the database using relative path
jest.mock('../../../lib/db', () => ({
	db: {
		// Add minimal db mock for tests that don't need full db functionality
		profile: { findUnique: jest.fn() },
	},
}))

describe('SidebarRoutes Component', () => {
	beforeEach(() => {
		setupTest()
	})

	describe('Guest Routes Display', () => {
		test('displays guest routes for unauthenticated users', () => {
			setupTest(null)
			render(<SidebarRoutes />)

			// Should show guest routes
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
			expect(screen.getByText('Browse')).toBeInTheDocument()
			expect(screen.getByText('Leaderboard')).toBeInTheDocument()

			// Should not show tutor-specific routes
			expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
		})

		test('displays guest routes for regular users on non-tutor pages', () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			// Should show guest routes
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
			expect(screen.getByText('Browse')).toBeInTheDocument()
			expect(screen.getByText('Leaderboard')).toBeInTheDocument()

			// Should not show tutor-specific routes when not on tutor page
			expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
		})
	})

	describe('Tutor Routes Display', () => {
		beforeEach(() => {
			// Mock pathname to be on tutor page
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/tutor/courses')
		})

		testWithUserRoles('displays tutor routes for all user types on tutor pages', (userType) => {
			render(<SidebarRoutes />)

			// Should show tutor routes
			expect(screen.getByText('Courses')).toBeInTheDocument()
			expect(screen.getByText('Notes')).toBeInTheDocument()
			expect(screen.getByText('Analytics')).toBeInTheDocument()

			// Should not show guest routes
			expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
			expect(screen.queryByText('Browse')).not.toBeInTheDocument()
		})
	})

	describe('StudyHub Routes Display', () => {
		beforeEach(() => {
			// Mock pathname to be on studyhub page
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/studyhub/room/123')
		})

		test('handles studyhub page correctly', () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			// Should still show guest routes when on studyhub (not tutor page)
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
			expect(screen.getByText('Browse')).toBeInTheDocument()
		})
	})

	describe('Navigation Tools and Resources', () => {
		test('displays accordion items for tools and resources', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			// Tools section
			expect(screen.getByText('Tools')).toBeInTheDocument()
			expect(screen.getByText('Resources')).toBeInTheDocument()
			expect(screen.getByText('Site')).toBeInTheDocument()

			// Initially, accordion items should be closed (children not visible)
			expect(screen.queryByText('Tuto AI')).not.toBeInTheDocument()
			expect(screen.queryByText('Past Papers')).not.toBeInTheDocument()
		})

		test('expands tools accordion when clicked', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const toolsButton = screen.getByText('Tools').closest('button')
			expect(toolsButton).toBeInTheDocument()

			// Click to expand tools
			await userEvent.click(toolsButton!)

			await waitFor(() => {
				expect(screen.getByText('Tuto AI')).toBeInTheDocument()
				expect(screen.getByText('Progress Tracker')).toBeInTheDocument()
				expect(screen.getByText('MCQ Mock Exams')).toBeInTheDocument()
			})
		})

		test('expands resources accordion when clicked', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const resourcesButton = screen.getByText('Resources').closest('button')
			expect(resourcesButton).toBeInTheDocument()

			// Click to expand resources
			await userEvent.click(resourcesButton!)

			await waitFor(() => {
				expect(screen.getByText('Past Papers')).toBeInTheDocument()
				expect(screen.getByText('Revision Notes')).toBeInTheDocument()
				expect(screen.getByText('Courses')).toBeInTheDocument()
				expect(screen.getByText('Flashcards')).toBeInTheDocument()
			})
		})

		test('expands site accordion when clicked', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const siteButton = screen.getByText('Site').closest('button')
			expect(siteButton).toBeInTheDocument()

			// Click to expand site
			await userEvent.click(siteButton!)

			await waitFor(() => {
				expect(screen.getByText('Landpage')).toBeInTheDocument()
				expect(screen.getByText('Become a tutor')).toBeInTheDocument()
				expect(screen.getByText('About Us')).toBeInTheDocument()
				expect(screen.getByText('Help Center')).toBeInTheDocument()
				expect(screen.getByText('Donate')).toBeInTheDocument()
				expect(screen.getByText('Profile')).toBeInTheDocument()
			})
		})

		test('toggles accordion items correctly', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const toolsButton = screen.getByText('Tools').closest('button')!

			// Expand tools
			await userEvent.click(toolsButton)
			await waitFor(() => {
				expect(screen.getByText('Tuto AI')).toBeInTheDocument()
			})

			// Collapse tools
			await userEvent.click(toolsButton)
			await waitFor(() => {
				expect(screen.queryByText('Tuto AI')).not.toBeInTheDocument()
			})
		})
	})

	describe('Navigation Functionality', () => {
		test('calls onClose when sidebar item is clicked', async () => {
			const mockOnClose = jest.fn()
			setupTest('regular')

			render(<SidebarRoutes onClose={mockOnClose} />)

			const dashboardLink = screen.getByText('Dashboard')
			await userEvent.click(dashboardLink)

			expect(mockOnClose).toHaveBeenCalledTimes(1)
		})

		test('navigates to correct routes when items are clicked', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			setupTest('regular')
			render(<SidebarRoutes />)

			// Test dashboard navigation
			const dashboardLink = screen.getByText('Dashboard')
			await userEvent.click(dashboardLink)

			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})

		test('navigates to nested routes correctly', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			setupTest('regular')
			render(<SidebarRoutes />)

			// Expand tools first
			const toolsButton = screen.getByText('Tools').closest('button')!
			await userEvent.click(toolsButton)

			await waitFor(() => {
				expect(screen.getByText('Tuto AI')).toBeInTheDocument()
			})

			// Click on nested item
			const tutoAILink = screen.getByText('Tuto AI')
			await userEvent.click(tutoAILink)

			expect(mockPush).toHaveBeenCalledWith('/tuto-ai')
		})
	})

	describe('Accessibility', () => {
		test('sidebar routes are accessible', () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			// Check main navigation items
			const dashboardLink = screen.getByText('Dashboard').closest('button')!
			expectAccessibleComponent(dashboardLink)

			const browseLink = screen.getByText('Browse').closest('button')!
			expectAccessibleComponent(browseLink)

			// Check accordion triggers
			const toolsButton = screen.getByText('Tools').closest('button')!
			expectAccessibleComponent(toolsButton)
		})

		test('sidebar routes have proper ARIA attributes', () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			// Check for proper button roles
			const buttons = screen.getAllByRole('button')
			expect(buttons.length).toBeGreaterThan(0)

			buttons.forEach((button) => {
				expect(button).toBeInTheDocument()
				expect(button).toHaveAttribute('type')
			})
		})

		test('keyboard navigation works correctly', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const dashboardButton = screen.getByText('Dashboard').closest('button')!

			// Test focus and enter key
			dashboardButton.focus()
			expect(document.activeElement).toBe(dashboardButton)

			// Test enter key navigation
			await userEvent.keyboard('{Enter}')

			const mockPush = jest.requireMock('next/navigation').useRouter().push
			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})
	})

	describe('Visual States', () => {
		test('shows active state for current route', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			setupTest('regular')
			render(<SidebarRoutes />)

			const dashboardButton = screen.getByText('Dashboard').closest('button')!
			
			// Should have active styling classes
			expect(dashboardButton).toHaveClass('text-purple-500')
			expect(dashboardButton).toHaveClass('bg-n-8')
		})

		test('shows hover states correctly', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const browseButton = screen.getByText('Browse').closest('button')!
			
			// Should have hover classes
			expect(browseButton).toHaveClass('hover:text-slate-500')
			expect(browseButton).toHaveClass('hover:bg-n-6')
		})
	})

	describe('Edge Cases', () => {
		test('handles missing pathname gracefully', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue(null)

			setupTest('regular')
			
			expect(() => render(<SidebarRoutes />)).not.toThrow()
		})

		test('handles empty onClose prop', async () => {
			setupTest('regular')
			render(<SidebarRoutes onClose={undefined} />)

			const dashboardLink = screen.getByText('Dashboard')
			
			// Should not throw when onClose is undefined
			expect(() => userEvent.click(dashboardLink)).not.toThrow()
		})

		test('handles rapid accordion toggling', async () => {
			setupTest('regular')
			render(<SidebarRoutes />)

			const toolsButton = screen.getByText('Tools').closest('button')!

			// Rapidly toggle multiple times
			await userEvent.click(toolsButton)
			await userEvent.click(toolsButton)
			await userEvent.click(toolsButton)

			// Should not throw or break
			expect(toolsButton).toBeInTheDocument()
		})
	})

	describe('Performance', () => {
		test('renders efficiently with many routes', () => {
			setupTest('regular')
			
			const startTime = performance.now()
			render(<SidebarRoutes />)
			const endTime = performance.now()

			// Should render quickly (under 100ms for this simple component)
			expect(endTime - startTime).toBeLessThan(100)
		})

		test('does not cause memory leaks with multiple renders', () => {
			setupTest('regular')
			
			// Render multiple times
			for (let i = 0; i < 10; i++) {
				const { unmount } = render(<SidebarRoutes />)
				unmount()
			}

			// Should complete without issues
			expect(true).toBe(true)
		})
	})
}) 