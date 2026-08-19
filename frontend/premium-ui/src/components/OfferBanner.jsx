import React from 'react'

export default function OfferBanner(){
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="rounded-2xl p-4 frosted shadow-md flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">Special Offer</div>
          <div className="text-xl font-bold">Flat 20% off on first order</div>
        </div>
        <div className="text-sm text-slate-500">Use code: WELCOME20</div>
      </div>
    </div>
  )
}
