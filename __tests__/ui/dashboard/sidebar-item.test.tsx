import React from 'react'
import { screen } from '@testing-library/react'
import { Home, Settings } from 'lucide-react'
import { SidebarItem } from '../../../app/(dashboard)/_components/sidebar-item'
import {
	render,
	setupTest,
	expectAccessibleComponent,
	userEvent,
} from '../../../tests/utils/test-utils'

// Import mocks
import '../../../tests/mocks/clerk'
import '../../../tests/mocks/prisma'

// Mock the database using relative path
jest.mock('../../../lib/db', () => ({
	db: {
		profile: { findUnique: jest.fn() },
	},
}))

describe('SidebarItem Component', () => {
	const defaultProps = {
		icon: Home,
		label: 'Dashboard',
		href: '/dashboard',
	}

	beforeEach(() => {
		setupTest()
	})

	describe('Basic Rendering', () => {
		test('renders sidebar item with correct label and icon', () => {
			render(<SidebarItem {...defaultProps} />)

			expect(screen.getByText('Dashboard')).toBeInTheDocument()
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		test('renders with different icons and labels', () => {
			render(
				<SidebarItem
					icon={Settings}
					label="Settings"
					href="/settings"
				/>
			)

			expect(screen.getByText('Settings')).toBeInTheDocument()
			expect(screen.getByRole('button')).toBeInTheDocument()
		})

		test('renders button with correct type', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'button')
		})
	})

	describe('Active State', () => {
		test('shows active state when pathname exactly matches href', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('text-purple-500')
			expect(button).toHaveClass('bg-n-8')
		})

		test('shows active state when pathname starts with href (nested routes)', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard/settings')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('text-purple-500')
			expect(button).toHaveClass('bg-n-8')
		})

		test('shows active state for root dashboard route specifically', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			render(
				<SidebarItem
					icon={Home}
					label="Dashboard"
					href="/dashboard"
				/>
			)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('text-purple-500')
			expect(button).toHaveClass('bg-n-8')
		})

		test('does not show active state for different routes', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/profile')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).not.toHaveClass('text-purple-500')
			expect(button).not.toHaveClass('bg-n-8')
			expect(button).toHaveClass('text-slate-500')
		})

		test('handles null pathname gracefully', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue(null)

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('text-slate-500')
		})
	})

	describe('Hover States', () => {
		test('applies correct hover classes to inactive items', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/other-route')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('hover:text-slate-500')
			expect(button).toHaveClass('hover:bg-n-6')
		})

		test('applies correct hover classes to active items', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('hover:bg-n-8')
			expect(button).toHaveClass('hover:text-purple-600')
		})
	})

	describe('Navigation Functionality', () => {
		test('navigates to correct href when clicked', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			await userEvent.click(button)

			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})

		test('calls onClick callback when provided', async () => {
			const mockOnClick = jest.fn()
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(<SidebarItem {...defaultProps} onClick={mockOnClick} />)

			const button = screen.getByRole('button')
			await userEvent.click(button)

			expect(mockOnClick).toHaveBeenCalledTimes(1)
			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})

		test('navigates even when onClick is not provided', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(<SidebarItem {...defaultProps} onClick={undefined} />)

			const button = screen.getByRole('button')
			await userEvent.click(button)

			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})

		test('handles navigation with complex routes', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(
				<SidebarItem
					icon={Settings}
					label="User Settings"
					href="/profile/settings/account"
				/>
			)

			const button = screen.getByRole('button')
			await userEvent.click(button)

			expect(mockPush).toHaveBeenCalledWith('/profile/settings/account')
		})
	})

	describe('Accessibility', () => {
		test('sidebar item is accessible', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expectAccessibleComponent(button)
		})

		test('has proper button semantics', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('type', 'button')
			expect(button).toBeEnabled()
		})

		test('is keyboard accessible', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			
			// Focus the button
			button.focus()
			expect(document.activeElement).toBe(button)

			// Press Enter
			await userEvent.keyboard('{Enter}')
			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})

		test('is focusable and follows tab order', async () => {
			render(
				<div>
					<SidebarItem {...defaultProps} />
					<SidebarItem
						icon={Settings}
						label="Settings"
						href="/settings"
					/>
				</div>
			)

			const buttons = screen.getAllByRole('button')
			
			// First button should be focusable
			buttons[0].focus()
			expect(document.activeElement).toBe(buttons[0])

			// Should be able to tab to next button
			await userEvent.tab()
			expect(document.activeElement).toBe(buttons[1])
		})
	})

	describe('Visual Indicator', () => {
		test('shows active indicator for current route', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			const indicator = button.querySelector('.opacity-100')
			
			expect(indicator).toBeInTheDocument()
			expect(indicator).toHaveClass('border-purple-600')
		})

		test('hides indicator for inactive routes', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/other-route')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			const indicator = button.querySelector('.opacity-0')
			
			expect(indicator).toBeInTheDocument()
		})
	})

	describe('Icon Styling', () => {
		test('applies correct icon styling for active state', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/dashboard')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			const iconContainer = button.querySelector('svg')?.parentElement
			
			expect(iconContainer?.querySelector('svg')).toHaveClass('text-purple-500')
		})

		test('applies correct icon styling for inactive state', () => {
			const mockUsePathname = jest.requireMock('next/navigation').usePathname
			mockUsePathname.mockReturnValue('/other-route')

			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			const iconContainer = button.querySelector('svg')?.parentElement
			
			expect(iconContainer?.querySelector('svg')).toHaveClass('text-slate-500')
		})
	})

	describe('Layout and Styling', () => {
		test('has correct layout classes', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('flex')
			expect(button).toHaveClass('items-center')
			expect(button).toHaveClass('gap-x-2')
			expect(button).toHaveClass('pl-6')
		})

		test('has correct transition classes', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			expect(button).toHaveClass('transition-all')
		})

		test('maintains consistent spacing', () => {
			render(<SidebarItem {...defaultProps} />)

			const button = screen.getByRole('button')
			const innerDiv = button.querySelector('.py-4')
			
			expect(innerDiv).toBeInTheDocument()
			expect(innerDiv).toHaveClass('gap-x-2')
		})
	})

	describe('Edge Cases', () => {
		test('handles empty label gracefully', () => {
			render(
				<SidebarItem
					icon={Home}
					label=""
					href="/dashboard"
				/>
			)

			const button = screen.getByRole('button')
			expect(button).toBeInTheDocument()
		})

		test('handles very long labels', () => {
			const longLabel = 'This is a very long label that should still render correctly without breaking the layout'
			
			render(
				<SidebarItem
					icon={Home}
					label={longLabel}
					href="/dashboard"
				/>
			)

			const button = screen.getByRole('button')
			expect(screen.getByText(longLabel)).toBeInTheDocument()
			expect(button).toBeInTheDocument()
		})

		test('handles special characters in href', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(
				<SidebarItem
					icon={Home}
					label="Special Route"
					href="/route-with-special-chars?param=value&other=123"
				/>
			)

			const button = screen.getByRole('button')
			await userEvent.click(button)

			expect(mockPush).toHaveBeenCalledWith('/route-with-special-chars?param=value&other=123')
		})

		test('handles undefined onClick without errors', async () => {
			const mockPush = jest.fn()
			const mockUseRouter = jest.requireMock('next/navigation').useRouter
			mockUseRouter.mockReturnValue({ push: mockPush })

			render(<SidebarItem {...defaultProps} onClick={undefined} />)

			const button = screen.getByRole('button')
			
			await userEvent.click(button)
			expect(mockPush).toHaveBeenCalledWith('/dashboard')
		})
	})

	describe('Performance', () => {
		test('renders quickly', () => {
			const startTime = performance.now()
			render(<SidebarItem {...defaultProps} />)
			const endTime = performance.now()

			expect(endTime - startTime).toBeLessThan(50)
		})

		test('re-renders efficiently when props change', () => {
			const { rerender } = render(<SidebarItem {...defaultProps} />)

			const startTime = performance.now()
			rerender(
				<SidebarItem
					icon={Settings}
					label="Settings"
					href="/settings"
				/>
			)
			const endTime = performance.now()

			expect(endTime - startTime).toBeLessThan(50)
		})
	})
}) 