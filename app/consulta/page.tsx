'use client'

import { useEffect, useState } from 'react'
import { SearchX } from 'lucide-react'
import { OrderSearchForm } from '@/components/public/OrderSearchForm'
import { ClientOrderView } from '@/components/public/ClientOrderView'
import { loadOrdersFromStorage } from '@/utils/storage'
import type { Order } from '@/types/index'

export default function ConsultaPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = 'Consultar orden | JR Computación'
  }, [])

  const handleSearch = (value: string) => {
    const normalized = value.trim()
    setOrder(null)
    setError('')

    if (!normalized) {
      setError('Ingresá tu número de orden para comenzar la consulta.')
      return
    }
    if (!/^\d{1,8}$/.test(normalized)) {
      setError('El número de orden debe contener solamente números.')
      return
    }

    setIsLoading(true)
    window.setTimeout(() => {
      const found = loadOrdersFromStorage().find((item) => item.numeroOrden === normalized || item.numeroOrden === normalized.padStart(5, '0'))
      if (found) setOrder(found)
      else setError('No encontramos una orden con ese número. Revisá el dato e intentá nuevamente.')
      setIsLoading(false)
    }, 250)
  }

  return (
    <main className="w-full min-h-screen p-8 flex items-center justify-center bg-slate-900 text-white">
      <div className="max-w-6xl w-full">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Consulta de Estado de Equipo</span>
          </h1>
          <p className="text-slate-400 text-lg">Ingrese su número de orden para realizar el seguimiento en tiempo real</p>
        </header>

        <section className="bg-slate-800/40 border border-slate-700 rounded-lg p-8 neon-border" aria-label="Buscar orden">
          <p className="mb-4 text-sm font-semibold text-white">Número de orden</p>
          <OrderSearchForm onSearch={handleSearch} isLoading={isLoading} />
          {error && (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <SearchX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {order && <div className="mt-8"><ClientOrderView order={order} /></div>}

        {!order && !error && (
          <p className="mt-8 text-center text-sm text-slate-400">Tu número de orden figura en el comprobante que recibiste al dejar tu equipo.</p>
        )}
      </div>
    </main>
  )
}
