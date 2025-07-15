// Comprehensive Auth Helper Functions Tests
// Testing tutor access control, profile management, and account initialization

// Mock the database module FIRST - this is critical for proper module mocking
jest.mock('@/lib/db', () => ({
	db: {
		profile: {
			findUnique: jest.fn(),
			findMany: jest.fn(),
			findFirst: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		userModel: {
			findUnique: jest.fn(),
			findFirst: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}))

import { setupTest } from '../../tests/utils/test-utils'

// Import mocks
import '../../tests/mocks/clerk'
import '../../tests/mocks/prisma'
import { setupAuth, mockUsers } from '../../tests/mocks/clerk'

// Import auth helper functions AFTER the database mock
import { initialProfile } from '@/lib/initial-profile'
import { currentProfile } from '@/lib/current-profile'
import { initialAccount } from '@/lib/initial-account'

// Mock next/navigation
jest.mock('next/navigation', () => ({
	redirect: jest.fn(),
}))

describe('Authentication Helper Functions', () => {
	let originalEnv: NodeJS.ProcessEnv
	let mockDb: any

	beforeAll(() => {
		originalEnv = { ...process.env }
	})

	beforeEach(() => {
		jest.clearAllMocks()
		// Get the mocked database instance
		mockDb = jest.requireMock('@/lib/db').db
		// Reset environment variables
		process.env = { ...originalEnv }
	})

	afterAll(() => {
		// Restore original environment
		process.env = originalEnv
	})

	describe('isTutor Function - Comprehensive Tests', () => {
		beforeEach(() => {
			// Reset modules to ensure fresh imports
			jest.resetModules()
		})

		describe('Environment Variable Handling', () => {
			test('uses environment variable when properly set', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'tutor1,tutor2,tutor3'
				
				// Re-import to get updated environment
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('tutor1')).toBe(true)
				expect(isTutor('tutor2')).toBe(true)
				expect(isTutor('tutor3')).toBe(true)
				expect(isTutor('regular_user')).toBe(false)
			})

			test('falls back to default IDs when environment variable is not set', () => {
				delete process.env.NEXT_PUBLIC_TUTOR_IDS
				
				const { isTutor } = require('@/lib/tutor')
				
				// Should use default IDs from users.ts
				const result = isTutor('user_2qXIVoVecRtbBCOb3tkReZHhEYt')
				expect(result).toBe(true)
			})

			test('handles empty environment variable', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = ''
				
				const { isTutor } = require('@/lib/tutor')
				
				// Should use default IDs when env is empty
				const result = isTutor('user_2qXIVoVecRtbBCOb3tkReZHhEYt')
				expect(result).toBe(true)
			})

			test('handles whitespace-only environment variable', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = '   '
				
				const { isTutor } = require('@/lib/tutor')
				
				// Should use default IDs when env is whitespace only
				const result = isTutor('user_2qXIVoVecRtbBCOb3tkReZHhEYt')
				expect(result).toBe(true)
			})

			test('filters out empty strings from comma-separated list', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'tutor1,,tutor2, ,tutor3,'
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('tutor1')).toBe(true)
				expect(isTutor('tutor2')).toBe(true)
				expect(isTutor('tutor3')).toBe(true)
				expect(isTutor('')).toBe(false)
				expect(isTutor(' ')).toBe(false)
			})

			test('trims whitespace from tutor IDs', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = ' tutor1 , tutor2 , tutor3 '
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('tutor1')).toBe(true)
				expect(isTutor('tutor2')).toBe(true)
				expect(isTutor('tutor3')).toBe(true)
				expect(isTutor(' tutor1 ')).toBe(false) // Should not match with spaces
			})
		})

		describe('Input Validation', () => {
			beforeEach(() => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'tutor1,tutor2,tutor3'
			})

			test('returns false for null user ID', () => {
				const { isTutor } = require('@/lib/tutor')
				expect(isTutor(null)).toBe(false)
			})

			test('returns false for undefined user ID', () => {
				const { isTutor } = require('@/lib/tutor')
				expect(isTutor(undefined)).toBe(false)
			})

			test('returns false for empty string user ID', () => {
				const { isTutor } = require('@/lib/tutor')
				expect(isTutor('')).toBe(false)
			})

			test('returns false for whitespace-only user ID', () => {
				const { isTutor } = require('@/lib/tutor')
				expect(isTutor('   ')).toBe(false)
			})

			test('is case sensitive for user IDs', () => {
				const { isTutor } = require('@/lib/tutor')
				expect(isTutor('TUTOR1')).toBe(false)
				expect(isTutor('Tutor1')).toBe(false)
				expect(isTutor('tutor1')).toBe(true)
			})
		})

		describe('Real Clerk User ID Format Testing', () => {
			test('handles real Clerk user ID formats', () => {
				const realTutorIds = [
					'user_2qXIVoVecRtbBCOb3tkReZHhEYt',
					'user_2qXHtwCBBaKmicsVhGPVbuqkV8U',
					'user_2qXHFZ4aJ6zBKq82WrSIec0sSZv'
				]
				process.env.NEXT_PUBLIC_TUTOR_IDS = realTutorIds.join(',')
				
				const { isTutor } = require('@/lib/tutor')
				
				realTutorIds.forEach(tutorId => {
					expect(isTutor(tutorId)).toBe(true)
				})
				
				expect(isTutor('user_invalidUserIdFormat')).toBe(false)
			})

			test('handles mixed real and test user IDs', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'user_2qXIVoVecRtbBCOb3tkReZHhEYt,tutor1,user_2qXHtwCBBaKmicsVhGPVbuqkV8U'
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('user_2qXIVoVecRtbBCOb3tkReZHhEYt')).toBe(true)
				expect(isTutor('tutor1')).toBe(true)
				expect(isTutor('user_2qXHtwCBBaKmicsVhGPVbuqkV8U')).toBe(true)
				expect(isTutor('regular_user')).toBe(false)
			})
		})

		describe('Special Characters and Edge Cases', () => {
			test('handles special characters in user IDs', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'tutor-1,tutor_2,tutor.3,tutor@4'
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('tutor-1')).toBe(true)
				expect(isTutor('tutor_2')).toBe(true)
				expect(isTutor('tutor.3')).toBe(true)
				expect(isTutor('tutor@4')).toBe(true)
			})

			test('handles single tutor ID', () => {
				process.env.NEXT_PUBLIC_TUTOR_IDS = 'single_tutor'
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('single_tutor')).toBe(true)
				expect(isTutor('other_user')).toBe(false)
			})

			test('handles very long tutor ID list', () => {
				const longList = Array.from({ length: 100 }, (_, i) => `tutor_${i}`).join(',')
				process.env.NEXT_PUBLIC_TUTOR_IDS = longList
				
				const { isTutor } = require('@/lib/tutor')
				
				expect(isTutor('tutor_0')).toBe(true)
				expect(isTutor('tutor_50')).toBe(true)
				expect(isTutor('tutor_99')).toBe(true)
				expect(isTutor('tutor_100')).toBe(false)
			})
		})

		describe('Performance and Memory', () => {
			test('function executes quickly with large tutor lists', () => {
				const largeTutorList = Array.from({ length: 10000 }, (_, i) => `tutor_${i}`).join(',')
				process.env.NEXT_PUBLIC_TUTOR_IDS = largeTutorList
				
				const { isTutor } = require('@/lib/tutor')
				
				const startTime = performance.now()
				const result = isTutor('tutor_5000')
				const endTime = performance.now()
				
				expect(result).toBe(true)
				expect(endTime - startTime).toBeLessThan(10) // Should complete in under 10ms
			})

			test('does not modify original environment variable', () => {
				const originalValue = 'tutor1,tutor2,tutor3'
				process.env.NEXT_PUBLIC_TUTOR_IDS = originalValue
				
				const { isTutor } = require('@/lib/tutor')
				
				isTutor('tutor1')
				isTutor('invalid_user')
				
				expect(process.env.NEXT_PUBLIC_TUTOR_IDS).toBe(originalValue)
			})
		})
	})

	describe('Profile Management Functions', () => {
		beforeEach(() => {
			setupTest('regular')
		})

		describe('initialProfile', () => {
			test('creates new profile for authenticated user', async () => {
				const mockProfile = {
					id: 'profile_1',
					userId: mockUsers.regular.id,
					name: mockUsers.regular.firstName + ' ' + mockUsers.regular.lastName,
					imageUrl: mockUsers.regular.imageUrl,
					email: mockUsers.regular.emailAddresses[0].emailAddress,
					rooms: [],
					members: [],
					chats: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				mockDb.profile.findUnique.mockResolvedValue(null)
				mockDb.profile.create.mockResolvedValue(mockProfile)

				const result = await initialProfile()

				expect(mockDb.profile.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(mockDb.profile.create).toHaveBeenCalledWith({
					data: {
						userId: mockUsers.regular.id,
						name: mockUsers.regular.firstName + ' ' + mockUsers.regular.lastName,
						imageUrl: mockUsers.regular.imageUrl,
						email: mockUsers.regular.emailAddresses[0].emailAddress,
					}
				})
				expect(result).toEqual(mockProfile)
			})

			test('returns existing profile if found', async () => {
				const existingProfile = {
					id: 'profile_1',
					userId: mockUsers.regular.id,
					name: 'Existing Name',
					imageUrl: mockUsers.regular.imageUrl,
					email: mockUsers.regular.emailAddresses[0].emailAddress,
				}

				mockDb.profile.findUnique.mockResolvedValue(existingProfile)

				const result = await initialProfile()

				expect(mockDb.profile.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(mockDb.profile.create).not.toHaveBeenCalled()
				expect(result).toEqual(existingProfile)
			})

			test('redirects when user is not authenticated', async () => {
				setupTest(null) // No authenticated user

				const result = await initialProfile()

				expect(result).toBeUndefined() // Should redirect instead of returning
			})
		})

		describe('currentProfile', () => {
			test('returns profile for authenticated user', async () => {
				const mockProfile = {
					id: 'profile_1',
					userId: mockUsers.regular.id,
					name: mockUsers.regular.firstName + ' ' + mockUsers.regular.lastName,
					imageUrl: mockUsers.regular.imageUrl,
					email: mockUsers.regular.emailAddresses[0].emailAddress,
				}

				mockDb.profile.findUnique.mockResolvedValue(mockProfile)

				const result = await currentProfile()

				expect(mockDb.profile.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(result).toEqual(mockProfile)
			})

			test('returns null when user is not authenticated', async () => {
				setupTest(null) // No authenticated user

				const result = await currentProfile()

				expect(mockDb.profile.findUnique).not.toHaveBeenCalled()
				expect(result).toBeNull()
			})

			test('returns null when profile does not exist', async () => {
				mockDb.profile.findUnique.mockResolvedValue(null)

				const result = await currentProfile()

				expect(mockDb.profile.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(result).toBeNull()
			})
		})

		describe('initialAccount', () => {
			test('creates new user account for authenticated user', async () => {
				const mockAccount = {
					id: 'account_1',
					userId: mockUsers.regular.id,
					name: mockUsers.regular.firstName + ' ' + mockUsers.regular.lastName,
					imageUrl: mockUsers.regular.imageUrl,
					email: mockUsers.regular.emailAddresses[0].emailAddress,
					biog: '',
					XP: 0,
					tags: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				}

				mockDb.userModel.findUnique.mockResolvedValue(null)
				mockDb.userModel.create.mockResolvedValue(mockAccount)

				const result = await initialAccount()

				expect(mockDb.userModel.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(mockDb.userModel.create).toHaveBeenCalledWith({
					data: {
						userId: mockUsers.regular.id,
						name: mockUsers.regular.firstName + ' ' + mockUsers.regular.lastName,
						imageUrl: mockUsers.regular.imageUrl,
						email: mockUsers.regular.emailAddresses[0].emailAddress,
					}
				})
				expect(result).toEqual(mockAccount)
			})

			test('returns existing account if found', async () => {
				const existingAccount = {
					id: 'account_1',
					userId: mockUsers.regular.id,
					name: 'Existing Name',
					imageUrl: mockUsers.regular.imageUrl,
					email: mockUsers.regular.emailAddresses[0].emailAddress,
					biog: 'Existing bio',
					XP: 100,
				}

				mockDb.userModel.findUnique.mockResolvedValue(existingAccount)

				const result = await initialAccount()

				expect(mockDb.userModel.findUnique).toHaveBeenCalledWith({
					where: { userId: mockUsers.regular.id }
				})
				expect(mockDb.userModel.create).not.toHaveBeenCalled()
				expect(result).toEqual(existingAccount)
			})

			test('redirects when user is not authenticated', async () => {
				setupTest(null) // No authenticated user

				const result = await initialAccount()

				expect(result).toBeUndefined() // Should redirect instead of returning
			})
		})
	})
}) 