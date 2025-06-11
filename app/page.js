'use client'
import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Ask me about professors or classes!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) return null

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessages),
      })
      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      let aiMsg = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        aiMsg += new TextDecoder().decode(value)
        setMessages(msgs => [
          ...msgs.slice(0, -1),
          msgs[msgs.length - 1],
          { role: 'assistant', content: aiMsg }
        ])
      }
    } catch (err) {
      setMessages(msgs => [
        ...msgs,
        { role: 'assistant', content: 'Sorry, something went wrong.' }
      ])
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 24
    }}>
      <div style={{
        width: 420,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        padding: 24,
        marginTop: 40,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500
      }}>
        <h2 style={{ marginBottom: 8 }}>AI Rate My Prof</h2>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 16,
          maxHeight: 350,
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 12,
          background: '#fafbfc'
        }}>
          {messages.slice(1).map((msg, idx) => (
            <div key={idx} style={{
              margin: '8px 0',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}>
              <span style={{
                display: 'inline-block',
                background: msg.role === 'user' ? '#e0e7ff' : '#e6ffed',
                color: '#222',
                borderRadius: 8,
                padding: '8px 12px',
                maxWidth: '80%',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about a professor or class..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 16
            }}
            disabled={loading}
          />
          <button
            type="submit"
            style={{
              padding: '0 18px',
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            Send
          </button>
        </form>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            marginTop: 18,
            background: '#fff0f0',
            color: '#d32f2f',
            border: '1px solid #f8bbd0',
            borderRadius: 8,
            padding: '8px 0',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
