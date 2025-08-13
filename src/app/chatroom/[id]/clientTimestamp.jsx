'use client'
import { useState, useEffect } from 'react'

export function ClientTimestamp({ timestamp }) {
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    setTimeString(new Date(timestamp).toLocaleTimeString())
  }, [timestamp])

  return <small className="text-gray-500 text-xs mt-1">{timeString}</small>
}
