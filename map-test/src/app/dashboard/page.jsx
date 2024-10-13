'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Send} from 'lucide-react'

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {content: 'Hello! How can I assist you today?', role: 'assistant'},
  ])
  const [input, setInput] = useState('')
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    console.log('useEffect')

    const newSocket = new WebSocket(`ws://localhost:8000/ws?client_id=1234`)

    newSocket.onopen = () => {
      console.log('WebSocket connection established')
      newSocket.send(
        JSON.stringify({
          event: 'get_db',
        }),
      )
      setConnected(true)
      setSocket(newSocket)
    }

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)
      if (data.event === 'message_start') {
        console.log('Message start')
        setMessages((messages) => [
          ...messages,
          {content: '', role: 'assistant'},
        ])
      } else if (data.event === 'message_response') {
        if (messages[messages.length - 1].role === 'assistant') {
          // Start of Selection
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            {
              ...prevMessages[prevMessages.length - 1],
              content:
                prevMessages[prevMessages.length - 1].content + data.data,
            },
          ])
        } else {
          setMessages((messages) => [
            ...messages,
            {content: data.data, role: 'assistant'},
          ])
        }
      } else if (data.event === 'message_end') {
        console.log('Message end')
      }
    }
  }, [])

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        content: input,
        role: 'user',
      }
      setMessages((messages) => [...messages, newMessage])
      setInput('')

      socket.send(
        JSON.stringify({
          event: 'message',
          messages: [...messages, newMessage],
        }),
      )
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary p-4">
        <h2 className="text-2xl font-bold text-primary-foreground">ChatBot</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } mb-4`}
          >
            <div
              className={`flex items-start ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {message.role === 'user' ? 'U' : 'B'}
                </AvatarFallback>
                <AvatarImage
                  src={
                    message.role === 'user'
                      ? '/placeholder.svg?height=32&width=32'
                      : '/placeholder.svg?height=32&width=32'
                  }
                />
              </Avatar>
              <div
                className={`mx-2 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex space-x-2"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
