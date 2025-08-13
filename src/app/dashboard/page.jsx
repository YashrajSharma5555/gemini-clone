'use client'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function Dashboard() {
  const router = useRouter()
  const { userId, chatRooms, addChatRoom, deleteChatRoom, loadChatRooms } = useStore()

  const [newRoomName, setNewRoomName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChatrooms, setFilteredChatrooms] = useState([])

  // Load rooms for logged-in user
  useEffect(() => {
    if (!userId) return router.push('/auth')
    loadChatRooms(userId)
  }, [userId, loadChatRooms, router])

  //  Debounced search filter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredChatrooms(chatRooms)
      } else {
        setFilteredChatrooms(
          chatRooms.filter(room =>
            room.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, chatRooms])

  //  Create a new chatroom
  const createChatroom = () => {
    if (!newRoomName.trim()) {
      toast.error("Chatroom name can't be empty")
      return
    }
    addChatRoom(newRoomName)
    setNewRoomName('')
    toast.success(`Chatroom "${newRoomName}" created`)
  }

  // Delete a chatroom
  const handleDelete = (id, title) => {
    deleteChatRoom(id)
    toast.success(`Chatroom "${title}" deleted`)
  }

  //  Navigate to chatroom
  const enterChatroom = (id) => {
    router.push(`/chatroom/${id}`)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Your Chatrooms</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search chatrooms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      {/* List chatrooms */}
      <ul className="mb-6 space-y-2">
        {filteredChatrooms.map(room => (
          <li
            key={room.id}
            className="flex justify-between items-center border p-2 rounded cursor-pointer hover:bg-gray-600"
          >
            <span
              onClick={() => enterChatroom(room.id)}
              className="flex-1"
            >
              {room.title}
            </span>
            <button
              onClick={() => handleDelete(room.id, room.title)}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              Delete
            </button>
          </li>
        ))}
        {filteredChatrooms.length === 0 && <li>No chatrooms found</li>}
      </ul>

      {/* Create chatroom */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New chatroom name"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          className="flex-grow border p-2 rounded"
        />
        <button
          onClick={createChatroom}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Create
        </button>
      </div>
    </div>
  )
}
