import React from 'react'

export default function FilterSection(){
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 items-center">
      <button className="px-3 py-2 rounded-full bg-white shadow-sm text-sm">Veg Only</button>
      <button className="px-3 py-2 rounded-full bg-white shadow-sm text-sm">Rating 4+</button>
      <button className="px-3 py-2 rounded-full bg-white shadow-sm text-sm">Fast Delivery</button>
      <button className="px-3 py-2 rounded-full bg-white shadow-sm text-sm">Offers</button>
      <div className="ml-auto text-sm text-slate-500">Price Range</div>
    </div>
  )
}
