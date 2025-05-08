"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mic, Send, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CommandConsoleProps {
  inputRef?: React.RefObject<HTMLInputElement>
}

export default function CommandConsole({ inputRef }: CommandConsoleProps) {
  const [command, setCommand] = useState("")
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle command submission
    console.log("Command submitted:", command)
    setCommand("")
  }

  const startVoiceInput = () => {
    setIsListening(true)

    // Simulate voice recognition with a timeout
    setTimeout(() => {
      setCommand((prev) => prev + "Voice command recognized. ")
      setIsListening(false)
    }, 2000)
  }

  return (
    <div className="w-full border-t bg-background/80 backdrop-blur-sm py-3 px-6">
      <div className="w-full flex items-center gap-3">
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
          <ShieldAlert className="h-3 w-3" />
          <span>Class 3</span>
        </Badge>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type a command or ask a question..."
            className="flex-1"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={startVoiceInput}
                  className={isListening ? "text-primary animate-pulse" : ""}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Speak command</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" disabled={!command.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
