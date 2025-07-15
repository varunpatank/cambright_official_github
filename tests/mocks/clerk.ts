import React from 'react'

export const mockUsers = {
	regular: {
		id: 'user_regular123',
		username: 'regularuser',
		firstName: 'Regular',
		lastName: 'User',
		emailAddresses: [{ emailAddress: 'regular@test.com' }],
		imageUrl: 'https://test.com/regular.jpg',
	},
	tutor: {
		id: 'tutor1',
		username: 'tutoruser',
		firstName: 'Tutor',
		lastName: 'User',
		emailAddresses: [{ emailAddress: 'tutor@test.com' }],
		imageUrl: 'https://test.com/tutor.jpg',
	},
	team: {
		id: 'team1',
		username: 'teamuser',
		firstName: 'Team',
		lastName: 'Member',
		emailAddresses: [{ emailAddress: 'team@test.com' }],
		imageUrl: 'https://test.com/team.jpg',
	},
	board: {
		id: 'board1',
		username: 'boarduser',
		firstName: 'Board',
		lastName: 'Member',
		emailAddresses: [{ emailAddress: 'board@test.com' }],
		imageUrl: 'https://test.com/board.jpg',
	},
	verified: {
		id: 'verified1',
		username: 'verifieduser',
		firstName: 'Verified',
		lastName: 'User',
		emailAddresses: [{ emailAddress: 'verified@test.com' }],
		imageUrl: 'https://test.com/verified.jpg',
	},
}

export const createMockAuth = (userType: keyof typeof mockUsers | null = null) => ({
	userId: userType ? mockUsers[userType].id : null,
	orgId: userType ? `org_${mockUsers[userType].id}` : null, // Add orgId for server actions
	redirectToSignIn: jest.fn(),
})

export const createMockCurrentUser = (userType: keyof typeof mockUsers | null = null) =>
	userType ? mockUsers[userType] : null

// Mock for @clerk/nextjs/server
jest.mock('@clerk/nextjs/server', () => ({
	auth: jest.fn(() => createMockAuth()),
	currentUser: jest.fn(() => Promise.resolve(createMockCurrentUser())),
	redirectToSignIn: jest.fn(),
}))

// Mock for @clerk/nextjs (client components)
jest.mock('@clerk/nextjs', () => ({
	useAuth: jest.fn(() => createMockAuth()),
	useUser: jest.fn(() => ({
		user: createMockCurrentUser(),
		isLoaded: true,
		isSignedIn: true,
	})),
	UserButton: ({ children, ...props }: any) => 
		React.createElement('div', { 'data-testid': 'user-button', ...props }, children),
	SignInButton: ({ children, ...props }: any) => 
		React.createElement('button', { 'data-testid': 'sign-in-button', ...props }, children || 'Sign In'),
	SignUpButton: ({ children, ...props }: any) => 
		React.createElement('button', { 'data-testid': 'sign-up-button', ...props }, children || 'Sign Up'),
	ClerkProvider: ({ children }: any) => 
		React.createElement('div', { 'data-testid': 'clerk-provider' }, children),
}))

// Helper function to set up auth state for tests
export const setupAuth = (userType: keyof typeof mockUsers | null = null) => {
	const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
	const mockCurrentUser = jest.requireMock('@clerk/nextjs/server').currentUser
	const mockUseAuth = jest.requireMock('@clerk/nextjs').useAuth
	const mockUseUser = jest.requireMock('@clerk/nextjs').useUser

	mockAuth.mockReturnValue(createMockAuth(userType))
	mockCurrentUser.mockResolvedValue(createMockCurrentUser(userType))
	mockUseAuth.mockReturnValue(createMockAuth(userType))
	mockUseUser.mockReturnValue({
		user: createMockCurrentUser(userType),
		isLoaded: true,
		isSignedIn: !!userType,
	})
}

// Helper to reset all auth mocks
export const resetAuthMocks = () => {
	jest.clearAllMocks()
	setupAuth(null)
} 