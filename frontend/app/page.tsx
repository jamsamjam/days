import { Schoolbell } from 'next/font/google'
import Link from 'next/link'
import HabitTable from './habit-table'
import Menu from './menu'
import { HabitsSummaryResponse } from './types'

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
      <div className="mb-6 ml-1 flex items-start justify-between gap-4">
        <div className="flex items-center text-2xl font-semibold">
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

        <Menu />
      </div>

      <HabitTable
        habits={data.habits}
        initialRows={data.rows}
        backendBaseUrl={BACKEND_BASE_URL ?? 'http://127.0.0.1:8000'}
        rowUnitPx={rowUnitPx}
      />
    </div>
  )
}
