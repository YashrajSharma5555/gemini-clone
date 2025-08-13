'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStore } from '../../lib/store'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Zod schema for validation
const schema = z.object({
  countryCode: z.string().min(1, "Select country"),
  phone: z.string().min(7, "Phone number is too short"),
  otp: z.string().optional()
})

export default function AuthPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const [countries, setCountries] = useState([])
  const [otpStep, setOtpStep] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  
  // Zustand store actions
  const setUser = useStore(s => s.setUser)
  const loadChatRooms = useStore(s => s.loadChatRooms)
  
  const router = useRouter()

  // Fetch country codes
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,idd')
      .then(res => res.json())
      .then(data => {
        const sorted = data
          .map(c => {
            if (c.idd?.root) {
              const suffix = c.idd.suffixes?.length ? c.idd.suffixes[0] : ''
              return { name: c.name.common, code: c.idd.root + suffix }
            }
            return null
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name))
        setCountries(sorted)
      })
      .catch(() => toast.error("Failed to load countries"))
  }, [])

  // Handle form submit
  const onSubmit = (data) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = storedUsers.find(
      u => u.phone === data.phone && u.countryCode === data.countryCode
    )

    if (!otpStep) {
      if (existingUser) {
        // User already exists — set user & load chatrooms
        toast.success("Welcome back!")
        setUser(existingUser)
        const userId = `${existingUser.countryCode}_${existingUser.phone}`
        loadChatRooms(userId)
        setTimeout(() => router.push('/dashboard'), 800)
        return
      }

      // Send OTP (mock)
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      setGeneratedOtp(otp)
      toast.success(`OTP sent: ${otp} (for demo)`)
      setOtpStep(true)
    } 
    else {
      // OTP Verification
      if (data.otp === generatedOtp) {
        const newUser = { phone: data.phone, countryCode: data.countryCode }
        storedUsers.push(newUser)
        localStorage.setItem('users', JSON.stringify(storedUsers))

        const userId = `${data.countryCode}_${data.phone}`
        
        // Create empty chatrooms if not present
        if (!localStorage.getItem(`chatrooms_${userId}`)) {
          localStorage.setItem(`chatrooms_${userId}`, JSON.stringify([]))
        }

        // Save in Zustand
        setUser(newUser)
        loadChatRooms(userId)

        toast.success("Login successful!")
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        toast.error("Invalid OTP")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white shadow rounded space-y-4 w-80 dark:bg-gray-700">
        
        {/* Country selector */}
        <div>
          <select {...register("countryCode")} disabled={otpStep} className="border p-2 w-full ">
            <option value="">Select Country</option>
            {countries.map((c, i) => (
              <option key={i} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          {errors.countryCode && <p className="text-red-500 text-sm">{errors.countryCode.message}</p>}
        </div>

        {/* Phone number */}
        <div>
          <input {...register("phone")} placeholder="Phone Number" disabled={otpStep} className="border p-2 w-full" />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        {/* OTP input */}
        {otpStep && (
          <div>
            <input {...register("otp", { required: "Enter the OTP" })} placeholder="Enter OTP" className="border p-2 w-full" />
            {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}
          </div>
        )}

        {/* Submit button */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          {otpStep ? "Verify OTP" : "Send OTP"}
        </button>
      </form>
    </div>
  )
}
