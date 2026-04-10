"use client"

import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type HabitChartProps = {
  labels: string[]
  values: number[]
  yMax: number
  rowUnitPx?: number
  axisLabelOffsetPx?: number
}

export default function HabitChart({
  labels,
  values,
  yMax,
  rowUnitPx = 40,
  axisLabelOffsetPx = 12
}: HabitChartProps) {
  const chartLengthPx = Math.max(labels.length * rowUnitPx, rowUnitPx)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Completed Habits',
        data: values,
        borderColor: '#111827',
        backgroundColor: '#111827',
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0.25
      }
    ]
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false,
        reverse: true,
        offset: false,
        ticks: {
          autoSkip: false
        }
      },
      y: {
        min: 0,
        max: Math.max(yMax, 1),
        position: 'right',
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        }
      }
    }
  }

  return (
    <div className="relative w-full" style={{ height: `${chartLengthPx}px` }}>
      <div
        className="absolute left-1/2 h-48 -translate-x-1/2 -translate-y-1/2 -rotate-90"
        style={{
          top: `calc(50% - ${axisLabelOffsetPx}px)`,
          width: `${chartLengthPx}px`
        }}
      >
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}
