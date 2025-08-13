# Gemini Frontend Clone Assignment

A responsive chat application built with **Next.js**, **Zustand**, simulating chatrooms with user authentication, infinite scroll, throttling for AI replies, and per-chatroom message persistence.

---

## Live Demo
[Live Link](gemini-clone-bjvs.vercel.app) 

---

## Project Overview
This project replicates a Gemini-style chat interface with:
- OTP-based authentication
- Persistent user and chatroom data via **LocalStorage**
- Per-chatroom message storage
- Infinite scroll with pagination for older messages
- AI reply simulation with throttling
- Form validation with **Zod** and **React Hook Form**


---

## Tech Stack
- **Next.js (App Router)**
- **React Hook Form** + **Zod** (Form validation)
- **Zustand** (State management)
- **LocalStorage** (Persistent storage)
- **Tailwind CSS** (Styling)
- **react-hot-toast** (Notifications)

---

## Setup and Run Instructions

### 1️ Clone the repository
```bash
git clone ....
cd gemini-clone
```

### 2️ Install dependencies
```bash
npm install
```

### 3️ Run the development server
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Folder / Component Structure

```
/app
  /auth           → Login/OTP Authentication page.jsx
  /dashboard      → Chatroom list and navigation
  /chatroom/[id]  → Individual chatroom with messages 
/components
    ThemeProvider and ThemeToggle for DarkMode
/lib
  store.js        → Zustand store 
```

---

## Implementation Details

### **1. Throttling (AI Reply Control)**
**Purpose:**  
Prevents the simulated AI ("Gemini") from sending multiple replies too quickly when a user sends messages in rapid succession.

**Implementation in Code:**
```javascript
if (throttleAI) return; // If already waiting, ignore further triggers
setThrottleAI(true); // Lock AI from replying again until timer expires
setTyping(true); // Show typing indicator "Gemini is typing..."

setTimeout(() => {
  const aiReply = { ... }
  setMessages(prev => [...prev, aiReply]);
  setTyping(false);
  setTimeout(() => setThrottleAI(false), 3000); // Unlock after 3s
}, 2000);
```
- `throttleAI` acts as a **cooldown flag**.
- Once a user sends a message, the AI waits before responding again.
- Prevents flooding the chat with multiple AI messages if the user sends many messages quickly.

---

### **2. Pagination (Batch Message Loading)**
**Purpose:**  
Loads messages in small batches (20 per page) for better performance instead of loading all at once.

**Implementation in Code:**
```javascript
const MESSAGES_PER_PAGE = 20;
return generateOlderMessages(100, MESSAGES_PER_PAGE);

const oldestId = Math.min(...messages.map(m => m.id));
const older = generateOlderMessages(oldestId, MESSAGES_PER_PAGE);
setMessages(prev => [...older, ...prev]);

```
- Initial Load:
- On first render, the app tries to load chat history from localStorage.
- If no saved history exists, it generates the latest 20 messages with a dummy data function else shows chat history form localstorage.
- Loading Older Messages:
- Finds the oldest message ID and generates 20 older messages before it.
- Prepends them to the existing message list.
- Stops loading when no more data is available `(hasMore = false)`.



---

### **3. Infinite Scroll (Load Older Messages on Scroll Top)**
**Purpose:**  
Loads older messages when the user scrolls to the very top of the chat window.

**Implementation in Code:**
```javascript
if (target.scrollTop === 0 && !loadingOlder && hasMore) {
  loadOlderMessages();
}
```
- `handleScroll()` checks scroll position.
- If the top is reached (`scrollTop === 0`) and more messages exist (`hasMore`), it calls:
```javascript
setMessages(prev => [...older, ...prev]); // Prepend older messages
```
- This **prepends** older messages so chat order remains intact.
- `hasMore` is set to `false` when there are no more messages to load.

---

### **4. Form Validation (OTP Authentication)**
**Purpose:**  
Ensures valid country code, phone number, and OTP before allowing login/signup.

### Define Validation Rules
```javascript
// Define Validation Rules using Zod
const schema = z.object({
  countryCode: z.string().min(1, "Select country"), 
  phone: z.string().min(7, "Phone number is too short"), 
  otp: z.string().optional() 
})

```

### Connect Schema to react-hook-form
```javascript
// Connect Zod schema with react-hook-form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema) // Use zodResolver to automatically validate form fields based on schema
})

```

### Show Error Messages
```jsx
{/* Input field for phone number */}
<input {...register("phone")} placeholder="Phone Number" />
{/* Show error message if phone validation fails */}
{errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

```

### Step-Based Validation
```jsx
{/* OTP input field, only shown in OTP verification step */}
{otpStep && (
  <input 
    {...register("otp", { required: "Enter the OTP" })} 
    placeholder="Enter OTP" 
  />
)}

```

- Uses Zod + react-hook-form for type-safe, schema-driven validation.  
- Zod schema defines rules for country code, phone number, and OTP.  
- Validation applied automatically via zodResolver, with real-time `errors` updates.  


---

**Summary:**  
- **Throttling** → Stops AI from sending too many replies too fast.  
- **Pagination** → Loads messages in fixed-size batches (20).  
- **Infinite Scroll** → Fetches older messages when scrolled to top.  
- **Form Validation** → Ensures correct inputs before OTP process.


## Features
- OTP-based login simulation
- Multiple chatrooms per user
- Persistent messages for each chatroom each user with localstorage
- Image upload support in chat
- Copy-to-clipboard messages on hover 
- AI simulated replies with typing indicator
- Loading skeletons for better UX while fetching older messages
- Dark mode & responsive design
- Toast notifications for all main actions


---
