"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import type { StockData } from "@/lib/types"

interface StockHeaderProps {
  stock: StockData
}

export function StockHeader({ stock }: StockHeaderProps) {
  const router = useRouter()
  const [searchTicker, setSearchTicker] = useState(stock.ticker.toLowerCase())

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchTicker.trim() && searchTicker.toUpperCase() !== stock.ticker) {
      router.push(`/${searchTicker.toUpperCase()}`)
    }
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold tracking-tight">Guilvestor</h1>
          <form onSubmit={handleSearch} className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une action..."
              className="w-64 pl-9"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
            />
          </form>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Superstocks
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Superinvestors
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Watchlists
          </a>
        </nav>
      </div>
      
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg font-bold text-primary">{stock.ticker.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {stock.name} ({stock.ticker})
            </h2>
            <p className="text-sm text-muted-foreground">{stock.exchange}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            {stock.price.toFixed(2)} {stock.currency}
          </p>
          <p className="text-sm text-muted-foreground">
            Capitalisation : {stock.marketCap} {stock.marketCapUnit}
          </p>
        </div>
      </div>
    </header>
  )
}
