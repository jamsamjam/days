export type Habit = {
  id: number
  name: string
}

export type Row = {
  id: number
  date: string
  text: string
  checks: Record<string, boolean>
}

export type HabitsSummaryResponse = {
  habits: Habit[]
  rows: Row[]
  completed_counts: number[]
  year: number
  month: number
}