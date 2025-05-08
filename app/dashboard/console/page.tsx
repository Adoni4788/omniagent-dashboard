'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Terminal as TerminalIcon, SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type LogEntry = {
  id: string
  type: 'input' | 'output' | 'error' | 'info'
  text: string
  timestamp: Date
}

export default function ConsolePage() {
  const [history, setHistory] = useState<LogEntry[]>([
    {
      id: '1',
      type: 'info',
      text: 'OmniAgent Console initialized. Type a command to begin.',
      timestamp: new Date(),
    },
  ])
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to the end when new messages arrive
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    
    // Add the command to history
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      type: 'input',
      text: command,
      timestamp: new Date(),
    }
    
    setHistory((prev) => [...prev, newEntry])
    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(() => {
      let responseType: 'output' | 'error' = 'output'
      let responseText = 'Command processed successfully.'
      
      // Simple command handling for demo purposes
      if (command.toLowerCase().includes('help')) {
        responseText = 'Available commands: help, clear, status, echo [text], time'
      } else if (command.toLowerCase().includes('clear')) {
        setHistory([{
          id: Date.now().toString(),
          type: 'info',
          text: 'Console cleared.',
          timestamp: new Date(),
        }])
        setCommand('')
        setIsProcessing(false)
        return
      } else if (command.toLowerCase().includes('status')) {
        responseText = 'System status: All systems operational.'
      } else if (command.toLowerCase().includes('time')) {
        responseText = `Current time: ${new Date().toLocaleTimeString()}`
      } else if (command.toLowerCase().startsWith('echo ')) {
        responseText = command.substring(5)
      } else if (command.toLowerCase().includes('error')) {
        responseType = 'error'
        responseText = 'Error: Command failed to execute.'
      }
      
      // Add the response to history
      const responseEntry: LogEntry = {
        id: (Date.now() + 1).toString(),
        type: responseType,
        text: responseText,
        timestamp: new Date(),
      }
      
      setHistory((prev) => [...prev, responseEntry])
      setCommand('')
      setIsProcessing(false)
    }, 500)
  }
  
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-6">Command Console</h1>
      
      <Card className="h-[calc(100%-4rem)]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TerminalIcon className="mr-2 h-5 w-5" />
            Console
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="font-mono text-sm h-[calc(100vh-18rem)] overflow-y-auto p-4 bg-black text-green-400">
            {history.map((entry) => (
              <div key={entry.id} className={`mb-2 ${entry.type === 'error' ? 'text-red-400' : entry.type === 'info' ? 'text-blue-400' : ''}`}>
                <span className="opacity-60">[{entry.timestamp.toLocaleTimeString()}] </span>
                {entry.type === 'input' ? '> ' : ''}
                {entry.text}
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a command..."
              className="font-mono"
              disabled={isProcessing}
            />
            <Button type="submit" disabled={!command.trim() || isProcessing}>
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 