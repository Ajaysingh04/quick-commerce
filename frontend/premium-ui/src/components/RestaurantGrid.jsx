import React from 'react'
import RestaurantCard from './RestaurantCard'

export default function RestaurantGrid({items}){
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(r => (
          <RestaurantCard key={r.id} r={r} />
        ))}
      </div>
    </section>
  )
}
