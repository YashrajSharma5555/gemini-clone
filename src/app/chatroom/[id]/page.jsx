'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { ClientTimestamp } from './clientTimestamp'
import { useStore } from '@/lib/store'
import { useParams } from 'next/navigation'


const MESSAGES_PER_PAGE = 20

// Dummy older messages generator
const generateOlderMessages = (startId, count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: startId - i - 1,
    from: i % 2 === 0 ? 'AI' : 'User',
    text: `This is older message #${startId - i - 1}`,
    timestamp: new Date(Date.now() - (startId - i) * 60000).toISOString(),
    image: null,
  }))
}

export default function Chatroom() {
  const [page, setPage] = useState(1)
  const [inputText, setInputText] = useState('')
  const [typing, setTyping] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [imagePreview, setImagePreview] = useState(null)
  const [throttleAI, setThrottleAI] = useState(false)

  const scrollRef = useRef(null)
  const containerRef = useRef(null)
  const { user } = useStore()
const { id: chatroomId } = useParams()
const userId = user ? `${user.countryCode}_${user.phone}` : null

const [messages, setMessages] = useState(() => {
    if (userId && chatroomId) {
      const saved = JSON.parse(localStorage.getItem(`messages_${userId}_${chatroomId}`) || '[]')
      if (saved.length > 0) return saved
    }
    return generateOlderMessages(100, MESSAGES_PER_PAGE) // fallback only if no saved
  })
  


useEffect(() => {
    if (!userId || !chatroomId) return
    localStorage.setItem(`messages_${userId}_${chatroomId}`, JSON.stringify(messages))
  }, [messages, userId, chatroomId])
  


  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages])
  

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  // Reverse infinite scroll: load older messages on scroll top
  const onScroll = (e) => {
    if (e.target.scrollTop === 0 && !loadingOlder && hasMore) {
      loadOlderMessages()
    }
  }

  const sendMessage = () => {
    if (!inputText.trim() && !imagePreview) return
  
    const highestId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0
  
    const newMsg = {
      id: highestId + 1,
      from: 'User',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      image: imagePreview,
    }
    setMessages(prev => [...prev, newMsg])
    setInputText('')
    setImagePreview(null)
    triggerAITypingAndReply(highestId + 2)
  }
  
  
  const triggerAITypingAndReply = (aiId) => {
    if (throttleAI) return
    setThrottleAI(true)
    setTyping(true)
  
    setTimeout(() => {
      const aiReply = {
        id: aiId,
        from: 'AI',
        text: generateAIReply(),
        timestamp: new Date().toISOString(),
        image: null,
      }
      setMessages(prev => [...prev, aiReply])
      setTyping(false)
      setTimeout(() => setThrottleAI(false), 3000)
    }, 2000)
  }
  
  
  const loadOlderMessages = () => {
    setLoadingOlder(true)
    setTimeout(() => {
      const oldestId = messages.length > 0 ? Math.min(...messages.map(m => m.id)) : 100
      const older = generateOlderMessages(oldestId, MESSAGES_PER_PAGE)
      if (older.length === 0) {
        setHasMore(false)
      } else {
        setMessages(prev => [...older, ...prev])
        setPage(prev => prev + 1)
      }
      setLoadingOlder(false)
      if (scrollRef.current) scrollRef.current.scrollTop = 50
    }, 1000)
  }
  

  // Fake AI reply generator
  const generateAIReply = () => {
    const replies = [
      "That's interesting!",
      "Could you tell me more?",
      "I'm thinking about that...",
      "Here's what I found.",
      "Thanks for sharing!",
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  // Handle image upload and preview
  const onImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Copy message text to clipboard on hover click
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'))
  }


  const [isAtBottom, setIsAtBottom] = useState(true)

// Track scroll position to show/hide button
const handleScroll = (e) => {
  const target = e.target
  const atBottom = target.scrollHeight - target.scrollTop === target.clientHeight
  setIsAtBottom(atBottom)

  // Trigger loading older messages when scrollTop = 0
  if (target.scrollTop === 0 && !loadingOlder && hasMore) {
    loadOlderMessages()
  }
}



  return (
<div
  style={{ height: 'calc(100vh - 64px)' }}
  className="max-w-2xl mx-auto flex flex-col p-4 border rounded shadow"
>      <Toaster position="top-right" />

      <h1 className="text-xl font-bold mb-2">Chatroom</h1>

      {/* Messages container */}
      <div
  ref={scrollRef}
  onScroll={handleScroll}
  className="flex-1 overflow-auto border rounded p-3 mb-4 bg-white text-black dark:bg-gray-800"
  style={{ minHeight: 400 }}
>
        {loadingOlder && <p className="text-center text-gray-500 mb-2">Loading older messages...</p>}

        {messages.map(msg => (
          <div
          key={msg.id}
          className={`group mb-3 p-2 rounded max-w-[70%] relative 
            ${msg.from === 'User' ? 'bg-blue-100 dark:bg-gray-400 self-end' : 'bg-gray-200 dark:bg-gray-300 self-start'}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'User' ? 'flex-end' : 'flex-start' }}
        >
          {/* Copy button */}
          <button
            onClick={() => copyToClipboard(msg.text)}
            className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 text-xs px-2 py-1 bg-white rounded shadow hover:cursor-pointer opacity-0 group-hover:opacity-100 transition"
            title="Copy message"
          >
            Copy
          </button>
            {msg.image && (
              <img
                src={msg.image}
                alt="Uploaded"
                className="mb-1 max-w-xs rounded cursor-pointer"
                onClick={(e) => e.stopPropagation()} // prevent copy on image click
              />
            )}
            <span>{msg.text}</span>
            {/* <small className="text-gray-500 text-xs mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</small> */}
            <ClientTimestamp timestamp={msg.timestamp} />

          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="text-gray-600 italic">Gemini is typing...</div>
        )}


{!isAtBottom && (
  <button
    onClick={scrollToBottom}
    className="fixed bottom-24 right-8 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition"
    title="Scroll to latest message"
  >
    ↓
  </button>
)}
      </div>


  



      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2">
          <img src={imagePreview} alt="Preview" className="max-w-xs rounded" />
          <button
            onClick={() => setImagePreview(null)}
            className="text-red-500 underline text-sm"
          >
            Remove Image
          </button>
        </div>
      )}

      {/* Input and send */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="flex-grow border rounded p-2"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />

        <label
          htmlFor="imageUpload"
          className="cursor-pointer bg-gray-300 rounded p-2 flex items-center text-white"
          title="Upload Image"
        >
          📷
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </label>

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
          disabled={!inputText.trim() && !imagePreview}
        >
          Send
        </button>
      </div>
    </div>
  )
}
