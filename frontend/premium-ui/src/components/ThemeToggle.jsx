import React, {useState, useEffect} from 'react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(() => false)
  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
  },[dark])
  return (
    <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg frosted shadow-sm">
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 5.47a1 1 0 011.42 0l.7.7a1 1 0 11-1.42 1.42l-.7-.7a1 1 0 010-1.42zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM15.78 14.53a1 1 0 010 1.42l-.7.7a1 1 0 11-1.42-1.42l.7-.7a1 1 0 011.42 0z"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293a8 8 0 11-10.586-10.586A8 8 0 0017.293 13.293z"/></svg>
      )}
    </button>
  )
}
