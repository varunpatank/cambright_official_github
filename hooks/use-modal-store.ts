import { Chat, ChatType, Room } from "@prisma/client";
import create from "zustand";

export type ModalType =
  | "createRoom"
  | "invite"
  | "editRoom"
  | "members"
  | "createChat"
  | "leaveRoom"
  | "deleteRoom"
  | "deleteChat"
  | "editChat"
  | "messageFile"
  | "deleteMessage";

interface ModalData {
  room?: Room;
  chat?: Chat;
  chatType?: ChatType;
  apiUrl?: string;
  query?: Record<string, any>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  first?: boolean; // Optional 'first' boolean
  onOpen: (type: ModalType, data?: ModalData, first?: boolean) => void; // Added first to onOpen method
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  first: false, // Set default value of 'first' to false
  onOpen: (type, data = {}, first = false) =>
    set({ isOpen: true, type, data, first }), // 'first' is passed here
  onClose: () => set({ type: null, isOpen: false, first: false }), // Reset 'first' on close
}));
