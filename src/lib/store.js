import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      userId: null,
      chatRooms: [],
      messages: {},

      // Set user + id
      setUser: (u) => set({ user: u, userId: `${u.countryCode}_${u.phone}` }),

      // Load chatrooms for a specific user
      loadChatRooms: (userId) => {
        try {
          const saved = JSON.parse(localStorage.getItem(`chatrooms_${userId}`) || '[]')
          if (Array.isArray(saved)) {
            set({ chatRooms: saved })
          }
        } catch (e) {
          console.error("Failed to load chatrooms", e)
        }
      },

      // Add a chatroom and save to localStorage
      addChatRoom: (title) => set((state) => {
        const updated = [...state.chatRooms, { id: Date.now().toString(), title }]
        localStorage.setItem(`chatrooms_${state.userId}`, JSON.stringify(updated))
        return { chatRooms: updated }
      }),

      // Delete chatroom
      deleteChatRoom: (id) => set((state) => {
        const updated = state.chatRooms.filter(r => r.id !== id)
        localStorage.setItem(`chatrooms_${state.userId}`, JSON.stringify(updated))
        return { chatRooms: updated }
      }),

      // Load messages for a specific chatroom
  loadMessages: (chatroomId) => {
    const { userId } = get()
    const msgs = JSON.parse(localStorage.getItem(`messages_${userId}_${chatroomId}`) || '[]')
    return msgs
  },

  // Add a message to a specific chatroom
  addMessage: (chatroomId, text, sender = 'me') => {
    const { userId } = get()
    const key = `messages_${userId}_${chatroomId}`
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    const newMsg = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: Date.now()
    }
    const updated = [...current, newMsg]
    localStorage.setItem(key, JSON.stringify(updated))
    return updated
  }
    }),
    { name: 'gemini-clone' }
  )

)