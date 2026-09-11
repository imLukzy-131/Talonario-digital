'use client'

import { Search } from 'lucide-react'
import { FormEvent, useState } from 'react'

interface OrderSearchFormProps {
  onSearch: (orderNumber: string) => void
  isLoading?: boolean
}

export function OrderSearchForm({ onSearch, isLoading = false }: OrderSearchFormProps) {
  const [orderNumber, setOrderNumber] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(orderNumber)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor="order-number" className="sr-only">Número de orden</label>
      <input
        id="order-number"
        value={orderNumber}
        onChange={(event) => setOrderNumber(event.target.value)}
        placeholder="Ej. 00001"
        inputMode="numeric"
        autoComplete="off"
        className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-cyan-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60 neon-glow"
      >
        <Search aria-hidden="true" className="size-5" />
        {isLoading ? 'Buscando...' : 'Consultar orden'}
      </button>
    </form>
  )
}
