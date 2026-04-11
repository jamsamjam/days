"use client"

import { ChangeEvent, SyntheticEvent, useState } from 'react'

type Mode = 'login' | 'register'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

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

  async function handleAuthSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()

    if (mode === 'register' && password !== passwordConfirm) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    const path = mode === 'login' ? '/users/api/login/' : '/users/api/register/'

    try {
      const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include',
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data.detail ?? 'Request failed.')
        return
      }

      setMessage(mode === 'login' ? 'Logged in.' : 'Registered.')
      setAuthOpen(false)
      window.location.reload()
    } catch {
      setMessage('Network error. Check backend server and CORS settings.')
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
      <button
        type="button"
        onClick={() => {
          setAuthOpen((prev) => !prev)
          setSettingsOpen(false)
          setMessage('')
        }}
        className="text-sm hover:text-blue-400"
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => {
          setSettingsOpen((prev) => !prev)
          setAuthOpen(false)
        }}
        className="text-sm hover:text-blue-400"
      >
        Settings
      </button>

      {authOpen && (
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
          <div className="mb-3 text-lg font-semibold">How to use</div>
          <p className="mb-4 text-sm leading-6 text-gray-700">
            1) Click a comment cell to edit text.
            <br />
            2) Click a habit cell to toggle O/X.
            <br />
            3) Use arrows to move between months.
          </p>

          <div className="mb-2 text-base font-semibold">Habits</div>
          <p className="text-sm text-gray-700">blabla.</p>
        </div>
      )}
    </div>
  )
}