'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Send} from 'lucide-react'
import Notifications from './Notifications' // Ensure correct import path
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-400 p-4 rounded-lg mb-4 shadow-md">
        <h2 className="text-2xl font-bold text-white">User Dashboard</h2>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 space-x-4">
        {/* Chatbot Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-400 px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">ChatBot</h2>
            {/* Optional: Add any header actions here */}
          </div>

          {/* Messages Area with Fixed Height */}
          <div className="flex flex-col flex-grow">
            <ScrollArea className="p-4 flex-grow h-80">
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
                    } max-w-full`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.role === 'user' ? 'U' : 'B'}
                      </AvatarFallback>
                      <AvatarImage
                        src={
                          message.role === 'user'
                            ? '/placeholder-user.svg'
                            : '/placeholder-assistant.svg'
                        }
                        alt={
                          message.role === 'user'
                            ? 'User Avatar'
                            : 'Assistant Avatar'
                        }
                      />
                    </Avatar>
                    <div
                      className={`mx-2 p-3 rounded-lg max-w-xs ${
                        message.role === 'user'
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-dark break-words"
                      >
                        {message.content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
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
                  className="flex-grow border border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="flex flex-col w-full md:w-1/2 bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Notifications Header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-400 px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
            {/* Optional: Add any header actions here */}
          </div>

          {/* Notifications Content */}
          <ScrollArea className="flex-grow p-4">
            <Notifications notifications={notifications} />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
