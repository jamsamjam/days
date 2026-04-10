export type Habit = 'water' | 'exercise' | 'study'

export type Row = {
  date: string
  text: string
  checks: Record<Habit, boolean>
}