'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      {role: 'user', content: message},
      {role: 'assistant', content: ''},
    ])
  
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
  
      return reader.read().then(function processText({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {...lastMessage, content: lastMessage.content + text},
          ]
        })
        return reader.read().then(processText)
      })
    })
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Gradient background
      }}
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid #E0E0E0"
        borderRadius={8}
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        p={2}
        spacing={3}
        bgcolor="white"
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }
                color="black" // All text is black
                borderRadius={16}
                p={3}
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.2)"
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: {
                borderRadius: 16,
                backgroundColor: '#E0E0E0', // Light grey input field
                color: 'black', // Black text in the input field
              },
            }}
            InputLabelProps={{
              style: { color: 'black' }, // Black label text
            }}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            style={{
              background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
              color: 'black', // Black text for the button
              borderRadius: 16,
              boxShadow: '0 4px 8px rgba(255, 122, 155, 0.4)',
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
