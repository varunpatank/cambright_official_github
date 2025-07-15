import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
		refresh: jest.fn(),
	})),
	useSearchParams: jest.fn(() => ({
		get: jest.fn(),
		getAll: jest.fn(),
		has: jest.fn(),
		toString: jest.fn(),
	})),
	usePathname: jest.fn(() => '/test-path'),
	useParams: jest.fn(() => ({})),
	redirect: jest.fn(),
	notFound: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
	__esModule: true,
	default: (props) => {
		// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
		return <img {...props} />
	},
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => () => {
	const DynamicComponent = () => null
	DynamicComponent.displayName = 'LoadableComponent'
	DynamicComponent.preload = jest.fn()
	return DynamicComponent
})

// Mock Clerk server-side modules
jest.mock('@clerk/nextjs/server', () => ({
	auth: jest.fn(() => ({ userId: null, orgId: null })),
	currentUser: jest.fn(() => null),
	clerkClient: {
		users: {
			getUser: jest.fn(),
			getUserList: jest.fn(),
		},
		organizations: {
			getOrganization: jest.fn(),
		},
	},
}))

// Mock environment variables
process.env = {
	...process.env,
	NODE_ENV: 'test',
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-clerk-key',
	CLERK_SECRET_KEY: 'test-clerk-secret',
	DATABASE_URL: 'test-database-url',
	GOOGLE_GEMINI_API: 'test-gemini-api-key',
	NEXT_PUBLIC_TUTOR_IDS: 'tutor1,tutor2,tutor3',
	NEXT_PUBLIC_VERIFIED_IDS: 'verified1,verified2',
	NEXT_PUBLIC_TEAM_IDS: 'team1,team2',
	NEXT_PUBLIC_BOARD_IDS: 'board1,board2',
	NEXT_PUBLIC_BOT_IDS: 'bot1,bot2',
}

// Mock console methods to reduce noise in tests
global.console = {
	...console,
	// uncomment to ignore a specific log level
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	warn: jest.fn(),
	// error: jest.fn(),
}

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
})

// Mock fetch
global.fetch = jest.fn()

// Mock window.location
delete window.location
window.location = {
	href: 'http://localhost:3000',
	origin: 'http://localhost:3000',
	protocol: 'http:',
	host: 'localhost:3000',
	hostname: 'localhost',
	port: '3000',
	pathname: '/',
	search: '',
	hash: '',
	assign: jest.fn(),
	replace: jest.fn(),
	reload: jest.fn(),
}

// Increase timeout for async tests
jest.setTimeout(30000) 