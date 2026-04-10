import { Schoolbell } from 'next/font/google'
import HabitChart from './chart'
import { Row, Habit } from './types'

const schoolbell = Schoolbell({
  weight: '400'
})

const habits: Habit[] = ['water', 'exercise', 'study']

const totalHabits = habits.length
const tableColumns = `minmax(300px, 5fr) repeat(${totalHabits}, minmax(0, 1fr))`
const rowUnitPx = 40

const rows: Row[] = [
  {
    date: '2026-04-10',
    text: 'Today it was a sunny day!',
    checks: {
      water: true,
      exercise: true,
      study: true
    }
  },
  {
    date: '2026-04-11',
    text: 'Today it was a rainy day..',
    checks: {
      water: true,
      exercise: false,
      study: false
    }
  },
  {
    date: '2026-04-12',
    text: 'Today...',
    checks: {
      water: true,
      exercise: false,
      study: false
    }
  },
]

export default function Home() {
  const completedCounts = rows.map((row) =>
    habits.reduce((sum, habit) => sum + (row.checks[habit] ? 1 : 0), 0)
  )

  return (
    <div className={`${schoolbell.className} w-full px-4 py-6`}>
      <div className="mb-4 text-2xl">My Daily Habit Tracker :)</div>

      <div className={"mt-2 flex flex-col gap-6 lg:flex-row"}>
        <div className="min-w-0 flex-1">
          <div
            className="mb-2 grid gap-2 border-b border-gray-400 pb-2"
            style={{ gridTemplateColumns: tableColumns }}
          >
            <div className="font-semibold">Comments</div>
            {habits.map((habit) => (
              <div key={habit} className="text-center font-semibold capitalize">
                {habit}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div
              key={row.date}
              className="grid gap-1 border-b border-gray-200 py-2"
              style={{ gridTemplateColumns: tableColumns }}
            >
              <div className="min-w-0">
                <p>{row.text}</p>
              </div>

              {habits.map((habit) => (
                <div key={habit} className="text-center">
                  {row.checks[habit] ? 'O' : 'X'}
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
