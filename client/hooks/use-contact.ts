import { IMessage, Iuser } from "@/types";
import { create } from "zustand";

type Store = {
  currentContact: Iuser | null;
  setCurrentContact: (cur: Iuser | null) => void;
  editedMessage: IMessage | null;
  setEditedMessage: (message: IMessage | null) => void;
};

export const useCurrentContact = create<Store>()((set) => ({
  currentContact: null,
  setCurrentContact: (contact) => set({ currentContact: contact }),
  editedMessage: null,
  setEditedMessage: (message) => set({ editedMessage: message }),
}));
