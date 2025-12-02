import { Iuser } from "@/types"
import { create } from "zustand";

type Store = {
  currentContact: Iuser | null;
  setCurrentContact: (cur: Iuser | null) => void
}

export const useCurrentContact = create<Store>()(set => ({
  currentContact: null,
  setCurrentContact: contact => set({currentContact: contact})
}))