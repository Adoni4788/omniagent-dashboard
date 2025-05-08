"use client"

import { useState } from "react"
import type { Task } from "@/lib/types"
import TaskFeed from "@/components/task-feed"
import TaskDetails from "@/components/task-details"

interface MainPanelProps {
  tasks: Task[]
  selectedTask: Task | null
  setSelectedTask: (task: Task | null) => void
}

export default function MainPanel({ tasks, selectedTask, setSelectedTask }: MainPanelProps) {
  const [previewExpanded, setPreviewExpanded] = useState(true)

  return (
    <div className="w-full p-6 h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Active Tasks</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-1">
          <TaskFeed tasks={tasks} selectedTask={selectedTask} onSelectTask={setSelectedTask} />
        </div>

        <div className="lg:col-span-2">
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              previewExpanded={previewExpanded}
              setPreviewExpanded={setPreviewExpanded}
            />
          )}
        </div>
      </div>
    </div>
  )
}
