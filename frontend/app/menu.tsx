"use client"

import { useState } from 'react'

export default function Menu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex items-center gap-4 pr-8">
      <button
        type="button"
        className="text-sm hover:text-blue-400"
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm hover:text-blue-400"
      >
        Settings
      </button>

      {open && (
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
