import React from 'react'
import { motion } from 'framer-motion'

export default function RestaurantCard({r}){
  return (
    <motion.div whileHover={{scale:1.03}} className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="relative">
        <img src={r.image} alt={r.name} className="w-full block aspect-video object-cover" />
        <div className="absolute top-3 left-3 bg-white/80 text-xs text-slate-800 px-2 py-1 rounded-md">{r.category}</div>
        <div className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow">❤</div>
        <div className="absolute bottom-3 left-3 bg-brand text-white px-2 py-1 rounded-md text-xs">{r.freeDelivery? 'Free Delivery':'Delivery'}</div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-xl shadow">{r.rating}★</div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{r.name}</h3>
          <div className="text-sm text-slate-500">₹{r.price}</div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
          <div>{r.time}</div>
          <div>•</div>
          <div>{r.distance}</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {r.veg ? <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">VEG</div> : <div className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">NON-VEG</div>}
          {r.offer && <div className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-800">{r.offer}</div>}
          {r.freeDelivery && <div className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-800">Free Delivery</div>}
        </div>
      </div>
    </motion.div>
  )
}
