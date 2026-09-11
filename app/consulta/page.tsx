'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, SearchX, Wrench } from 'lucide-react'
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <a href="/" className="mb-14 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> Volver al inicio
        </a>

        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-10 text-center">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Wrench aria-hidden="true" className="size-7" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">JR Computación</p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Seguimiento de tu equipo</h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-6 text-muted-foreground">Consultá el estado de tu reparación de forma simple y segura con tu número de orden.</p>
          </header>

          <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-xl shadow-black/10 sm:p-7" aria-label="Buscar orden">
            <p className="mb-4 text-sm font-medium text-foreground">Número de orden</p>
            <OrderSearchForm onSearch={handleSearch} isLoading={isLoading} />
            {error && (
              <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                <SearchX aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </section>

          {order && <div className="mt-8"><ClientOrderView order={order} /></div>}

          {!order && !error && (
            <p className="mt-8 text-center text-sm text-muted-foreground">Tu número de orden figura en el comprobante que recibiste al dejar tu equipo.</p>
          )}
        </div>

        <footer className="mt-auto pt-14 text-center text-xs text-muted-foreground">Información de seguimiento · JR Computación</footer>
      </div>
    </main>
  )
}
