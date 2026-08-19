import React from 'react'
import { motion } from 'framer-motion'

export default function SearchBar(){
  return (
    <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 bg-white rounded-full shadow-sm p-2 md:p-3">
        <button className="p-2 rounded-full text-[#FF6B00]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 4a4 4 0 100 8 4 4 0 000-8z"/><path d="M12.9 14.32a6 6 0 111.42-1.42l3.3 3.3-1.42 1.42-3.3-3.3z"/></svg>
        </button>
        <input placeholder="Search for restaurants, dishes or cuisines" className="flex-1 outline-none px-3 bg-transparent text-sm md:text-base h-10 md:h-12" />
        <button className="p-2 rounded-full text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </motion.div>
  )
}
