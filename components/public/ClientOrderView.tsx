import { Clock3, Laptop, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/index'

interface ClientOrderViewProps {
  order: Order
}

const statusStyles: Record<string, string> = {
  Pendiente: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  'En diagnóstico': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  'Esperando confirmación': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  'Esperando repuesto': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  'En reparación': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  Completado: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Entregado: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
}

function publicStatus(status: string) {
  return status === 'Completado' ? 'Listo para retirar' : status
}

function elapsedTime(createdAt: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000))
  return days === 0 ? 'Ingresó hoy' : `En taller hace ${days} día${days === 1 ? '' : 's'}`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function ClientOrderView({ order }: ClientOrderViewProps) {
  const history = [...(order.historial ?? [])].reverse()
  const displayStatus = publicStatus(order.status)

  return (
    <article className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/40 p-8 neon-border">
      <header className="flex flex-col gap-5 border-b border-slate-700 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">Orden de reparación</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">#{order.numeroOrden}</h2>
          <p className="mt-2 text-muted-foreground">{order.tipoEquipo} · {order.marca} {order.modelo}</p>
        </div>
        <Badge className={`w-fit rounded-full border px-3 py-1.5 text-sm ${statusStyles[order.status] ?? 'border-border bg-muted text-muted-foreground'}`}>
          {displayStatus}
        </Badge>
      </header>

      <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="size-4" /> Técnico a cargo</div>
              <p className="mt-2 font-medium text-foreground">{order.tecnicoAsignado || 'Equipo técnico JR Computación'}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" /> Tiempo transcurrido</div>
              <p className="mt-2 font-medium text-foreground">{elapsedTime(order.createdAt)}</p>
            </div>
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2"><Laptop className="size-4 text-primary" /><h3 className="font-semibold text-foreground">Problema reportado</h3></div>
            <p className="rounded-xl border border-border bg-background/40 p-4 leading-6 text-muted-foreground">{order.problemaReportado || 'No se registró una descripción.'}</p>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>Esta vista muestra únicamente información pública del seguimiento. Los datos internos y económicos están protegidos.</p>
          </div>
        </div>

        <section aria-labelledby="timeline-title">
          <h3 id="timeline-title" className="mb-5 font-semibold text-foreground">Historial del equipo</h3>
          {history.length > 0 ? (
            <ol className="relative ml-2 space-y-4 border-l-2 border-cyan-500/50 pl-6">
              {history.map((entry, index) => (
                <li key={`${entry.fecha}-${entry.estado}-${index}`} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-cyan-400" />
                  <p className="text-cyan-300 text-xs">{formatDate(entry.fecha)}</p>
                  <p className="mt-1 font-semibold text-white">{publicStatus(entry.estado)}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{entry.detalle}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">El historial se actualizará a medida que avance la reparación.</p>
          )}
        </section>
      </div>
    </article>
  )
}
