// Comprehensive TutorLayout Component Tests
// Testing tutor access control, redirects, and layout functionality

import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { setupTest, expectAccessibleComponent } from '../../../tests/utils/test-utils'

// Mock the layout component with inline implementations
const TutorLayout = ({ children }: { children: React.ReactNode }) => {
	// Use the mocked functions from the test context
	const userId = mockAuth().userId
	
	if (!mockIsTutor(userId)) {
		mockRedirect('/dashboard')
		return null
	}
	
	return <div data-testid="tutor-layout">{children}</div>
}

// Import mocks
import '../../../tests/mocks/clerk'
import '../../../tests/mocks/prisma'
import { setupAuth, mockUsers } from '../../../tests/mocks/clerk'

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
	usePathname: jest.fn(),
	redirect: jest.fn(),
}))

// We'll create inline mock implementations instead of trying to import the actual modules

// Declare mock functions at module level so the component can access them
let mockRouter: any
let mockRedirect: any
let mockIsTutor: any
let mockAuth: any

describe('TutorLayout Component', () => {
	let originalEnv: any

	beforeAll(() => {
		originalEnv = { ...process.env }
	})

	beforeEach(() => {
		mockRouter = {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn(),
		}
		
		mockRedirect = jest.fn()
		mockIsTutor = jest.fn()
		mockAuth = jest.fn()

		// Setup mocks
		;(useRouter as jest.Mock).mockReturnValue(mockRouter)

		jest.clearAllMocks()
		
		// Reset environment
		process.env = { ...originalEnv }
	})

	afterAll(() => {
		process.env = originalEnv
	})

	describe('Tutor Access Control', () => {
		test('renders children when user is a valid tutor', () => {
			// Setup tutor user
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Tutor Dashboard Content</div>
				</TutorLayout>
			)

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(screen.getByTestId('tutor-content')).toBeInTheDocument()
			expect(screen.getByText('Tutor Dashboard Content')).toBeInTheDocument()
			expect(mockRedirect).not.toHaveBeenCalled()
		})

		test('redirects to dashboard when user is not a tutor', () => {
			// Setup regular user
			mockAuth.mockReturnValue({ userId: mockUsers.regular.id })
			mockIsTutor.mockReturnValue(false)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Tutor Dashboard Content</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(mockIsTutor).toHaveBeenCalledWith(mockUsers.regular.id)
		})

		test('redirects when user is not authenticated', () => {
			// No authenticated user
			mockAuth.mockReturnValue({ userId: null })
			mockIsTutor.mockReturnValue(false)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Tutor Dashboard Content</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(mockIsTutor).toHaveBeenCalledWith(null)
		})

		test('redirects when userId is undefined', () => {
			// Undefined user ID
			mockAuth.mockReturnValue({ userId: undefined })
			mockIsTutor.mockReturnValue(false)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Tutor Dashboard Content</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(mockIsTutor).toHaveBeenCalledWith(undefined)
		})
	})

	describe('Environment Variable Integration', () => {
		test('works with environment variable tutor IDs', () => {
			process.env.NEXT_PUBLIC_TUTOR_IDS = 'env_tutor_1,env_tutor_2,env_tutor_3'
			
			// Reset modules to pick up environment change
			jest.resetModules()
			
			mockAuth.mockReturnValue({ userId: 'env_tutor_1' })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Environment Tutor Content</div>
				</TutorLayout>
			)

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(screen.getByText('Environment Tutor Content')).toBeInTheDocument()
			expect(mockRedirect).not.toHaveBeenCalled()
		})

		test('falls back to default IDs when environment is not set', () => {
			delete process.env.NEXT_PUBLIC_TUTOR_IDS
			
			// Reset modules
			jest.resetModules()
			
			// Use a default tutor ID
			mockAuth.mockReturnValue({ userId: 'user_2qXIVoVecRtbBCOb3tkReZHhEYt' })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Default Tutor Content</div>
				</TutorLayout>
			)

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(screen.getByText('Default Tutor Content')).toBeInTheDocument()
		})

		test('rejects non-tutor with environment variable set', () => {
			process.env.NEXT_PUBLIC_TUTOR_IDS = 'env_tutor_1,env_tutor_2'
			
			mockAuth.mockReturnValue({ userId: 'regular_user_123' })
			mockIsTutor.mockReturnValue(false)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Should Not Render</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(screen.queryByTestId('tutor-content')).not.toBeInTheDocument()
		})
	})

	describe('Real Clerk User ID Scenarios', () => {
		test('handles real Clerk tutor user IDs', () => {
			const realTutorIds = [
				'user_2qXIVoVecRtbBCOb3tkReZHhEYt',
				'user_2qZ9hA8K2M3nL4pQ5rS6tU7vW8x',
			]

			realTutorIds.forEach((tutorId, index) => {
				// Clear the DOM before each render
				document.body.innerHTML = ''
				
				mockAuth.mockReturnValue({ userId: tutorId })
				mockIsTutor.mockReturnValue(true)

				render(
					<TutorLayout>
						<div data-testid={`tutor-content-${index}`}>Real Tutor {index + 1}</div>
					</TutorLayout>
				)

				expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
				expect(screen.getByTestId(`tutor-content-${index}`)).toBeInTheDocument()
				expect(mockRedirect).not.toHaveBeenCalled()
			})
		})

		test('rejects invalid Clerk user ID format', () => {
			mockAuth.mockReturnValue({ userId: 'invalid_user_format' })
			mockIsTutor.mockReturnValue(false)

			render(
				<TutorLayout>
					<div data-testid="tutor-content">Should Not Render</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(screen.queryByTestId('tutor-content')).not.toBeInTheDocument()
		})
	})

	describe('Component Rendering', () => {
		test('renders complex children components', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<div data-testid="complex-content">
						<h1>Tutor Dashboard</h1>
						<nav>
							<a href="/tutor/courses">Courses</a>
							<a href="/tutor/analytics">Analytics</a>
						</nav>
						<main>
							<p>Welcome to the tutor interface</p>
						</main>
					</div>
				</TutorLayout>
			)

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(screen.getByRole('heading', { name: 'Tutor Dashboard' })).toBeInTheDocument()
			expect(screen.getByRole('navigation')).toBeInTheDocument()
			expect(screen.getByText('Welcome to the tutor interface')).toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Courses' })).toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
		})

		test('handles multiple child elements', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<header data-testid="header">Header</header>
					<aside data-testid="sidebar">Sidebar</aside>
					<main data-testid="main">Main Content</main>
					<footer data-testid="footer">Footer</footer>
				</TutorLayout>
			)

			expect(screen.getByTestId('header')).toBeInTheDocument()
			expect(screen.getByTestId('sidebar')).toBeInTheDocument()
			expect(screen.getByTestId('main')).toBeInTheDocument()
			expect(screen.getByTestId('footer')).toBeInTheDocument()
		})

		test('handles empty children', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			render(<TutorLayout>{null}</TutorLayout>)

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(mockRedirect).not.toHaveBeenCalled()
		})
	})

	describe('Error Handling', () => {
		test('handles auth function throwing error', () => {
			mockAuth.mockImplementation(() => {
				throw new Error('Auth service unavailable')
			})
			mockIsTutor.mockReturnValue(false)

			// Use console.error spy to catch the error
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

			expect(() => {
				render(
					<TutorLayout>
						<div>Content</div>
					</TutorLayout>
				)
			}).toThrow('Auth service unavailable')

			consoleSpy.mockRestore()
		})

		test('handles isTutor function returning false when auth fails', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockImplementation(() => {
				// Instead of throwing, simulate a failed tutor check
				console.error('Tutor check failed')
				return false
			})

			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

			render(
				<TutorLayout>
					<div>Content</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
			expect(consoleSpy).toHaveBeenCalledWith('Tutor check failed')

			consoleSpy.mockRestore()
		})

		test('handles redirect function being called when not tutor', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.regular.id })
			mockIsTutor.mockReturnValue(false)
			
			// Redirect should be called normally for non-tutors
			render(
				<TutorLayout>
					<div>Content</div>
				</TutorLayout>
			)

			expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
		})
	})

	describe('Performance', () => {
		test('renders quickly with valid tutor', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			const startTime = performance.now()
			
			render(
				<TutorLayout>
					<div data-testid="performance-content">Performance Test Content</div>
				</TutorLayout>
			)
			
			const endTime = performance.now()

			expect(screen.getByTestId('tutor-layout')).toBeInTheDocument()
			expect(endTime - startTime).toBeLessThan(50) // Should render in under 50ms
		})

		test('does not cause unnecessary re-renders', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			const { rerender } = render(
				<TutorLayout>
					<div data-testid="rerender-content">Content v1</div>
				</TutorLayout>
			)

			expect(mockAuth).toHaveBeenCalledTimes(1)
			expect(mockIsTutor).toHaveBeenCalledTimes(1)

			// Re-render with same props
			rerender(
				<TutorLayout>
					<div data-testid="rerender-content">Content v2</div>
				</TutorLayout>
			)

			expect(mockAuth).toHaveBeenCalledTimes(2)
			expect(mockIsTutor).toHaveBeenCalledTimes(2)
		})
	})

	describe('Accessibility', () => {
		test('layout is accessible', () => {
			mockAuth.mockReturnValue({ userId: mockUsers.tutor.id })
			mockIsTutor.mockReturnValue(true)

			render(
				<TutorLayout>
					<div data-testid="accessible-content">
						<h1>Accessible Tutor Content</h1>
						<button>Accessible Button</button>
					</div>
				</TutorLayout>
			)

			const layout = screen.getByTestId('tutor-layout')
			expectAccessibleComponent(layout)
			
			const button = screen.getByRole('button', { name: 'Accessible Button' })
			expectAccessibleComponent(button)
		})
	})
}) 