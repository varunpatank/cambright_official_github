import { List, Member, Profile, Room, Task } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type RoomWithProfiles = Room & {
  members: (Member & { profile: Profile })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type ListWithTasks = List & { tasks: Task[] };

export type TaskWithList = Task & { list: List };

export type MessageRole = "user" | "model";
export interface MessagePart {
  text: string;
}
export interface Message {
  role: MessageRole;
  parts: MessagePart[];
}

export interface ChatHistory extends Array<Message> {}
export interface GenerationConfig {
  temperature: number;
  topP: number;
  responseMimeType: string;
}
export interface ChatSettings {
  temperature: number;
  model: string;
  sysTemInstructions: string;
}

// vp

export interface Question {
  id: string;
  paperId: string;
  questionNumber: string;
  questionText: string;
  questionType: "MCQ" | "FRQ" | "STRUCTURED_PART";
  marks: string;
  rawLlMExtractedQuestion: string;
}

export interface MCQOption {
  id: string;
  questionId: string;
  optionLetter: string;
  optionText: string;
  isCorrect: string;
}

export interface MarkSchemeEntry {
  id: string;
  paperId: string;
  questionId: string;
  entryNumber: string;
  answerText: string;
  marksAwarded: string;
  guidanceNotes: string;
  rawLlMExtractedMarkScheme: string;
}

export interface Paper {
  id: string;
  year: string;
  session: string;
  variant: string;
  subject: string;
  paperType: string;
}

export interface QuizQuestion {
  question: Question;
  options?: MCQOption[];
  markScheme?: MarkSchemeEntry;
  paper?: Paper;
}

export interface QuizSettings {
  subject: "Biology" | "Chemistry" | "Physics";
  yearRange: { from: string; to: string };
  topics: string[];
  variant: string;
  session: string;
  boardType: string;
  difficulty: string;
  paper: string;
  numberOfQuestions: number;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  marksAwarded: number;
  keywords?: string[];
}

export interface SubjectData {
  questions: Question[];
  mcqOptions: MCQOption[];
  markScheme: MarkSchemeEntry[];
  papers: Paper[];
}
