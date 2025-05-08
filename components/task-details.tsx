"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "@/lib/utils"
import { useTasks } from "@/hooks/use-tasks"
import { Loader2, Send, Terminal, CheckCircle, AlertTriangle, Clock } from "lucide-react"

// Safe date formatting to avoid hydration mismatches
function safeFormatDistanceToNow(dateString: string): string {
  if (typeof window === 'undefined') {
    return 'recently'
  }
  return formatDistanceToNow(new Date(dateString))
}

interface TaskDetailsProps {
  task: Task
}

export default function TaskDetails({ task }: TaskDetailsProps) {
  const [command, setCommand] = useState("")
  const [activeTab, setActiveTab] = useState("logs")
  const { submitCommand } = useTasks()
  const [isClient, setIsClient] = useState(false)
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "running":
        return "text-blue-500"
      case "error":
        return "text-red-500"
      case "awaiting":
        return "text-amber-500"
      case "pending":
        return "text-slate-400"
      case "locked":
        return "text-slate-300"
      default:
        return "text-slate-400"
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "awaiting":
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }
  
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    
    try {
      await submitCommand.mutateAsync({
        taskId: task.id,
        command: command.trim(),
        securityLevel: task.securityLevel,
      })
      
      // Clear command after submission
      setCommand("")
    } catch (error) {
      console.error("Error submitting command:", error)
      // You would show an error toast here
    }
  }
  
  // Format log text with timestamps
  const formatLogWithTimestamps = (logText: string | null) => {
    if (!logText) return null
    if (!isClient) return logText // Just return plain text during SSR
    
    // Regular expression to find timestamps in ISO format or other common formats
    const timestampRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}|\d{1,2}:\d{2}:\d{2}(?: [AP]M)?)/g
    
    // Split the log into lines
    return logText.split('\n').map((line, i) => {
      // Check if the line contains a timestamp
      const hasTimestamp = timestampRegex.test(line)
      
      // If it has a timestamp, format it nicely
      if (hasTimestamp) {
        return line.replace(timestampRegex, (match) => {
          return `<span class="text-blue-500">[${match}]</span>`
        })
      }
      
      return line
    }).join('\n')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{task.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{task.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Created {isClient ? safeFormatDistanceToNow(task.timestamp) : 'recently'}
            </span>
          </div>
        </div>
        {task.preview && (
          <Button variant="outline" asChild>
            <a href={task.preview} target="_blank" rel="noopener noreferrer">
              Preview
            </a>
          </Button>
        )}
      </div>

      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Logs & Steps</TabsTrigger>
          <TabsTrigger value="command">Command Console</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4 mt-4">
          <div className="space-y-2">
            {task.steps && task.steps.length > 0 ? (
              task.steps.map((step, index) => (
                <Card key={step.id} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <CardTitle className="text-base">{step.name}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{step.actionType}</Badge>
                      <span className={`text-xs ${getStatusColor(step.status)}`}>{step.status}</span>
                    </CardDescription>
                  </CardHeader>
                  {step.log && (
                    <CardContent className="border-t pt-3 pb-3 bg-black">
                      <pre 
                        className="text-xs text-green-400 font-mono whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: formatLogWithTimestamps(step.log) || '' 
                        }}
                      />
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No steps to display</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="command" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Command Console
              </CardTitle>
              <CardDescription>
                Enter commands to execute for this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              {task.securityLevel === 'class3' && (
                <Alert variant="warning" className="mb-4">
                  <AlertDescription>
                    This task requires approval for all commands
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleCommandSubmit} className="flex gap-2">
                <Input
                  placeholder="Type a command..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="font-mono flex-1"
                  disabled={submitCommand.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!command.trim() || submitCommand.isPending}
                >
                  {submitCommand.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Execute
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Commands</h3>
            {task.steps && 
             task.steps
              .filter(step => step.actionType === 'action')
              .map((step, index) => (
                <Card key={`${step.id}-command`}>
                  <CardContent className="p-3">
                    <div className="flex gap-2 items-center">
                      {getStatusIcon(step.status)}
                      <div className="font-mono text-sm flex-1 truncate">
                        {step.name.replace('Execute command: ', '')}
                      </div>
                      <Badge 
                        variant={step.status === 'completed' ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
            
            {(!task.steps || 
              task.steps.filter(step => step.actionType === 'action').length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No commands have been executed yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
