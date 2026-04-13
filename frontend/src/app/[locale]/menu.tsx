"use client"

import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Menu')

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
      setMessage(t('passwords_do_not_match'))
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
        setMessage(data.detail ?? t('request_failed_with_status', { status: response.status }))
        return
      }

      setAuthOpen(false)
      window.location.reload()
    } catch {
      setMessage(t('network_error'))
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

      if (!response.ok) {
        setMessage(t('logout_failed_with_status', { status: response.status }))
        return
      }

      window.location.reload()
    } catch {
      setMessage(t('network_error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleHabitCreate() {
    const trimmed = habitName.trim()
    if (!trimmed) {
      setHabitMessage(t('please_enter_habit_name'))
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
        setHabitMessage(data.detail ?? t('failed_to_create_habit'))
        return
      }

      setHabitName('')
      setHabitMessage(t('habit_added'))
      window.location.reload()
    } catch {
      setHabitMessage(t('network_error'))
    } finally {
      setLoading(false)
    }
  }

  async function handleHabitDelete(habit: Habit) {
    const confirmed = window.confirm(
      t('delete_habit_confirm', { name: habit.name })
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
        setHabitMessage(data.detail ?? t('failed_to_delete_habit'))
        return
      }

      window.location.reload()
    } catch {
      setHabitMessage(t('network_error'))
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
          {t('hello_user', { username: currentUsername })}
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
        {authenticated ? t('logout') : t('login')}
      </button>

      <button
        type="button"
        onClick={() => {
          setSettingsOpen((prev) => !prev)
          setAuthOpen(false)
        }}
        className="text-sm hover:text-orange-400"
      >
        {t('settings')}
      </button>

      {authOpen && !authenticated && (
        <div className="absolute right-0 top-11 z-20 w-[330px] rounded border border-gray-300 bg-white p-4 shadow-lg">
          <div className="mb-3 text-base font-semibold text-center">
            {mode === 'login' ? t('login') : t('sign_up')}
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-2">
            <input
              value={username}
              onChange={onUsernameChange}
              placeholder={t('username')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            {mode === 'register' && (
              <input
                type="email"
                value={email}
                onChange={onEmailChange}
                placeholder={t('email')}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            )}
            <input
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder={t('password')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            {mode === 'register' && (
              <input
                type="password"
                value={passwordConfirm}
                onChange={onPasswordConfirmChange}
                placeholder={t('confirm_password')}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            )}
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? t('please_wait') : mode === 'login' ? t('login') : t('sign_up')}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'register' : 'login'))
                setMessage('')
              }}
              className="w-full text-center text-xs text-gray-600 underline underline-offset-2 hover:text-gray-900"
            >
              {mode === 'login' ? t('new_here') : t('already_have_account')}
            </button>
          </form>

          {message && <p className="mt-2 text-xs text-gray-700">{message}</p>}
        </div>
      )}

      {settingsOpen && (
        <div className="absolute right-0 top-11 z-20 w-[330px] rounded border border-gray-300 bg-white p-4 shadow-lg">
          <div className="mb-3 text-lg font-medium">{t('how_to_use')}</div>
          <p className="mb-4 text-sm leading-6 text-gray-700">
            {t('how_to_use_1')}
            <br />
            {t('how_to_use_2')}
            <br />
            {t('how_to_use_3')}
          </p>

          {authenticated && (
            <div className="mt-4">
              <div className="mb-2 text-base font-medium">{t('my_habits')}</div>

              <div className="flex items-center gap-2">
                <input
                  value={habitName}
                  onChange={(event) => setHabitName(event.target.value)}
                  placeholder={t('new_habit')}
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
                  {t('add')}
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
                      {t('delete')}
                    </button>
                  </div>
                ))}
              </div>

              {habitMessage && (
                <p className="mt-2 text-xs text-gray-700">{habitMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}