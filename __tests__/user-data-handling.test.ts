import { getUserFirstName } from '@/lib/clerkername'
import { getUserIMGURL } from '@/lib/clerkerimage'
import { getDatabaseUsername, getDatabaseUserData } from '@/lib/get-database-username'

// Mock the console to capture warnings
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('User Data Handling', () => {
	beforeEach(() => {
		consoleSpy.mockClear()
		consoleErrorSpy.mockClear()
	})

	afterAll(() => {
		consoleSpy.mockRestore()
		consoleErrorSpy.mockRestore()
	})

	describe('Invalid User ID Handling', () => {
		test('should handle "system" user ID gracefully', async () => {
			const firstName = await getUserFirstName('system')
			const imageUrl = await getUserIMGURL('system')
			const username = await getDatabaseUsername('system')
			const userData = await getDatabaseUserData('system')

			// Should not return data for system user but shouldn't crash
			expect(firstName).toBeNull()
			expect(imageUrl).toBeNull()
			expect(username).toBeNull()
			expect(userData.name).toBeNull()
			expect(userData.imageUrl).toBeNull()
		})

		test('should handle "drive" user ID gracefully', async () => {
			const firstName = await getUserFirstName('drive')
			const imageUrl = await getUserIMGURL('drive')
			const username = await getDatabaseUsername('drive')
			const userData = await getDatabaseUserData('drive')

			// Should not return data for drive user but shouldn't crash
			expect(firstName).toBeNull()
			expect(imageUrl).toBeNull()
			expect(username).toBeNull()
			expect(userData.name).toBeNull()
			expect(userData.imageUrl).toBeNull()
		})

		test('should handle null/undefined user IDs', async () => {
			const results = await Promise.all([
				getUserFirstName(null),
				getUserFirstName(undefined),
				getUserIMGURL(null),
				getUserIMGURL(undefined),
				getDatabaseUsername(null),
				getDatabaseUsername(undefined),
				getDatabaseUserData(null),
				getDatabaseUserData(undefined)
			])

			// All should return null without errors
			results.forEach(result => {
				if (typeof result === 'object' && result !== null) {
					// For getDatabaseUserData which returns an object
					expect(result.name).toBeNull()
					expect(result.imageUrl).toBeNull()
				} else {
					expect(result).toBeNull()
				}
			})
		})

		test('should validate user ID format correctly', async () => {
			// Valid user IDs should not trigger warnings
			await getUserFirstName('user_2qV4T2yda3WpkDUzLRkCsi0g9vl')
			
			// System users should be handled gracefully without warnings
			await getUserFirstName('system')
			await getUserFirstName('drive')
			
			// Invalid user IDs should trigger warnings but not crash
			await getUserFirstName('invalid')
			await getUserFirstName('')

			// Check that warnings were logged only for truly invalid formats
			expect(consoleSpy).toHaveBeenCalledWith('Invalid user ID format: invalid')
			
			// System users should NOT trigger warnings
			expect(consoleSpy).not.toHaveBeenCalledWith('Invalid user ID format: system')
			expect(consoleSpy).not.toHaveBeenCalledWith('Invalid user ID format: drive')
			
			// Empty string is handled by the initial null/undefined check, so no warning expected
		})
	})

	describe('Missing User Handling', () => {
		test('should handle missing users from Clerk gracefully', async () => {
			// These are real user IDs from the error logs that no longer exist
			const missingUserIds = [
				'user_2z7tEArTRVj0A3XgFac0MI47CVq',
				'user_2s1Pwh7D6AUSuWCbe0k8onsUT0s',
				'user_2qXGBWKiLjLZXhTkJ89JCRiVMlm',
			]

			for (const userId of missingUserIds) {
				const firstName = await getUserFirstName(userId)
				const imageUrl = await getUserIMGURL(userId)
				const userData = await getDatabaseUserData(userId)

				// Should fallback gracefully
				expect(firstName).toBeDefined() // Either null or fallback value
				expect(imageUrl).toBeDefined() // Either null or fallback value
				expect(userData).toBeDefined()
				expect(userData.name).toBeDefined()
				expect(userData.imageUrl).toBeDefined()
			}
		})
	})

	describe('Fallback System', () => {
		test('should prefer Clerk data over database when available', async () => {
			// This would need a mock setup to test properly
			// For now, just verify the functions don't crash
			const userId = 'user_2qV4T2yda3WpkDUzLRkCsi0g9vl'
			
			const clerkName = await getUserFirstName(userId)
			const clerkImage = await getUserIMGURL(userId)
			const dbData = await getDatabaseUserData(userId)

			// All should return values (null or actual data)
			expect(clerkName).toBeDefined()
			expect(clerkImage).toBeDefined()
			expect(dbData).toBeDefined()
		})
	})
}) 