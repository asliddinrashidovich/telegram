import { Iuser } from '@/types'
import { create } from 'zustand'

type Store = {
	step: 'login' | 'verify'
	setStep: (step: 'login' | 'verify') => void
	email: string
	setEmail: (email: string) => void
	onlineUsers: Iuser[]
	setOnlineUsers: (users: Iuser[]) => void
}

export const useAuth = create<Store>()(set => ({
	step: 'login',
	setStep: step => set({ step }),
	email: '',
	setEmail: email => set({ email }),
	onlineUsers: [],
	setOnlineUsers: users => set({ onlineUsers: users }),
}))