"use client"

import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'

type Mode = 'login' | 'register'

type MeResponse =
  | { authenticated: false }
  | {
      authenticated: true
      user: {
        id: number
        username: string
        email: string
      }
    }

type Habit = {
  id: number
  name: string
}

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

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

export default function Menu() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUsername, setCurrentUsername] = useState('')
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitName, setHabitName] = useState('')
  const [habitMessage, setHabitMessage] = useState('')

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/auth/me/`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          setAuthenticated(false)
          setCurrentUsername('')
          return
        }

        const data: MeResponse = await response.json()

        if (data.authenticated) {
          setAuthenticated(true)
          setCurrentUsername(data.user.username)
        } else {
          setAuthenticated(false)
          setCurrentUsername('')
        }
      } catch {
        setAuthenticated(false)
        setCurrentUsername('')
      }
    }

    async function loadHabits() {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/summary/`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) {
          setHabits([])
          return
        }

        const data = await response.json()
        setHabits(Array.isArray(data.habits) ? data.habits : [])
      } catch {
        setHabits([])
      }
    }

    if (BACKEND_BASE_URL) {
      void loadMe()
      void loadHabits()
    }
  }, [])

  async function handleAuthSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()

    if (mode === 'register' && password !== passwordConfirm) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    const path = mode === 'login' ? '/api/auth/login/' : '/api/auth/register/'
    const csrftoken = getCookie('csrftoken')

    try {
      const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken ?? '',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.detail ?? `Request failed. (${response.status})`)
        return
      }

      setAuthOpen(false)
      window.location.reload()
    } catch {
      setMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoading(true)
    setMessage('')

    const csrftoken = getCookie('csrftoken')

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken ?? '',
        },
        body: JSON.stringify({}),
      })

      const text = await response.text()

      if (!response.ok) {
        setMessage(`Logout failed. (${response.status})`)
        return
      }

      window.location.reload()
    } catch {
      setMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleHabitCreate() {
    const trimmed = habitName.trim()
    if (!trimmed) {
      setHabitMessage('Please enter a habit name.')
      return
    }

    setLoading(true)
    setHabitMessage('')

    try {
      const csrftoken = getCookie('csrftoken')

      const response = await fetch(`${BACKEND_BASE_URL}/api/habits/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken ?? '',
        },
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setHabitMessage(data.detail ?? 'Failed to create habit.')
        return
      }

      setHabitName('')
      setHabitMessage('Habit added.')
      window.location.reload()
    } catch {
      setHabitMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function handleHabitDelete(habit: Habit) {
    const confirmed = window.confirm(
      `Delete "${habit.name}"?\n\nAll records for this habit will also be removed.`
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setHabitMessage('')

    try {
      const csrftoken = getCookie('csrftoken')

      const response = await fetch(`${BACKEND_BASE_URL}/api/habits/${habit.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken ?? '',
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setHabitMessage(data.detail ?? 'Failed to delete habit.')
        return
      }

      window.location.reload()
    } catch {
      setHabitMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  function onUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
  }

  function onPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
  }

  function onEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
  }

  function onPasswordConfirmChange(event: ChangeEvent<HTMLInputElement>) {
    setPasswordConfirm(event.target.value)
  }

  return (
    <div className="relative flex items-center gap-4 pr-8">
      {authenticated && (
        <p className="text-sm text-orange-300">
          Hello, {currentUsername}!
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (authenticated) {
            void handleLogout()
            return
          }

          setAuthOpen((prev) => !prev)
          setSettingsOpen(false)
          setMessage('')
        }}
        className="text-sm hover:text-orange-400"
      >
        {authenticated ? 'Logout' : 'Login'}
      </button>

      <button
        type="button"
        onClick={() => {
          setSettingsOpen((prev) => !prev)
          setAuthOpen(false)
        }}
        className="text-sm hover:text-orange-400"
      >
        Settings
      </button>

      {authOpen && !authenticated && (
        <div className="absolute right-0 top-11 z-20 w-[330px] rounded border border-gray-300 bg-white p-4 shadow-lg">
          <div className="mb-3 text-base font-semibold text-center">
            {mode === 'login' ? 'Login' : 'Sign up'}
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-2">
            <input
              value={username}
              onChange={onUsernameChange}
              placeholder="Username"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            {mode === 'register' && (
              <input
                type="email"
                value={email}
                onChange={onEmailChange}
                placeholder="Email"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            )}
            <input
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder="Password"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            {mode === 'register' && (
              <input
                type="password"
                value={passwordConfirm}
                onChange={onPasswordConfirmChange}
                placeholder="Confirm password"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            )}
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'register' : 'login'))
                setMessage('')
              }}
              className="w-full text-center text-xs text-gray-600 underline underline-offset-2 hover:text-gray-900"
            >
              {mode === 'login' ? 'New here?' : 'Already have an account?'}
            </button>
          </form>

          {message && <p className="mt-2 text-xs text-gray-700">{message}</p>}
        </div>
      )}

      {settingsOpen && (
        <div className="absolute right-0 top-11 z-20 w-[330px] rounded border border-gray-300 bg-white p-4 shadow-lg">
          <div className="mb-3 text-lg font-medium">How to use</div>
          <p className="mb-4 text-sm leading-6 text-gray-700">
            1. Click a Comments cell to edit/add text.
            <br />
            2. Click O/X cells to toggle.
            <br />
            3. Use arrows to move between months.
          </p>

          <div className="mb-3 text-sm font-medium">For our Korean users...</div>
          <p className="mb-4 text-sm leading-6 text-gray-700">
            1. Comments 칸을 클릭하여 텍스트를 입력/수정해요.
            <br />
            2. O/X를 클릭하면 습관 달성 여부를 변경할 수 있어요.
            <br />
            3. 화살표를 사용해서 다른 월로 이동할 수 있어요.
          </p>

          {authenticated && (
            <div className="mt-4">
              <div className="mb-2 text-base font-medium">My Habits</div>

            <div className="flex items-center gap-2">
              <input
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="New habit"
                className="h-9 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-500"
              />
              <button
                type="button"
                onClick={() => {
                  void handleHabitCreate()
                }}
                disabled={loading}
                className="h-9 rounded bg-black px-4 text-sm text-white disabled:opacity-60"
              >
                Add
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-700">
                    {habit.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleHabitDelete(habit)
                    }}
                    disabled={loading}
                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {habitMessage && (
              <p className="mt-2 text-xs text-gray-700">{habitMessage}</p>
            )}
          </div>)}
        </div>
      )}
    </div>
  )
}