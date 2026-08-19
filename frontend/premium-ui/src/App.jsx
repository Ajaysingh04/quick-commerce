import React from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import OfferBanner from './components/OfferBanner'
import FilterSection from './components/FilterSection'
import RestaurantGrid from './components/RestaurantGrid'
import BottomNavbar from './components/BottomNavbar'
import Footer from './components/Footer'
import { restaurants } from './data/sampleRestaurants'
import './main.css'
import { motion } from 'framer-motion'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative">
          <div className="w-full h-56 sm:h-72 lg:h-96 bg-gradient-to-r from-[#FF6B00] to-[#FFB703] flex items-center">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start gap-6">
              <div className="text-white max-w-lg">
                <h1 className="text-2xl sm:text-4xl font-extrabold">Delicious food, delivered fast</h1>
                <p className="mt-2 text-sm sm:text-base">Explore top restaurants, latest offers and personalised picks.</p>
              </div>
              <div className="w-full md:w-2/3">
                <SearchBar />
              </div>
            </div>
          </div>
        </section>

        <OfferBanner />
        <FilterSection />
        <RestaurantGrid items={restaurants} />
      </main>

      <Footer />
      <BottomNavbar />
    </div>
  )
}
