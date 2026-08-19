import React from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header(){
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white font-bold">B</div>
        <div className="hidden sm:block">
          <div className="text-sm text-slate-600">Delivering to</div>
          <div className="text-base font-semibold">Current Location ▾</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg frosted shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h4a2 2 0 012 2v1H4v9a1 1 0 01-1 1H2V5z"/></svg>
          <span className="text-sm">Orders</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  )
}
