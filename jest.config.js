const nextJest = require('next/jest')

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
	testEnvironment: 'jest-environment-jsdom',
	testMatch: [
		'**/__tests__/**/*.(js|jsx|ts|tsx)',
		'**/*.(test|spec).(js|jsx|ts|tsx)',
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	collectCoverageFrom: [
		'app/**/*.{js,jsx,ts,tsx}',
		'components/**/*.{js,jsx,ts,tsx}',
		'actions/**/*.{js,jsx,ts,tsx}',
		'lib/**/*.{js,jsx,ts,tsx}',
		'utils/**/*.{js,jsx,ts,tsx}',
		'hooks/**/*.{js,jsx,ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!**/.next/**',
		'!**/coverage/**',
	],
	coverageReporters: ['text', 'lcov', 'html'],
	transformIgnorePatterns: [
		'node_modules/(?!(@clerk|@google))',
	],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 