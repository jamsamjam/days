import { Schoolbell } from 'next/font/google'
import Link from 'next/link'
import HabitChart from './chart'
import { Habit, HabitsSummaryResponse, Row } from './types'

const schoolbell = Schoolbell({
  weight: '400'
})

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL
const rowUnitPx = 35.1

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed
}

async function getSummaryData(year: number, month: number): Promise<HabitsSummaryResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/habits/api/summary/?year=${year}&month=${month}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return { habits: [], rows: [], completed_counts: [], year, month }
  }

  return response.json()
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
  const habits: Habit[] = data.habits
  const rows: Row[] = data.rows
  const totalHabits = habits.length
  const tableColumns = `56px minmax(300px, 5fr) repeat(${Math.max(totalHabits, 1)}, minmax(0, 1fr))`
  const completedCounts = data.completed_counts

  const currentMonthDate = new Date(Date.UTC(data.year, data.month - 1, 1))
  const prevMonthDate = new Date(Date.UTC(data.year, data.month - 2, 1))
  const nextMonthDate = new Date(Date.UTC(data.year, data.month, 1))
  const monthTitle = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  }).format(currentMonthDate)

  return (
    <div className={`${schoolbell.className} w-full px-10 py-6 ml-2`}>
      <div className="mb-6 ml-1 flex items-center text-2xl font-semibold">
        <Link
          href={`/?year=${prevMonthDate.getUTCFullYear()}&month=${prevMonthDate.getUTCMonth() + 1}`}
          className="hover:text-gray-400"
        >
          ←
        </Link>
        <div className="min-w-40 text-center font-semibold">{monthTitle}</div>
        <Link
          href={`/?year=${nextMonthDate.getUTCFullYear()}&month=${nextMonthDate.getUTCMonth() + 1}`}
          className="hover:text-gray-400"
        >
          →
        </Link>
      </div>

      <div className={"mt-2 flex flex-col gap-6 lg:flex-row"}>
        <div className="min-w-0 flex-1">
          <div
            className="mb-2 grid gap-2 border-b border-gray-400 pb-2"
            style={{ gridTemplateColumns: tableColumns }}
          >
            <div className="text-center font-semibold">Date</div>
            <div className="font-semibold">Comments</div>
            {habits.map((habit) => (
              <div key={habit} className="text-center font-semibold capitalize">
                {habit}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div
              key={row.id}
              className="grid border-b border-gray-200 py-[5px]"
              style={{ gridTemplateColumns: tableColumns }}
            >
              <div className="text-center">
                {new Date(`${row.date}T00:00:00`).getDate()}
              </div>
              <div className="min-w-0">
                <p>{row.text}</p>
              </div>

              {habits.map((habit) => (
                <div key={habit} className="text-center">
                  {row.checks[habit] === true ? 'O' : row.checks[habit] === false ? 'X' : ''}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="lg:w-64">
          <div className="invisible font-semibold">Daily Comments</div>

          <HabitChart
            labels={rows.map((row) => row.date)}
            values={completedCounts}
            yMax={totalHabits}
            rowUnitPx={rowUnitPx}
          />
        </div>
      </div>
    </div>
  )
}
