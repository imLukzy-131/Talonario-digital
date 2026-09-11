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
        className="h-14 min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search aria-hidden="true" className="size-5" />
        {isLoading ? 'Buscando...' : 'Consultar orden'}
      </button>
    </form>
  )
}
