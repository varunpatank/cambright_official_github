import { mockUsers } from './clerk'

// Mock data for different entities
export const mockUserModels = {
	regular: {
		id: 'usermodel_regular',
		userId: mockUsers.regular.id,
		name: 'regularuser',
		imageUrl: 'https://test.com/regular.jpg',
		email: 'regular@test.com',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		followers: 5,
		following: 10,
		biog: 'Regular user bio',
		XP: 100,
		tags: [{ id: 'tag1', name: 'Beginner' }],
		followedBy: [],
		followingUsers: [],
	},
	tutor: {
		id: 'usermodel_tutor',
		userId: mockUsers.tutor.id,
		name: 'tutoruser',
		imageUrl: 'https://test.com/tutor.jpg',
		email: 'tutor@test.com',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		followers: 50,
		following: 20,
		biog: 'Experienced tutor',
		XP: 1000,
		tags: [{ id: 'tag2', name: 'Expert' }],
		followedBy: [],
		followingUsers: [],
	},
}

export const mockCourses = [
	{
		id: 'course_1',
		userId: mockUsers.tutor.id,
		title: 'Introduction to Chemistry',
		description: 'Basic chemistry concepts',
		imageUrl: 'https://test.com/chemistry.jpg',
		isPublished: true,
		subjectId: 'subject_1',
		boardId: 'board_1',
		subject: { id: 'subject_1', name: 'Chemistry' },
		board: { id: 'board_1', name: 'Cambridge' },
		chapters: [],
		attachments: [],
		enrollment: [],
		sessionlink: 'https://meet.google.com/test',
		sessiondate: '2024-12-20',
		sessiontime: '14:00',
		attachmentLink: null,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	},
	{
		id: 'course_2',
		userId: mockUsers.tutor.id,
		title: 'Advanced Mathematics',
		description: 'Advanced math topics',
		imageUrl: 'https://test.com/math.jpg',
		isPublished: false,
		subjectId: 'subject_2',
		boardId: 'board_1',
		subject: { id: 'subject_2', name: 'Mathematics' },
		board: { id: 'board_1', name: 'Cambridge' },
		chapters: [],
		attachments: [],
		enrollment: [],
		sessionlink: null,
		sessiondate: null,
		sessiontime: null,
		attachmentLink: null,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	},
]

export const mockNotes = [
	{
		id: 'note_1',
		userId: mockUsers.tutor.id,
		title: 'Chemistry Notes Chapter 1',
		description: 'Basic chemical reactions',
		imageUrl: 'https://test.com/note1.jpg',
		notesubjectId: 'notesubject_1',
		isPublished: true,
		noteboardId: 'noteboard_1',
		notesubject: { id: 'notesubject_1', name: 'Chemistry' },
		noteboard: { id: 'noteboard_1', name: 'Cambridge' },
		notechapters: [],
		noteattachments: [],
		added: [],
		sessionlink: null,
		sessiondate: null,
		sessiontime: null,
		attachmentLink: null,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	},
]

export const mockSprints = [
	{
		id: 'sprint_1',
		orgId: 'org_1',
		title: 'Test Sprint',
		imageId: 'image_1',
		imageThumbUrl: 'https://test.com/thumb.jpg',
		imageFullUrl: 'https://test.com/full.jpg',
		imageUserName: 'Test User',
		imageLinkHTML: '<a href="#">Test</a>',
		isTemplate: false,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		lists: [],
	},
]

export const mockProfiles = [
	{
		id: 'profile_1',
		userId: mockUsers.regular.id,
		name: 'Regular User',
		imageUrl: 'https://test.com/regular.jpg',
		email: 'regular@test.com',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		rooms: [],
		members: [],
		chats: [],
	},
]

// Create a comprehensive mock for Prisma client
export const createMockPrismaClient = () => ({
	userModel: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	course: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	note: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	sprint: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	list: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	task: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	profile: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	room: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	member: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	chat: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	message: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	subject: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	board: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	enrollment: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	tag: {
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upsert: jest.fn(),
		count: jest.fn(),
	},
	$transaction: jest.fn(),
	$connect: jest.fn(),
	$disconnect: jest.fn(),
})

// Mock will be set up in individual test files that need it

// Helper functions to set up common database scenarios
export const setupDatabaseMocks = (mockDb: any) => {
	// Default user model responses
	mockDb.userModel.findFirst.mockImplementation((query: any) => {
		if (query?.where?.userId === mockUsers.regular.id) {
			return Promise.resolve(mockUserModels.regular)
		}
		if (query?.where?.userId === mockUsers.tutor.id) {
			return Promise.resolve(mockUserModels.tutor)
		}
		return Promise.resolve(null)
	})

	mockDb.userModel.findUnique.mockImplementation((query: any) => {
		if (query?.where?.userId === mockUsers.regular.id) {
			return Promise.resolve(mockUserModels.regular)
		}
		if (query?.where?.userId === mockUsers.tutor.id) {
			return Promise.resolve(mockUserModels.tutor)
		}
		return Promise.resolve(null)
	})

	mockDb.userModel.findMany.mockResolvedValue([
		mockUserModels.tutor, // highest XP first
		mockUserModels.regular,
	])

	// Course responses
	mockDb.course.findMany.mockResolvedValue(mockCourses)
	mockDb.course.findFirst.mockResolvedValue(mockCourses[0])
	mockDb.course.findUnique.mockResolvedValue(mockCourses[0])

	// Note responses
	mockDb.note.findMany.mockResolvedValue(mockNotes)
	mockDb.note.findFirst.mockResolvedValue(mockNotes[0])
	mockDb.note.findUnique.mockResolvedValue(mockNotes[0])

	// Sprint responses
	mockDb.sprint.findMany.mockResolvedValue(mockSprints)
	mockDb.sprint.findFirst.mockResolvedValue(mockSprints[0])
	mockDb.sprint.findUnique.mockResolvedValue(mockSprints[0])

	// Profile responses
	mockDb.profile.findUnique.mockResolvedValue(mockProfiles[0])
	mockDb.profile.findFirst.mockResolvedValue(mockProfiles[0])

	return mockDb
}

export const resetDatabaseMocks = () => {
	const mockDb = createMockPrismaClient()
	setupDatabaseMocks(mockDb)
	return mockDb
} 