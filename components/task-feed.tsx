"use client"

import type { Task } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/utils"
import { Lock, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskFeedProps {
  tasks: Task[]
  selectedTask: Task | null
  onSelectTask: (task: Task) => void
  isLoading?: boolean
}

export default function TaskFeed({ tasks, selectedTask, onSelectTask, isLoading = false }: TaskFeedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-slate-400"
      case "running":
        return "bg-blue-500"
      case "awaiting_approval":
        return "bg-amber-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-slate-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "queued":
        return "Queued"
      case "running":
        return "Running"
      case "awaiting_approval":
        return "Awaiting Approval"
      case "completed":
        return "Completed"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  const getSecurityLevelBadge = (level: string) => {
    switch (level) {
      case "class1":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
            Basic
          </Badge>
        )
      case "class2":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            Sensitive
          </Badge>
        )
      case "class3":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Secure
          </Badge>
        )
      default:
        return null
    }
  }

  // Render loading skeletons
  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTask?.id === task.id ? "ring-2 ring-primary" : ""
          } ${task.id.startsWith('optimistic') ? 'opacity-70' : ''}`}
          onClick={() => onSelectTask(task)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-medium">{task.name}</h3>
                  {task.securityLevel === "class3" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lock className="h-3.5 w-3.5 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Requires user confirmation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(task.status)} text-white flex items-center gap-1`}
                  >
                    {task.status === 'running' && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {getStatusText(task.status)}
                  </Badge>
                  {getSecurityLevelBadge(task.securityLevel)}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(task.timestamp))}
                  </span>
                </div>
                {task.steps && task.steps.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.steps.length} step{task.steps.length !== 1 && 's'} • Last updated: {
                      formatDistanceToNow(
                        new Date(
                          task.steps.reduce((latest, step) => {
                            const stepDate = new Date(task.timestamp) // We would use step's own timestamp in real app
                            return stepDate > latest ? stepDate : latest
                          }, new Date(0))
                        )
                      )
                    }
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {tasks.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks found</p>
          <p className="text-sm mt-1">Create a new task to get started</p>
        </div>
      )}
      
      {isLoading && tasks.length > 0 && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
