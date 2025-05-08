export type TaskStatus = "queued" | "running" | "awaiting_approval" | "completed" | "error"

export type StepStatus = "completed" | "running" | "error" | "awaiting" | "pending" | "locked"

export type ActionType =
  | "analysis"
  | "generation"
  | "confirmation"
  | "action"
  | "data"
  | "preparation"
  | "scheduling"
  | "review"
  | "testing"
  | "verification"

export type SecurityLevel = "class1" | "class2" | "class3"

export interface Step {
  id: string
  name: string
  actionType: string
  status: StepStatus
  log: string | null
}

export interface Task {
  id: string
  name: string
  status: string
  timestamp: string
  steps: Step[]
  preview: string | null
  securityLevel: SecurityLevel
}
