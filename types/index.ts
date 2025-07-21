// Chat-related types
export type ChatSettings = {
  model?: string;
  sysTemInstructions?: string;
  temperature?: number;
};

export type ChatHistory = Array<{
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}>;

export type MessageRole = 'user' | 'model';

export type Message = {
  id?: string;
  role: MessageRole;
  parts: Array<{ text: string }>;
  timestamp?: Date;
};

// Task-related types
export type TaskWithList = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  dueDate: Date | null;
  list: {
    id: string;
    title: string;
  };
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  dueDate: Date | null;
};

export type ListWithTasks = {
  id: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  sprintId: string;
  tasks: Task[];
};

// API-related types
export type NextApiResponseServerIo = {
  socket: {
    server: {
      io: any;
    };
  };
} & any;