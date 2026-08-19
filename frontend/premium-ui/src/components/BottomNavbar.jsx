import React from 'react'
import { motion } from 'framer-motion'

export default function BottomNavbar(){
  const items = ['Home','Delivery','Dining','Orders','Profile']
  return (
    <motion.nav initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg frosted rounded-3xl shadow-lg p-3 flex justify-between">
      {items.map((it,i)=> (
        <button key={it} className={`flex-1 text-center py-2 ${i===0? 'text-[#FF6B00] font-semibold':''}`}>
          <div className="text-xs">{it}</div>
        </button>
      ))}
    </motion.nav>
  )
}
