'use client'
import { useState } from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { signIn } from "next-auth/react"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      setError(data.message || 'Login failed')
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Stack
        spacing={3}
        width="350px"
        p={4}
        borderRadius={4}
        bgcolor="white"
        boxShadow="0 4px 12px rgba(0,0,0,0.1)"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight={700}>
          Login
        </Typography>
        <form style={{ width: '100%' }} onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              InputProps={{
                style: {
                  borderRadius: 16,
                  backgroundColor: '#E0E0E0',
                  color: 'black',
                },
              }}
              InputLabelProps={{
                style: { color: 'black' },
              }}
              variant="outlined"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              InputProps={{
                style: {
                  borderRadius: 16,
                  backgroundColor: '#E0E0E0',
                  color: 'black',
                },
              }}
              InputLabelProps={{
                style: { color: 'black' },
              }}
              variant="outlined"
            />
            {error && (
              <Typography color="error" fontSize={14}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              style={{
                background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
                color: 'black',
                borderRadius: 16,
                boxShadow: '0 4px 8px rgba(255, 122, 155, 0.4)',
              }}
              fullWidth
            >
              Login
            </Button>
          </Stack>
        </form>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => signIn('google', { callbackUrl: '/', prompt: 'select_account' })}
          style={{
            marginTop: 16,
            borderRadius: 16,
            textTransform: 'none',
            background: '#fff',
            color: '#333',
            border: '1px solid #ccc'
          }}
        >
          Sign in with Google
        </Button>
      </Stack>
    </Box>
  )
}