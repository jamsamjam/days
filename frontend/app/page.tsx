import Link from 'next/link'
import HabitTable from './habit-table'
import Menu from './menu'
import { HabitsSummaryResponse } from './types'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL
const rowUnitPx = 35

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed
}

function buildMockSummary(year: number, month: number): HabitsSummaryResponse {
  const daysInMonth = new Date(year, month, 0).getDate()

  const habits = [
    { id: 1, name: 'Drink Water 2L' },
    { id: 2, name: 'Running 1km' },
    { id: 3, name: 'Study' },
  ]

  const rows = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    let text = ''
    let checks: Record<string, boolean> = {}

    if (day === 1) {
      text = 'Good start'
      checks = {
        '1': false,
        '2': false,
        '3': true,
      }
    } else if (day === 2) {
      text = 'Busy day'
      checks = {
        '1': true,
        '2': false,
        '3': false,
      }
    } else if (day === 3) {
      text = "Yay.. I feel like I'm getting back on track!"
      checks = {
        '1': true,
        '2': true,
        '3': true,
      }
    } else if (day === 4) {
      text = 'Not bad, right?'
      checks = {
        '1': true,
        '2': true,
        '3': false,
      }
    }

    return {
      id: -day,
      date,
      text,
      checks,
    }
  })

  return {
    habits,
    rows,
    completed_counts: rows.map((row) =>
      habits.reduce((sum, habit) => sum + (row.checks[String(habit.id)] ? 1 : 0), 0)
    ),
    year,
    month,
  }
}

async function getSummaryData(year: number, month: number): Promise<HabitsSummaryResponse> {
  return buildMockSummary(year, month)
}

type HomeProps = {
  searchParams?: Promise<{
    year?: string
    month?: string
  }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {}
  const now = new Date()
  const requestedYear = parsePositiveInt(params.year, now.getFullYear())
  const requestedMonth = parsePositiveInt(params.month, now.getMonth() + 1)
  const normalizedMonth = Math.min(Math.max(requestedMonth, 1), 12)

  const data = await getSummaryData(requestedYear, normalizedMonth)

  const currentMonthDate = new Date(Date.UTC(data.year, data.month - 1, 1))
  const prevMonthDate = new Date(Date.UTC(data.year, data.month - 2, 1))
  const nextMonthDate = new Date(Date.UTC(data.year, data.month, 1))

  const monthTitle = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(currentMonthDate)

  return (
    <div className="ml-2 w-full px-10 py-6">
      <div className="mb-6 ml-1 flex items-start justify-between">
        <div className="flex items-center text-2xl font-semibold">
          <Link
            href={`/?year=${prevMonthDate.getUTCFullYear()}&month=${prevMonthDate.getUTCMonth() + 1}`}
            className="hover:text-gray-400"
          >
            &lt;
          </Link>
          <div className="min-w-40 text-center font-semibold">{monthTitle}</div>
          <Link
            href={`/?year=${nextMonthDate.getUTCFullYear()}&month=${nextMonthDate.getUTCMonth() + 1}`}
            className="hover:text-gray-400"
          >
            &gt;
          </Link>
        </div>

        <Menu />
      </div>

      <HabitTable
        habits={data.habits}
        initialRows={data.rows}
        backendBaseUrl={BACKEND_BASE_URL!}
        rowUnitPx={rowUnitPx}
        year={requestedYear}
        month={normalizedMonth}
      />
    </div>
  )
}