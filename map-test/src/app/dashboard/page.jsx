'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Send} from 'lucide-react'
import Notifications from './notifications' // Adjust the import path if necessary

export default function UserDashboard() {
  const [messages, setMessages] = useState([
    {content: 'Hello! How can I assist you today?', role: 'assistant'},
  ])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    console.log('useEffect')

    const newSocket = new WebSocket(
      `wss://fitting-correctly-lioness.ngrok-free.app/ws?client_id=1234`,
    )

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
      } else if (data.event === 'notification') {
        setNotifications((notifications) => [...notifications, data.data])
      }
    }
  }, [messages])

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
          // Start of Selection
          messages: [
            ...messages.filter((message) => message.role !== 'notification'),
            newMessage,
          ],
        }),
      )
    }
  }

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="bg-primary p-4 rounded-lg mb-4">
        <h2 className="text-2xl font-bold text-primary-foreground">
          User Dashboard
        </h2>
      </div>
      <div className="flex flex-1 space-x-4">
        {/* Chatbot Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary p-4">
            <h2 className="text-xl font-bold text-primary-foreground">
              ChatBot
            </h2>
          </div>
          <ScrollArea className="flex-grow p-4">
            {messages.map((message, index) => {
              if (message.role === 'notification') {
                return (
                  <div key={index} className="mb-4">
                    <div className="flex justify-center">
                      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-md">
                        <p className="text-sm">
                          <strong>To:</strong> {message.recipient}
                        </p>
                        <p className="mt-1">{message.content}</p>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
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
              )
            })}
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

        {/* Notifications Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-secondary p-4">
            <h2 className="text-xl font-bold text-secondary-foreground">
              Notifications
            </h2>
          </div>
          <ScrollArea className="flex-grow p-4">
            <Notifications notifications={notifications} />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
