"use client"

import { useEffect, useMemo, useState } from 'react'

import HabitChart from './chart'
import { Habit, HabitsSummaryResponse, Row } from './types'

type HabitTableProps = {
  habits: Habit[]
  initialRows: Row[]
  backendBaseUrl: string
  rowUnitPx: number
  year: number
  month: number
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1))
    }
  }
  return null
}

export default function HabitTable({
  habits: initialHabits,
  initialRows,
  backendBaseUrl,
  rowUnitPx,
  year,
  month,
}: HabitTableProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [rows, setRows] = useState<Row[]>(initialRows)

  const tableColumns = `56px minmax(300px, 5fr) repeat(${Math.max(habits.length, 1)}, minmax(0, 1fr))`

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      try {
        await fetch(`${backendBaseUrl}/users/api/me/`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const response = await fetch(
          `${backendBaseUrl}/api/summary/?year=${year}&month=${month}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          return
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) {
          return
        }

        const data: HabitsSummaryResponse = await response.json()

        if (!cancelled) {
          setHabits(data.habits)
          setRows(data.rows)
        }
      } catch {
        // mock data is used
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [backendBaseUrl, year, month])

  const completedCounts = useMemo(
    () =>
      rows.map((row) =>
        habits.reduce((sum, habit) => sum + (row.checks[String(habit.id)] ? 1 : 0), 0)
      ),
    [rows, habits]
  )

  const updateRowInState = (updated: Row) => {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)))
  }

  const handleCommentClick = async (row: Row) => {
    if (row.id < 0) {
      return
    }

    const nextText = window.prompt('Edit comment', row.text ?? '')
    if (nextText === null) {
      return
    }

    const csrftoken = getCookie('csrftoken')

    const response = await fetch(`${backendBaseUrl}/api/rows/${row.id}/comment/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken ?? '',
      },
      body: JSON.stringify({ text: nextText }),
    })

    if (!response.ok) {
      // const errorText = await response.text()
      // console.log('comment error raw:', errorText)
      return
    }

    const data = await response.json()
    if (data.row) {
      updateRowInState(data.row as Row)
    }
  }

  const handleHabitClick = async (row: Row, habit: Habit) => {
    if (row.id < 0) {
      return
    }

    const csrftoken = getCookie('csrftoken')

    const response = await fetch(`${backendBaseUrl}/api/rows/${row.id}/check/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken ?? '',
      },
      body: JSON.stringify({ habit_id: habit.id }),
    })

    if (!response.ok) {
      return
    }

    const data = await response.json()
    if (data.row) {
      updateRowInState(data.row as Row)
    }
  }

  return (
    <div className={'mt-2 flex flex-col gap-6 lg:flex-row'}>
      <div className="min-w-0 flex-1">
        <div
          className="mb-2 grid gap-2 border-b border-gray-400 pb-2"
          style={{ gridTemplateColumns: tableColumns }}
        >
          <div className="text-center font-semibold">Date</div>
          <div className="font-semibold">Comments</div>
          {habits.map((habit) => (
            <div key={habit.id} className="text-center font-semibold capitalize">
              {habit.name}
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
            <button
              type="button"
              onClick={() => {
                void handleCommentClick(row)
              }}
              className="min-w-0 cursor-pointer text-left hover:bg-gray-50"
            >
              <p>{row.text}</p>
            </button>

            {habits.map((habit) => (
              <button
                key={habit.id}
                type="button"
                onClick={() => {
                  void handleHabitClick(row, habit)
                }}
                className="cursor-pointer text-center hover:bg-gray-50"
              >
                {row.checks[String(habit.id)] === true ? 'O' : row.checks[String(habit.id)] === false ? 'X' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="lg:w-64">
        <div className="invisible font-semibold">Daily Comments</div>

        <HabitChart
          labels={rows.map((row) => row.date)}
          values={completedCounts}
          yMax={habits.length}
          rowUnitPx={rowUnitPx}
        />
      </div>
    </div>
  )
}