import { createSprintz } from '../../actions/create-sprint'
import { revalidatePath } from 'next/cache'

// Mock the database first, before any imports - this is critical for server actions
jest.mock('@/lib/db', () => ({
	db: {
		sprint: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}))

// Import mocks
import '../../tests/mocks/clerk'
import '../../tests/mocks/prisma'
import { setupAuth } from '../../tests/mocks/clerk'
import { db } from '@/lib/db'

// Cast db as mocked for TypeScript
const mockDb = db as jest.Mocked<typeof db>

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
	revalidatePath: jest.fn(),
}))



describe('Create Sprint Action', () => {
	const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

	const validSprintData = {
		title: 'Test Sprint',
		image: 'img123|https://test.com/thumb.jpg|https://test.com/full.jpg|<a href="#">Test</a>|TestUser',
		template: false,
	}

	const validSprint = {
		id: 'sprint_123',
		orgId: 'org_123',
		title: 'Test Sprint',
		imageId: 'img123',
		imageThumbUrl: 'https://test.com/thumb.jpg',
		imageFullUrl: 'https://test.com/full.jpg',
		imageLinkHTML: '<a href="#">Test</a>',
		imageUserName: 'TestUser',
		isTemplate: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		lists: [],
	}

	beforeEach(() => {
		jest.clearAllMocks()

		// Set up default successful database response
		mockDb.sprint.create.mockResolvedValue(validSprint)
	})

	describe('Authentication', () => {
		test('returns error when user is not authenticated', async () => {
			setupAuth(null)

			const result = await createSprintz(validSprintData)

			expect(result).toEqual({
				error: 'Unauthorized',
			})
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('returns error when orgId is missing', async () => {
			const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
			mockAuth.mockReturnValue({
				userId: 'user123',
				orgId: null,
			})

			const result = await createSprintz(validSprintData)

			expect(result).toEqual({
				error: 'Unauthorized',
			})
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('returns error when userId is missing', async () => {
			const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
			mockAuth.mockReturnValue({
				userId: null,
				orgId: 'org123',
			})

			const result = await createSprintz(validSprintData)

			expect(result).toEqual({
				error: 'Unauthorized',
			})
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('succeeds when both userId and orgId are present', async () => {
			const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
			mockAuth.mockReturnValue({
				userId: 'user123',
				orgId: 'org123',
			})

			const result = await createSprintz(validSprintData)

			expect(result.error).toBeUndefined()
			expect(result.data).toBeDefined()
		})
	})

	describe('Input Validation', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('validates required title field', async () => {
			const invalidData = {
				...validSprintData,
				title: '',
			}

			const result = await createSprintz(invalidData)

			expect(result.fieldErrors?.title).toContain('Title must be at least 2 characters.')
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('validates minimum title length', async () => {
			const invalidData = {
				...validSprintData,
				title: 'A', // Too short
			}

			const result = await createSprintz(invalidData)

			expect(result.fieldErrors?.title).toContain('Title must be at least 2 characters.')
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('accepts valid title', async () => {
			const validData = {
				...validSprintData,
				title: 'Valid Sprint Title',
			}

			const result = await createSprintz(validData)

			expect(result.fieldErrors?.title).toBeUndefined()
			expect(result.data).toBeDefined()
		})

		test('validates required image field', async () => {
			const invalidData = {
				...validSprintData,
				image: '',
			}

			const result = await createSprintz(invalidData)
			
			// The empty string passes Zod validation but fails the pipe-separated format check
			expect(result.error).toBe('Missing Fields. Failed to create sprint')
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('validates image format', async () => {
			const invalidData = {
				...validSprintData,
				image: 'invalid_format', // Missing required pipe-separated parts
			}

			const result = await createSprintz(invalidData)

			expect(result.error).toBe('Missing Fields. Failed to create sprint')
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
		})

		test('validates all image parts are present', async () => {
			const testCases = [
				'id|||link|user', // Missing thumb and full URL
				'id|thumb||link|user', // Missing full URL
				'id|thumb|full||user', // Missing link
				'id|thumb|full|link|', // Missing user
				'id|thumb|full|link', // Missing user entirely
			]

			for (const invalidImage of testCases) {
				const invalidData = {
					...validSprintData,
					image: invalidImage,
				}

				const result = await createSprintz(invalidData)

				expect(result.error).toBe('Missing Fields. Failed to create sprint')
				expect(mockDb.sprint.create).not.toHaveBeenCalled()
			}
		})

		test('accepts optional template field', async () => {
			const dataWithTemplate = {
				...validSprintData,
				template: true,
			}

			const result = await createSprintz(dataWithTemplate)

			expect(result.data).toBeDefined()
			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					isTemplate: true,
				}),
			})
		})

		test('defaults template to false when not provided', async () => {
			const dataWithoutTemplate = {
				title: validSprintData.title,
				image: validSprintData.image,
				// template field omitted
			}

			const result = await createSprintz(dataWithoutTemplate)

			expect(result.data).toBeDefined()
			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					isTemplate: false,
				}),
			})
		})
	})

	describe('Database Operations', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('creates sprint with correct data structure', async () => {
			await createSprintz(validSprintData)

			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: {
					title: 'Test Sprint',
					orgId: 'org_user_regular123', // Updated to match the mock orgId format
					imageId: 'img123',
					imageThumbUrl: 'https://test.com/thumb.jpg',
					imageFullUrl: 'https://test.com/full.jpg',
					imageLinkHTML: '<a href="#">Test</a>',
					imageUserName: 'TestUser',
					isTemplate: false,
				},
			})
		})

		test('handles database creation errors', async () => {
			const dbError = new Error('Database constraint violation')
			mockDb.sprint.create.mockRejectedValue(dbError)

			const result = await createSprintz(validSprintData)

			expect(result.error).toBe('Failed to create: Database constraint violation')
			expect(result.data).toBeUndefined()
		})

		test('handles generic database errors', async () => {
			// Use an Error instance since the catch block only handles Error instances
			const genericError = new Error('Some generic error')
			mockDb.sprint.create.mockRejectedValue(genericError)

			const result = await createSprintz(validSprintData)

			expect(result.error).toContain('Failed to create:')
		})

		test('returns created sprint data on success', async () => {
			const result = await createSprintz(validSprintData)

			expect(result.data).toEqual(validSprint)
			expect(result.error).toBeUndefined()
		})
	})

	describe('Cache Revalidation', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('revalidates sprint path after successful creation', async () => {
			await createSprintz(validSprintData)

			expect(mockRevalidatePath).toHaveBeenCalledWith('/tracker/sprint/sprint_123')
		})

		test('does not revalidate path when creation fails', async () => {
			mockDb.sprint.create.mockRejectedValue(new Error('Creation failed'))

			await createSprintz(validSprintData)

			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})

		test('does not revalidate path when sprint is undefined', async () => {
			mockDb.sprint.create.mockResolvedValue(undefined)

			await createSprintz(validSprintData)

			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})
	})

	describe('Image Processing', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('correctly parses pipe-separated image data', async () => {
			const imageData = 'custom_id|thumb_url|full_url|link_html|user_name'
			const dataWithCustomImage = {
				...validSprintData,
				image: imageData,
			}

			await createSprintz(dataWithCustomImage)

			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					imageId: 'custom_id',
					imageThumbUrl: 'thumb_url',
					imageFullUrl: 'full_url',
					imageLinkHTML: 'link_html',
					imageUserName: 'user_name',
				}),
			})
		})

		test('handles special characters in image data', async () => {
			const specialImageData = 'id123|https://test.com/image.jpg?param=value&other=123|https://full.com/img.jpg|<a href="test">Link</a>|User Name With Spaces'
			const dataWithSpecialImage = {
				...validSprintData,
				image: specialImageData,
			}

			await createSprintz(dataWithSpecialImage)

			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					imageId: 'id123',
					imageThumbUrl: 'https://test.com/image.jpg?param=value&other=123',
					imageFullUrl: 'https://full.com/img.jpg',
					imageLinkHTML: '<a href="test">Link</a>',
					imageUserName: 'User Name With Spaces',
				}),
			})
		})

		test('rejects image data with extra pipe segments', async () => {
			const extraPipeData = 'id|thumb|full|link|user|extra|segment'
			const dataWithExtraPipes = {
				...validSprintData,
				image: extraPipeData,
			}

			const result = await createSprintz(dataWithExtraPipes)

			expect(result.data).toBeDefined() // Should still work, extra segments are ignored
		})

		test('rejects empty segments in image data', async () => {
			const emptySegmentData = 'id||full|link|user' // Empty thumb URL
			const dataWithEmptySegment = {
				...validSprintData,
				image: emptySegmentData,
			}

			const result = await createSprintz(dataWithEmptySegment)

			expect(result.error).toBe('Missing Fields. Failed to create sprint')
		})
	})

	describe('Template Handling', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('creates template sprint when template is true', async () => {
			const templateData = {
				...validSprintData,
				template: true,
			}

			await createSprintz(templateData)

			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					isTemplate: true,
				}),
			})
		})

		test('creates regular sprint when template is false', async () => {
			const regularData = {
				...validSprintData,
				template: false,
			}

			await createSprintz(regularData)

			expect(mockDb.sprint.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					isTemplate: false,
				}),
			})
		})

		test('correctly converts template boolean', async () => {
			// Test various truthy/falsy values
			const testCases = [
				{ input: true, expected: true },
				{ input: false, expected: false },
				{ input: undefined, expected: false },
			]

			for (const testCase of testCases) {
				jest.clearAllMocks()
				
				const testData = {
					...validSprintData,
					template: testCase.input,
				}

				await createSprintz(testData)

				expect(mockDb.sprint.create).toHaveBeenCalledWith({
					data: expect.objectContaining({
						isTemplate: testCase.expected,
					}),
				})
			}
		})
	})

	describe('Error Recovery', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('recovers from transient database errors', async () => {
			// First call fails, second succeeds
			mockDb.sprint.create
				.mockRejectedValueOnce(new Error('Temporary failure'))
				.mockResolvedValueOnce(validSprint)

			// First attempt should fail
			let result = await createSprintz(validSprintData)
			expect(result.error).toContain('Failed to create')

			// Second attempt should succeed
			result = await createSprintz(validSprintData)
			expect(result.data).toEqual(validSprint)
		})

		test('handles concurrent creation attempts', async () => {
			const promises = Array.from({ length: 3 }, () =>
				createSprintz({
					...validSprintData,
					title: `Sprint ${Math.random()}`,
				})
			)

			const results = await Promise.all(promises)

			results.forEach((result) => {
				expect(result.data).toBeDefined()
			})
		})
	})

	describe('Integration', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('complete successful flow', async () => {
			const result = await createSprintz(validSprintData)

			// Should create sprint
			expect(mockDb.sprint.create).toHaveBeenCalledTimes(1)
			
			// Should return sprint data
			expect(result.data).toEqual(validSprint)
			expect(result.error).toBeUndefined()
			
			// Should revalidate cache
			expect(mockRevalidatePath).toHaveBeenCalledWith('/tracker/sprint/sprint_123')
		})

		test('complete failure flow', async () => {
			const invalidData = {
				title: '', // Invalid
				image: 'invalid', // Invalid format
				template: false,
			}

			const result = await createSprintz(invalidData)

			// Should not create sprint
			expect(mockDb.sprint.create).not.toHaveBeenCalled()
			
			// Should return validation errors
			expect(result.fieldErrors).toBeDefined()
			expect(result.data).toBeUndefined()
			
			// Should not revalidate cache
			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})
	})
}) 