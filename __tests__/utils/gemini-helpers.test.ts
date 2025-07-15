import { chatToGemini } from '../../utils/GeminiHelpers'
// Define types locally to avoid import issues
type ChatSettings = {
	model?: string
	sysTemInstructions?: string
	temperature?: number
}

type ChatHistory = Array<{
	role: 'user' | 'model'
	parts: Array<{ text: string }>
}>

// Mock Google Generative AI
const mockSendMessage = jest.fn()
const mockStartChat = jest.fn()
const mockGetGenerativeModel = jest.fn()

jest.mock('@google/generative-ai', () => ({
	GoogleGenerativeAI: jest.fn(),
}))

describe('GeminiHelpers', () => {
	const mockHistory: ChatHistory = [
		{
			role: 'user',
			parts: [{ text: 'Hello' }],
		},
		{
			role: 'model',
			parts: [{ text: 'Hi there! How can I help you today?' }],
		},
	]

	const mockSettings: ChatSettings = {
		model: 'gemini-2.0-flash',
		temperature: 0.7,
		sysTemInstructions: 'You are a helpful assistant for students.',
	}

	beforeEach(() => {
		jest.clearAllMocks()

		// Set up default mocks
		mockSendMessage.mockResolvedValue({
			response: {
				text: jest.fn().mockReturnValue('Mocked response from Gemini'),
			},
		})

		mockStartChat.mockReturnValue({
			sendMessage: mockSendMessage,
		})

		mockGetGenerativeModel.mockReturnValue({
			startChat: mockStartChat,
		})

		// Set up the Google AI mock
		const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai')
		GoogleGenerativeAI.mockImplementation(() => ({
			getGenerativeModel: mockGetGenerativeModel,
		}))

		// Mock environment variable
		process.env.GOOGLE_GEMINI_API = 'test-api-key'
	})

	afterEach(() => {
		delete process.env.GOOGLE_GEMINI_API
	})

	describe('Environment Setup', () => {
		test('throws error when API key is not provided', async () => {
			delete process.env.GOOGLE_GEMINI_API

			// Re-import to trigger the environment check
			jest.resetModules()
			
			await expect(async () => {
				const { chatToGemini } = await import('@/utils/GeminiHelpers')
			}).rejects.toThrow('API KEY NOT FOUND')
		})

		test('initializes with correct API key', async () => {
			const { GoogleGenerativeAI } = await import('@google/generative-ai')
			
			await chatToGemini('test message', mockHistory, mockSettings)
			
			expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key')
		})
	})

	describe('chatToGemini Function', () => {
		test('successfully sends message and returns response', async () => {
			const userMessage = 'What is photosynthesis?'
			const expectedResponse = 'Photosynthesis is the process by which plants convert light energy into chemical energy.'

			mockSendMessage.mockResolvedValue({
				response: {
					text: () => expectedResponse,
				},
			})

			const result = await chatToGemini(userMessage, mockHistory, mockSettings)

			expect(result).toBe(expectedResponse)
			expect(mockSendMessage).toHaveBeenCalledWith(userMessage)
		})

		test('configures model with correct parameters', async () => {
			await chatToGemini('test message', mockHistory, mockSettings)

			expect(mockGetGenerativeModel).toHaveBeenCalledWith({
				model: 'gemini-2.0-flash',
				systemInstruction: 'You are a helpful assistant for students.',
			})
		})

		test('uses default model when not specified in settings', async () => {
			const settingsWithoutModel = {
				...mockSettings,
				model: undefined,
			}

			await chatToGemini('test message', mockHistory, settingsWithoutModel)

			expect(mockGetGenerativeModel).toHaveBeenCalledWith({
				model: 'gemini-2.0-flash',
				systemInstruction: 'You are a helpful assistant for students.',
			})
		})

		test('uses default system instructions when not specified', async () => {
			const settingsWithoutInstructions = {
				...mockSettings,
				sysTemInstructions: undefined,
			}

			await chatToGemini('test message', mockHistory, settingsWithoutInstructions)

			expect(mockGetGenerativeModel).toHaveBeenCalledWith({
				model: 'gemini-2.0-flash',
				systemInstruction: 'you are a helpful assistant for students who do IGCSE and Alevels Cambridge and Edexcel, to help them ace their exams, you are trained by Cambright (NOT BY google) Your name is Tuto AI (NOT GEMINI)',
			})
		})

		test('configures generation settings correctly', async () => {
			await chatToGemini('test message', mockHistory, mockSettings)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: {
					temperature: 0.7,
					topP: 0.9,
					responseMimeType: 'text/plain',
				},
				history: mockHistory,
			})
		})

		test('uses default temperature when not specified', async () => {
			const settingsWithoutTemperature = {
				...mockSettings,
				temperature: undefined,
			}

			await chatToGemini('test message', mockHistory, settingsWithoutTemperature)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: {
					temperature: 1,
					topP: 0.9,
					responseMimeType: 'text/plain',
				},
				history: mockHistory,
			})
		})

		test('handles empty chat history', async () => {
			const emptyHistory: ChatHistory = []

			await chatToGemini('First message', emptyHistory, mockSettings)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: expect.any(Object),
				history: emptyHistory,
			})
		})

		test('handles complex chat history', async () => {
			const complexHistory: ChatHistory = [
				{ role: 'user', parts: [{ text: 'What is chemistry?' }] },
				{ role: 'model', parts: [{ text: 'Chemistry is the study of matter...' }] },
				{ role: 'user', parts: [{ text: 'Can you explain atoms?' }] },
				{ role: 'model', parts: [{ text: 'Atoms are the basic building blocks...' }] },
			]

			await chatToGemini('Tell me about molecules', complexHistory, mockSettings)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: expect.any(Object),
				history: complexHistory,
			})
		})
	})

	describe('Error Handling', () => {
		test('handles API errors gracefully', async () => {
			const apiError = new Error('API rate limit exceeded')
			mockSendMessage.mockRejectedValue(apiError)

			await expect(
				chatToGemini('test message', mockHistory, mockSettings)
			).rejects.toThrow('API rate limit exceeded')
		})

		test('handles network errors', async () => {
			const networkError = new Error('Network connection failed')
			mockSendMessage.mockRejectedValue(networkError)

			await expect(
				chatToGemini('test message', mockHistory, mockSettings)
			).rejects.toThrow('Network connection failed')
		})

		test('handles model initialization errors', async () => {
			const modelError = new Error('Model not found')
			mockGetGenerativeModel.mockImplementation(() => {
				throw modelError
			})

			await expect(
				chatToGemini('test message', mockHistory, mockSettings)
			).rejects.toThrow('Model not found')
		})

		test('handles chat session errors', async () => {
			const chatError = new Error('Chat session failed')
			mockStartChat.mockImplementation(() => {
				throw chatError
			})

			await expect(
				chatToGemini('test message', mockHistory, mockSettings)
			).rejects.toThrow('Chat session failed')
		})

		test('logs errors to console', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
			const testError = new Error('Test error')
			mockSendMessage.mockRejectedValue(testError)

			try {
				await chatToGemini('test message', mockHistory, mockSettings)
			} catch (error) {
				// Expected to throw
			}

			expect(consoleSpy).toHaveBeenCalledWith(testError)
			consoleSpy.mockRestore()
		})
	})

	describe('Message Formatting', () => {
		test('handles simple text messages', async () => {
			const simpleMessage = 'Hello, how are you?'

			await chatToGemini(simpleMessage, mockHistory, mockSettings)

			expect(mockSendMessage).toHaveBeenCalledWith(simpleMessage)
		})

		test('handles messages with special characters', async () => {
			const specialMessage = 'What is the formula for H₂SO₄? Also, explain C₆H₁₂O₆.'

			await chatToGemini(specialMessage, mockHistory, mockSettings)

			expect(mockSendMessage).toHaveBeenCalledWith(specialMessage)
		})

		test('handles multiline messages', async () => {
			const multilineMessage = `Please explain:
1. Photosynthesis
2. Cellular respiration
3. The relationship between them`

			await chatToGemini(multilineMessage, mockHistory, mockSettings)

			expect(mockSendMessage).toHaveBeenCalledWith(multilineMessage)
		})

		test('handles empty messages', async () => {
			const emptyMessage = ''

			await chatToGemini(emptyMessage, mockHistory, mockSettings)

			expect(mockSendMessage).toHaveBeenCalledWith(emptyMessage)
		})

		test('handles very long messages', async () => {
			const longMessage = 'A'.repeat(10000)

			await chatToGemini(longMessage, mockHistory, mockSettings)

			expect(mockSendMessage).toHaveBeenCalledWith(longMessage)
		})
	})

	describe('Response Processing', () => {
		test('extracts text from response correctly', async () => {
			const expectedText = 'This is the AI response'
			mockSendMessage.mockResolvedValue({
				response: {
					text: () => expectedText,
				},
			})

			const result = await chatToGemini('test', mockHistory, mockSettings)

			expect(result).toBe(expectedText)
		})

		test('handles empty response text', async () => {
			mockSendMessage.mockResolvedValue({
				response: {
					text: () => '',
				},
			})

			const result = await chatToGemini('test', mockHistory, mockSettings)

			expect(result).toBe('')
		})

		test('handles response with formatting', async () => {
			const formattedResponse = `## Chemistry Basics

**Atoms** are the fundamental units of matter.

- Protons: positive charge
- Neutrons: no charge  
- Electrons: negative charge`

			mockSendMessage.mockResolvedValue({
				response: {
					text: () => formattedResponse,
				},
			})

			const result = await chatToGemini('test', mockHistory, mockSettings)

			expect(result).toBe(formattedResponse)
		})
	})

	describe('Performance', () => {
		test('completes request within reasonable time', async () => {
			const startTime = Date.now()
			
			await chatToGemini('Quick test', mockHistory, mockSettings)
			
			const endTime = Date.now()
			const duration = endTime - startTime

			// Should complete within 1 second for mocked response
			expect(duration).toBeLessThan(1000)
		})

		test('handles concurrent requests', async () => {
			const requests = Array.from({ length: 5 }, (_, i) =>
				chatToGemini(`Message ${i}`, mockHistory, mockSettings)
			)

			const results = await Promise.all(requests)

			expect(results).toHaveLength(5)
			results.forEach((result) => {
				expect(result).toBe('Mocked response from Gemini')
			})
		})
	})

	describe('Configuration Validation', () => {
		test('validates temperature range', async () => {
			const invalidSettings = {
				...mockSettings,
				temperature: 2.5, // Above valid range
			}

			await chatToGemini('test', mockHistory, invalidSettings)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: {
					temperature: 2.5,
					topP: 0.9,
					responseMimeType: 'text/plain',
				},
				history: mockHistory,
			})
		})

		test('handles negative temperature', async () => {
			const invalidSettings = {
				...mockSettings,
				temperature: -0.5,
			}

			await chatToGemini('test', mockHistory, invalidSettings)

			expect(mockStartChat).toHaveBeenCalledWith({
				generationConfig: {
					temperature: -0.5,
					topP: 0.9,
					responseMimeType: 'text/plain',
				},
				history: mockHistory,
			})
		})
	})
}) 