"use client"

import { useState, useRef } from "react"
import Sidebar from "@/components/sidebar"
import MainPanel from "@/components/main-panel"
import CommandConsole from "@/components/command-console"
import SettingsPanel from "@/components/settings-panel"
import LivePreviewPanel from "@/components/live-preview-panel"
import type { Task } from "@/lib/types"
import { SidebarProvider } from "@/components/ui/sidebar"

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: "task-1",
    name: "Respond to John – Zendesk",
    status: "running",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    securityLevel: "class1",
    steps: [
      {
        id: "step-1",
        name: "Analyze request",
        actionType: "analysis",
        status: "completed",
        log: "Request analyzed successfully",
      },
      {
        id: "step-2",
        name: "Generate response",
        actionType: "generation",
        status: "running",
        log: "Drafting response to customer inquiry...",
      },
      { id: "step-3", name: "Await approval", actionType: "confirmation", status: "pending", log: null },
      { id: "step-4", name: "Send response", actionType: "action", status: "locked", log: null },
    ],
    preview:
      "Hi John, thank you for reaching out about your subscription issue. I can see that your account was charged twice for the monthly plan. I've initiated a refund for the duplicate charge, which should appear on your account within 3-5 business days...",
  },
  {
    id: "task-2",
    name: "Update product inventory – Shopify",
    status: "awaiting_approval",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    securityLevel: "class2",
    steps: [
      {
        id: "step-1",
        name: "Fetch inventory data",
        actionType: "data",
        status: "completed",
        log: "Retrieved current inventory levels",
      },
      {
        id: "step-2",
        name: "Calculate adjustments",
        actionType: "analysis",
        status: "completed",
        log: "Determined necessary inventory updates",
      },
      {
        id: "step-3",
        name: "Prepare update",
        actionType: "preparation",
        status: "completed",
        log: "Update ready for approval",
      },
      {
        id: "step-4",
        name: "Await approval",
        actionType: "confirmation",
        status: "awaiting",
        log: "Waiting for admin confirmation",
      },
      { id: "step-5", name: "Apply changes", actionType: "action", status: "locked", log: null },
    ],
    preview:
      "Ready to update 24 product variants with new inventory levels. This will reduce stock for 15 items and increase stock for 9 items.",
  },
  {
    id: "task-3",
    name: "Schedule social media posts – Buffer",
    status: "queued",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    securityLevel: "class1",
    steps: [
      { id: "step-1", name: "Generate content", actionType: "generation", status: "pending", log: null },
      { id: "step-2", name: "Select posting times", actionType: "scheduling", status: "locked", log: null },
      { id: "step-3", name: "Preview posts", actionType: "review", status: "locked", log: null },
      { id: "step-4", name: "Schedule posts", actionType: "action", status: "locked", log: null },
    ],
    preview: null,
  },
  {
    id: "task-4",
    name: "Analyze customer feedback – SurveyMonkey",
    status: "completed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    securityLevel: "class2",
    steps: [
      {
        id: "step-1",
        name: "Collect survey data",
        actionType: "data",
        status: "completed",
        log: "Retrieved 245 survey responses",
      },
      {
        id: "step-2",
        name: "Analyze sentiment",
        actionType: "analysis",
        status: "completed",
        log: "Sentiment analysis complete: 72% positive, 18% neutral, 10% negative",
      },
      {
        id: "step-3",
        name: "Generate report",
        actionType: "generation",
        status: "completed",
        log: "Report generated successfully",
      },
      {
        id: "step-4",
        name: "Send to stakeholders",
        actionType: "action",
        status: "completed",
        log: "Report sent to 5 stakeholders",
      },
    ],
    preview:
      "Customer Satisfaction Report - May 2025: Overall satisfaction score of 4.2/5, representing a 0.3 point increase from previous quarter. Key areas of improvement: checkout process and mobile app experience.",
  },
  {
    id: "task-5",
    name: "Debug payment gateway – Stripe",
    status: "error",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    securityLevel: "class3",
    steps: [
      {
        id: "step-1",
        name: "Analyze error logs",
        actionType: "analysis",
        status: "completed",
        log: "Identified API timeout issues",
      },
      {
        id: "step-2",
        name: "Test connection",
        actionType: "testing",
        status: "error",
        log: "Connection test failed: Error 503 Service Unavailable",
      },
      { id: "step-3", name: "Apply fix", actionType: "action", status: "locked", log: null },
      { id: "step-4", name: "Verify solution", actionType: "verification", status: "locked", log: null },
    ],
    preview:
      "ERROR: Unable to establish connection with Stripe API. The service appears to be experiencing downtime. Recommended action: Wait for service restoration or contact Stripe support.",
  },
]

export default function Dashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(mockTasks[0])
  const [activeView, setActiveView] = useState("tasks")
  const commandInputRef = useRef<HTMLInputElement>(null)

  const handleViewChange = (view: string) => {
    setActiveView(view)

    // If Command Console is selected, focus the input
    if (view === "console" && commandInputRef.current) {
      setTimeout(() => {
        commandInputRef.current?.focus()
      }, 100)
    }
  }

  // Render the appropriate content based on the active view
  const renderMainContent = () => {
    switch (activeView) {
      case "tasks":
        return <MainPanel tasks={mockTasks} selectedTask={selectedTask} setSelectedTask={setSelectedTask} />
      case "preview":
        return <LivePreviewPanel />
      case "settings":
        return <SettingsPanel />
      default:
        return <MainPanel tasks={mockTasks} selectedTask={selectedTask} setSelectedTask={setSelectedTask} />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar activeView={activeView} setActiveView={handleViewChange} />

        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <div className="flex-1 w-full overflow-auto">{renderMainContent()}</div>
          <CommandConsole inputRef={commandInputRef} />
        </div>
      </div>
    </SidebarProvider>
  )
}
