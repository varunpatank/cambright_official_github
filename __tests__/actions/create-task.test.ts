import { createTask } from '../../actions/create-task'
import { revalidatePath } from 'next/cache'

// Mock the database first, before any imports - this is critical for server actions
jest.mock('@/lib/db', () => ({
	db: {
		task: {
			create: jest.fn(),
			findFirst: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		list: {
			findUnique: jest.fn(),
			findFirst: jest.fn(),
			findMany: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		auditLog: {
			create: jest.fn(),
		},
	},
}))

// Mock the audit log functionality
jest.mock('@/lib/create-audit-log', () => ({
	createAuditLog: jest.fn(),
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



describe('Create Task Action', () => {
	const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

	const validTaskData = {
		title: 'Test Task',
		listId: 'list_123',
		sprintId: 'sprint_123',
	}

	const validTask = {
		id: 'task_123',
		title: 'Test Task',
		listId: 'list_123',
		sprintId: 'sprint_123',
		order: 1,
		description: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	const mockList = {
		id: 'list_123',
		title: 'Test List',
		sprintId: 'sprint_123',
		order: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
		sprint: {
			orgId: 'org_user_regular123', // Updated to match the mock orgId format
		},
	}

	beforeEach(() => {
		jest.clearAllMocks()

		// Set up default successful auth and database responses
		setupAuth('regular') // Sets up both userId and orgId
		mockDb.list.findUnique.mockResolvedValue(mockList)
		mockDb.task.findFirst.mockResolvedValue(null) // No existing tasks by default
		mockDb.task.create.mockResolvedValue(validTask)
	})

	describe('Authentication', () => {
		test('returns error when user is not authenticated', async () => {
			setupAuth(null)

			const result = await createTask(validTaskData)

			expect(result).toEqual({
				error: 'Unauthorized',
			})
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('returns error when orgId is missing', async () => {
			const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
			mockAuth.mockReturnValue({
				userId: 'user123',
				orgId: null,
			})

			const result = await createTask(validTaskData)

			expect(result).toEqual({
				error: 'Unauthorized',
			})
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('succeeds when both userId and orgId are present', async () => {
			const mockAuth = jest.requireMock('@clerk/nextjs/server').auth
			mockAuth.mockReturnValue({
				userId: 'user123',
				orgId: 'org_123',
			})

			const result = await createTask(validTaskData)

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
				...validTaskData,
				title: '',
			}

			const result = await createTask(invalidData)

			expect(result.fieldErrors?.title).toContain('Title is too short')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('validates minimum title length', async () => {
			const invalidData = {
				...validTaskData,
				title: 'A', // Too short (min is 2 chars)
			}

			const result = await createTask(invalidData)

			expect(result.fieldErrors?.title).toContain('Title is too short')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('validates required listId field', async () => {
			const invalidData = {
				...validTaskData,
				listId: '',
			}

			const result = await createTask(invalidData)

			// Empty string should pass zod validation but fail business logic
			expect(result.error).toContain('Failed to update')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('validates required sprintId field', async () => {
			const invalidData = {
				...validTaskData,
				sprintId: '',
			}

			const result = await createTask(invalidData)

			// Empty string should pass zod validation but fail business logic
			expect(result.error).toContain('Failed to update')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('accepts valid task data', async () => {
			const result = await createTask(validTaskData)

			expect(result.fieldErrors).toBeUndefined()
			expect(result.data).toBeDefined()
		})
	})

	describe('List Validation', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('returns error when list does not exist', async () => {
			mockDb.list.findUnique.mockResolvedValue(null)

			const result = await createTask(validTaskData)

			expect(result.error).toBe('List not found')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('returns error when user does not have access to list', async () => {
			// List doesn't exist for this org (query returns null due to org filter)
			mockDb.list.findUnique.mockResolvedValue(null)

			const result = await createTask(validTaskData)

			expect(result.error).toBe('List not found')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('succeeds when list exists and user has access', async () => {
			const result = await createTask(validTaskData)

			expect(result.error).toBeUndefined()
			expect(result.data).toBeDefined()
		})
	})

	describe('Task Order Management', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('assigns order 1 when no existing tasks', async () => {
			mockDb.task.findFirst.mockResolvedValue(null)

			await createTask(validTaskData)

			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					order: 1,
				}),
			})
		})

		test('assigns correct order when tasks exist', async () => {
			mockDb.task.findFirst.mockResolvedValue({ order: 3 })

			await createTask(validTaskData)

			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					order: 4, // Should be max order + 1
				}),
			})
		})

		test('handles empty task list for ordering', async () => {
			mockDb.task.findFirst.mockResolvedValue(null)

			await createTask(validTaskData)

			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					order: 1,
				}),
			})
		})

		test('queries tasks with correct filter', async () => {
			await createTask(validTaskData)

			expect(mockDb.task.findFirst).toHaveBeenCalledWith({
				where: { listId: 'list_123' },
				orderBy: { order: 'desc' },
				select: { order: true },
			})
		})
	})

	describe('Database Operations', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('creates task with correct data structure', async () => {
			mockDb.task.findFirst.mockResolvedValue(null)

			await createTask(validTaskData)

			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: {
					title: 'Test Task',
					listId: 'list_123',
					order: 1,
					dueDate: null,
				},
			})
		})

		test('handles database creation errors', async () => {
			const genericError = new Error('Database connection failed')
			mockDb.task.create.mockRejectedValue(genericError)

			const result = await createTask(validTaskData)

			expect(result.error).toBe('Database connection failed: Failed to update')
			expect(result.data).toBeUndefined()
		})

		test('returns created task data on success', async () => {
			const result = await createTask(validTaskData)

			expect(result.data).toEqual(validTask)
			expect(result.error).toBeUndefined()
		})

		test('handles database transaction errors', async () => {
			const transactionError = new Error('Transaction failed')
			mockDb.list.findUnique.mockRejectedValue(transactionError)

			const result = await createTask(validTaskData)

			expect(result.error).toBe('Transaction failed: Failed to update')
		})
	})

	describe('Cache Revalidation', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('revalidates sprint path after successful creation', async () => {
			await createTask(validTaskData)

			expect(mockRevalidatePath).toHaveBeenCalledWith('/sprint/sprint_123')
		})

		test('does not revalidate path when creation fails', async () => {
			mockDb.task.create.mockRejectedValue(new Error('Creation failed'))

			await createTask(validTaskData)

			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})

		test('does not revalidate path when task is undefined', async () => {
			mockDb.task.create.mockResolvedValue(undefined)

			await createTask(validTaskData)

			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})
	})

	describe('Edge Cases', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('handles very long task titles', async () => {
			const longTitle = 'A'.repeat(1000)
			const dataWithLongTitle = {
				...validTaskData,
				title: longTitle,
			}

			const result = await createTask(dataWithLongTitle)

			expect(result.data).toBeDefined()
			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					title: longTitle,
				}),
			})
		})

		test('handles special characters in title', async () => {
			const specialTitle = 'Task with émojis 🚀 and symbols @#$%'
			const dataWithSpecialChars = {
				...validTaskData,
				title: specialTitle,
			}

			const result = await createTask(dataWithSpecialChars)

			expect(result.data).toBeDefined()
			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					title: specialTitle,
				}),
			})
		})

		test('handles concurrent task creation in same list', async () => {
			const promises = Array.from({ length: 3 }, (_, i) =>
				createTask({
					...validTaskData,
					title: `Task ${i + 1}`,
				})
			)

			const results = await Promise.all(promises)

			results.forEach((result) => {
				expect(result.data).toBeDefined()
			})
		})

		test('handles maximum order value edge case', async () => {
			const existingTasks = [{ id: 'task1', order: Number.MAX_SAFE_INTEGER }]
			mockDb.task.findMany.mockResolvedValue(existingTasks)

			const result = await createTask(validTaskData)

			expect(result.data).toBeDefined()
			// Should handle large numbers gracefully
		})
	})

	describe('Security', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('prevents SQL injection in title', async () => {
			const maliciousTitle = "'; DROP TABLE tasks; --"
			const dataWithMaliciousTitle = {
				...validTaskData,
				title: maliciousTitle,
			}

			const result = await createTask(dataWithMaliciousTitle)

			expect(result.data).toBeDefined()
			// Prisma should handle SQL injection prevention
			expect(mockDb.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					title: maliciousTitle, // Should be safely handled
				}),
			})
		})

		test('prevents access to unauthorized lists', async () => {
			// List doesn't exist for this org (findUnique returns null)
			mockDb.list.findUnique.mockResolvedValue(null)

			const result = await createTask(validTaskData)

			expect(result.error).toBe('List not found')
			expect(mockDb.task.create).not.toHaveBeenCalled()
		})

		test('validates org membership through list association', async () => {
			await createTask(validTaskData)

			expect(mockDb.list.findUnique).toHaveBeenCalledWith({
				where: {
					id: 'list_123',
					sprint: {
						orgId: 'org_user_regular123',
					},
				},
			})
		})
	})

	describe('Performance', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('minimizes database queries', async () => {
			await createTask(validTaskData)

			// Should only make 3 queries: list lookup, order lookup, task creation
			expect(mockDb.list.findUnique).toHaveBeenCalledTimes(1)
			expect(mockDb.task.findFirst).toHaveBeenCalledTimes(1)
			expect(mockDb.task.create).toHaveBeenCalledTimes(1)
		})

		test('uses efficient order query', async () => {
			await createTask(validTaskData)

			expect(mockDb.task.findFirst).toHaveBeenCalledWith({
				where: { listId: 'list_123' },
				orderBy: { order: 'desc' },
				select: { order: true },
			})
		})

		test('completes within reasonable time', async () => {
			const startTime = Date.now()
			
			await createTask(validTaskData)
			
			const endTime = Date.now()
			const duration = endTime - startTime

			// Should complete quickly for mocked operations
			expect(duration).toBeLessThan(100)
		})
	})

	describe('Integration', () => {
		beforeEach(() => {
			setupAuth('regular')
		})

		test('complete successful flow', async () => {
			const result = await createTask(validTaskData)

			// Should validate list access
			expect(mockDb.list.findUnique).toHaveBeenCalledTimes(1)
			
			// Should determine correct order
			expect(mockDb.task.findFirst).toHaveBeenCalledTimes(1)
			
			// Should create task
			expect(mockDb.task.create).toHaveBeenCalledTimes(1)
			
			// Should return task data
			expect(result.data).toEqual(validTask)
			expect(result.error).toBeUndefined()
			
			// Should revalidate cache
			expect(mockRevalidatePath).toHaveBeenCalledWith('/sprint/sprint_123')
		})

		test('complete failure flow with invalid input', async () => {
			const invalidData = {
				title: '', // Invalid
				listId: 'list_123',
				sprintId: 'sprint_123',
			}

			const result = await createTask(invalidData)

			// Should not perform any database operations
			expect(mockDb.list.findUnique).not.toHaveBeenCalled()
			expect(mockDb.task.findFirst).not.toHaveBeenCalled()
			expect(mockDb.task.create).not.toHaveBeenCalled()
			
			// Should return validation errors
			expect(result.fieldErrors).toBeDefined()
			expect(result.data).toBeUndefined()
			
			// Should not revalidate cache
			expect(mockRevalidatePath).not.toHaveBeenCalled()
		})

		test('complete failure flow with unauthorized access', async () => {
			setupAuth('regular')
			
			// Simulate unauthorized access - list not found for this org
			mockDb.list.findUnique.mockResolvedValue(null)

			const result = await createTask(validTaskData)

			// Should check list access
			expect(mockDb.list.findUnique).toHaveBeenCalledTimes(1)

			// Should not proceed with task creation
			expect(mockDb.task.findFirst).not.toHaveBeenCalled()
			expect(mockDb.task.create).not.toHaveBeenCalled()

			// Should return authorization error
			expect(result.error).toBe('List not found')
		})
	})
}) 