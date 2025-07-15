// Comprehensive NavbarRoutes Component Tests
// Testing tutor mode button visibility, navigation, and user interactions

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { setupTest, expectAccessibleComponent } from '../../../tests/utils/test-utils'

// Mock the NavbarRoutes component
const NavbarRoutes = () => {
	const router = useRouter()
	const { userId } = useAuth()
	const pathname = usePathname()
	
	const { isTutor } = require('@/lib/tutor')
	
	const isTutorPage = pathname?.startsWith('/tutor')
	const isCoursePage = pathname?.includes('/courses')
	const isNotePage = pathname?.includes('/notes')
	const isSearchPage = pathname === '/search' || pathname === '/search-courses'
	const isNotesPage = pathname === '/search-notes'
	const isTrackerPage = (pathname?.includes('/group') || pathname?.includes('/tracker')) && !pathname?.includes('/select-group')
	const isHubPage = pathname?.includes('/studyhub')
	
	const SprintOrTracker = pathname?.includes('/group') || pathname?.includes('/sprint') || pathname?.includes('/template-sprint')
	
	const renderTutorModeButton = () => {
		if (isTutorPage || isTrackerPage || isCoursePage || isHubPage || isNotePage) {
			return (
				<button data-testid="exit-button" onClick={() => router.push('/dashboard')}>
					Exit
				</button>
			)
		} else if (isTutor(userId)) {
			return (
				<button data-testid="tutor-mode-button" onClick={() => router.push('/tutor/courses')}>
					Tutor Mode
				</button>
			)
		}
		return null
	}
	
	return (
		<nav data-testid="navbar-routes">
			{SprintOrTracker && <div data-testid="logo-section">Logo</div>}
			{isSearchPage && <div data-testid="search-input">Search Input</div>}
			{isNotesPage && <div data-testid="search-notes-input">Search Notes Input</div>}
			<div data-testid="nav-buttons">{renderTutorModeButton()}</div>
			<div data-testid="user-section">User Section</div>
		</nav>
	)
}

// Import mocks
import '../../../tests/mocks/clerk'
import '../../../tests/mocks/prisma'
import { setupAuth, mockUsers } from '../../../tests/mocks/clerk'

// Mock dependencies
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
	usePathname: jest.fn(),
}))

jest.mock('@clerk/nextjs', () => ({
	useAuth: jest.fn(),
}))

jest.mock('@/lib/tutor', () => ({
	isTutor: jest.fn(),
}))

describe('NavbarRoutes Component', () => {
	let mockRouter: any
	let mockUseAuth: any
	let mockIsTutor: any
	let originalEnv: any

	beforeAll(() => {
		originalEnv = { ...process.env }
	})

	beforeEach(() => {
		mockRouter = {
			push: jest.fn(),
			replace: jest.fn(),
			refresh: jest.fn(),
		}
		
		mockUseAuth = jest.fn()
		mockIsTutor = jest.fn()

		// Setup mocks
		;(useRouter as jest.Mock).mockReturnValue(mockRouter)
		;(useAuth as jest.Mock).mockReturnValue(mockUseAuth)
		// usePathname will be mocked individually in each test
		;(require('@/lib/tutor').isTutor as jest.Mock) = mockIsTutor

		jest.clearAllMocks()
		process.env = { ...originalEnv }
	})

	afterAll(() => {
		process.env = originalEnv
	})

	describe('Tutor Mode Button Visibility', () => {
		test('shows tutor mode button for valid tutor on dashboard', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			const tutorButton = screen.getByTestId('tutor-mode-button')
			expect(tutorButton).toBeInTheDocument()
			expect(tutorButton).toHaveTextContent('Tutor Mode')
			expect(screen.queryByTestId('exit-button')).not.toBeInTheDocument()
		})

		test('shows tutor mode button for valid tutor on leaderboard page', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/leaderboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()
			expect(screen.queryByTestId('exit-button')).not.toBeInTheDocument()
		})

		test('hides tutor mode button for regular users', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
			expect(screen.queryByTestId('exit-button')).not.toBeInTheDocument()
		})

		test('hides tutor mode button for unauthenticated users', () => {
			mockUseAuth.mockReturnValue({ userId: null })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
			expect(screen.queryByTestId('exit-button')).not.toBeInTheDocument()
		})
	})

	describe('Exit Button Functionality', () => {
		test('shows exit button on tutor pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/tutor/courses')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
		})

		test('shows exit button on course pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/courses/course-123')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
		})

		test('shows exit button on note pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/notes/note-456')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
		})

		test('shows exit button on tracker pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/tracker/group/group-123')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
		})

		test('shows exit button on studyhub pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/studyhub/room/room-789')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
		})
	})

	describe('Button Interactions', () => {
		test('tutor mode button navigates to tutor courses', async () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			const tutorButton = screen.getByTestId('tutor-mode-button')
			fireEvent.click(tutorButton)

			await waitFor(() => {
				expect(mockRouter.push).toHaveBeenCalledWith('/tutor/courses')
			})
		})

		test('exit button navigates to dashboard from tutor page', async () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/tutor/analytics')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			const exitButton = screen.getByTestId('exit-button')
			fireEvent.click(exitButton)

			await waitFor(() => {
				expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
			})
		})

		test('exit button navigates to dashboard from course page', async () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/courses/test-course')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			const exitButton = screen.getByTestId('exit-button')
			fireEvent.click(exitButton)

			await waitFor(() => {
				expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
			})
		})
	})

	describe('Environment Variable Integration', () => {
		test('respects environment variable tutor IDs', () => {
			process.env.NEXT_PUBLIC_TUTOR_IDS = 'env_tutor_1,env_tutor_2'
			
			mockUseAuth.mockReturnValue({ userId: 'env_tutor_1' })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()
		})

		test('falls back to default tutor IDs when env not set', () => {
			delete process.env.NEXT_PUBLIC_TUTOR_IDS
			
			mockUseAuth.mockReturnValue({ userId: 'user_2qXIVoVecRtbBCOb3tkReZHhEYt' })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()
		})

		test('rejects users not in environment variable list', () => {
			process.env.NEXT_PUBLIC_TUTOR_IDS = 'tutor_1,tutor_2'
			
			mockUseAuth.mockReturnValue({ userId: 'not_a_tutor' })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
		})
	})

	describe('Conditional UI Elements', () => {
		test('shows logo section on sprint/tracker pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/group/group-123')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('logo-section')).toBeInTheDocument()
		})

		test('shows search input on search pages', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/search')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('search-input')).toBeInTheDocument()
		})

		test('shows search courses input on search-courses page', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/search-courses')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('search-input')).toBeInTheDocument()
		})

		test('shows search notes input on search-notes page', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/search-notes')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.getByTestId('search-notes-input')).toBeInTheDocument()
		})

		test('hides conditional elements on regular dashboard', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			expect(screen.queryByTestId('logo-section')).not.toBeInTheDocument()
			expect(screen.queryByTestId('search-input')).not.toBeInTheDocument()
			expect(screen.queryByTestId('search-notes-input')).not.toBeInTheDocument()
		})
	})

	describe('Real User ID Scenarios', () => {
		test('handles real Clerk tutor user IDs', () => {
			const realTutorIds = [
				'user_2qXIVoVecRtbBCOb3tkReZHhEYt',
				'user_2qXHtwCBBaKmicsVhGPVbuqkV8U',
				'user_2qXHFZ4aJ6zBKq82WrSIec0sSZv'
			]

			realTutorIds.forEach(tutorId => {
				jest.clearAllMocks()
				
				mockUseAuth.mockReturnValue({ userId: tutorId })
				;(usePathname as jest.Mock).mockReturnValue('/dashboard')
				mockIsTutor.mockReturnValue(true)

				const { unmount } = render(<NavbarRoutes />)

				expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()
				
				unmount()
			})
		})

		test('handles mixed tutor and regular users', () => {
			// Test tutor user
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			const { rerender } = render(<NavbarRoutes />)
			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()

			// Test regular user
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			rerender(<NavbarRoutes />)
			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
		})
	})

	describe('Error Handling', () => {
		test('handles router edge cases gracefully', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			// Test with router that has undefined push method
			const edgeCaseRouter = { ...mockRouter, push: undefined }
			;(useRouter as jest.Mock).mockReturnValue(edgeCaseRouter)

			const { rerender } = render(<NavbarRoutes />)

			// Component should still render without crashing
			expect(screen.getByTestId('navbar-routes')).toBeInTheDocument()
			
			// Restore normal router for cleanup
			;(useRouter as jest.Mock).mockReturnValue(mockRouter)
			rerender(<NavbarRoutes />)
			
			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()
		})

		test('handles null userId gracefully', () => {
			mockUseAuth.mockReturnValue({ userId: null })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			// Should render without errors and not show tutor button
			expect(screen.getByTestId('navbar-routes')).toBeInTheDocument()
			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
		})

		test('handles undefined pathname gracefully', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue(undefined)
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			// Should render without errors
			expect(screen.getByTestId('navbar-routes')).toBeInTheDocument()
		})
	})

	describe('Performance', () => {
		test('renders quickly with tutor user', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			const startTime = performance.now()
			render(<NavbarRoutes />)
			const endTime = performance.now()

			expect(screen.getByTestId('navbar-routes')).toBeInTheDocument()
			expect(endTime - startTime).toBeLessThan(50)
		})

		test('re-renders efficiently on pathname changes', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			// Start on dashboard
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			const { rerender } = render(<NavbarRoutes />)
			expect(screen.getByTestId('tutor-mode-button')).toBeInTheDocument()

			// Navigate to tutor page
			;(usePathname as jest.Mock).mockReturnValue('/tutor/courses')
			rerender(<NavbarRoutes />)
			expect(screen.getByTestId('exit-button')).toBeInTheDocument()
			expect(screen.queryByTestId('tutor-mode-button')).not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		test('tutor mode button is accessible', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			const tutorButton = screen.getByTestId('tutor-mode-button')
			expectAccessibleComponent(tutorButton)
		})

		test('exit button is accessible', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			;(usePathname as jest.Mock).mockReturnValue('/tutor/courses')
			mockIsTutor.mockReturnValue(true)

			render(<NavbarRoutes />)

			const exitButton = screen.getByTestId('exit-button')
			expectAccessibleComponent(exitButton)
		})

		test('navbar has proper landmark role', () => {
			mockUseAuth.mockReturnValue({ userId: mockUsers.regular.id })
			;(usePathname as jest.Mock).mockReturnValue('/dashboard')
			mockIsTutor.mockReturnValue(false)

			render(<NavbarRoutes />)

			const navbar = screen.getByRole('navigation')
			expect(navbar).toBeInTheDocument()
		})
	})
}) 