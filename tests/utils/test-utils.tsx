import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { setupAuth, resetAuthMocks } from '../mocks/clerk'
import { resetDatabaseMocks } from '../mocks/prisma'

// Mock providers that wrap components in tests
interface AllTheProvidersProps {
	children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				staleTime: 0,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				forcedTheme="dark"
				storageKey="test-theme"
			>
				{children}
			</ThemeProvider>
		</QueryClientProvider>
	)
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	userType?: 'regular' | 'tutor' | 'team' | 'board' | 'verified' | null
	initialRoute?: string
}

// Custom render function with providers
const customRender = (
	ui: ReactElement,
	options: CustomRenderOptions = {}
): RenderResult => {
	const { userType = null, initialRoute = '/', ...renderOptions } = options

	// Set up authentication for the test
	if (userType) {
		setupAuth(userType)
	} else {
		resetAuthMocks()
	}

	// Mock window.location if needed
	if (initialRoute !== '/') {
		Object.defineProperty(window, 'location', {
			value: {
				...window.location,
				pathname: initialRoute,
			},
			writable: true,
		})
	}

	return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Setup function for common test scenarios
export const setupTest = (userType: CustomRenderOptions['userType'] = null) => {
	// Clear any previous test state first
	jest.clearAllMocks()
	
	// Reset all mocks
	resetAuthMocks()
	resetDatabaseMocks()

	// Set up auth state if user type provided
	if (userType) {
		setupAuth(userType)
	}
}

// Helper to wait for async operations
export const waitForAsync = () =>
	new Promise((resolve) => setTimeout(resolve, 0))

// Helper to create mock functions with specific return values
export const createMockFunction = <T extends (...args: any[]) => any>(
	implementation?: T
) => {
	const mockFn = jest.fn()
	if (implementation) {
		mockFn.mockImplementation(implementation)
	}
	return mockFn as unknown as jest.MockedFunction<T>
}

// Helper to create mock fetch responses
export const createMockFetchResponse = (data: any, status = 200) => {
	return Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(data),
		text: () => Promise.resolve(JSON.stringify(data)),
	} as Response)
}

// Helper to assert component accessibility
export const expectAccessibleComponent = (element: HTMLElement) => {
	// Check for basic accessibility attributes
	if (element.tagName === 'BUTTON') {
		expect(element.hasAttribute('disabled')).toBe(false)
		if (!element.textContent?.trim()) {
			expect(element.hasAttribute('aria-label')).toBe(true)
		}
	}

	if (element.tagName === 'INPUT') {
		const label = element.closest('label') || 
			document.querySelector(`label[for="${element.id}"]`)
		expect(label || element.hasAttribute('aria-label')).toBeTruthy()
	}

	// Check for sufficient color contrast (basic check)
	const computedStyle = window.getComputedStyle(element)
	const backgroundColor = computedStyle.backgroundColor
	const color = computedStyle.color
	
	// Basic contrast check - ensure text is not invisible
	// Only check if both colors are actually defined and not empty/transparent
	if (backgroundColor && color && 
		backgroundColor !== 'rgba(0, 0, 0, 0)' && 
		backgroundColor !== 'transparent' &&
		color !== 'rgba(0, 0, 0, 0)' && 
		color !== 'transparent') {
		expect(backgroundColor).not.toBe(color)
	}
}

// Helper to simulate user interactions
export const testUserEvent = {
	click: async (element: HTMLElement) => {
		const { fireEvent } = await import('@testing-library/react')
		fireEvent.click(element)
		await waitForAsync()
	},
	type: async (element: HTMLElement, text: string) => {
		const { fireEvent } = await import('@testing-library/react')
		fireEvent.change(element, { target: { value: text } })
		await waitForAsync()
	},
	submit: async (form: HTMLElement) => {
		const { fireEvent } = await import('@testing-library/react')
		fireEvent.submit(form)
		await waitForAsync()
	},
}

// Helper to test different user roles
export const testWithUserRoles = (
	testName: string,
	testFn: (userType: string) => void | Promise<void>
) => {
	const userTypes = ['regular', 'tutor', 'team', 'board', 'verified']
	
	userTypes.forEach((userType) => {
		test(`${testName} - ${userType} user`, async () => {
			setupTest(userType as any)
			await testFn(userType)
		})
	})
}

// Helper to test responsive design
export const testResponsiveDesign = (component: ReactElement) => {
	const viewports = [
		{ width: 320, height: 568 }, // Mobile
		{ width: 768, height: 1024 }, // Tablet
		{ width: 1920, height: 1080 }, // Desktop
	]

	return viewports.map(({ width, height }) => {
		// Mock window dimensions
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: width,
		})
		Object.defineProperty(window, 'innerHeight', {
			writable: true,
			configurable: true,
			value: height,
		})

		// Trigger resize event
		window.dispatchEvent(new Event('resize'))

		return customRender(component)
	})
}

// Export everything needed for tests
export * from '@testing-library/react'
export { customRender as render }
export {
	setupAuth,
	resetAuthMocks,
} from '../mocks/clerk'
export { setupDatabaseMocks, createMockPrismaClient, resetDatabaseMocks } from '../mocks/prisma'
export { default as userEvent } from '@testing-library/user-event' 