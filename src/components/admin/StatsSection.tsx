import type { Estadisticas } from './types'
import { IconoEstrella, IconoPedidos, IconoVentas } from './icons'

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

interface Props {
  estadisticas: Estadisticas
}

export default function StatsSection({ estadisticas }: Props) {
  const top = estadisticas.producto_mas_vendido
  const promedio =
    estadisticas.num_pedidos > 0
      ? estadisticas.total_ventas / estadisticas.num_pedidos
      : 0

  return (
    <section className="grid gap-4 md:grid-cols-3" aria-label="Estadísticas del día">
      <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Ventas del día
            </span>
            <p className="mt-1 font-mono text-3xl font-black text-stone-900">
              {formatoMoneda.format(estadisticas.total_ventas)}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-stone-500">
              Ticket promedio {formatoMoneda.format(promedio)}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <IconoVentas className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 border-t border-stone-100 pt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Cobros confirmados
          </span>
        </div>
      </article>

      <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Pedidos totales
            </span>
            <p className="mt-1 font-mono text-3xl font-black text-stone-900">
              {estadisticas.num_pedidos}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-stone-500">
              Registrados durante la jornada
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <IconoPedidos className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 border-t border-stone-100 pt-3">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-blue-700">
            Incluye pedidos entregados
          </span>
        </div>
      </article>

      <article className="rounded-2xl border border-stone-200/80 border-l-4 border-l-brand-gold bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">
              Producto más vendido
            </span>
            {top ? (
              <>
                <p className="mt-1 truncate text-lg font-extrabold leading-tight text-stone-900">
                  {top.nombre}
                </p>
                <p className="mt-1 font-mono text-xs font-extrabold text-stone-500">
                  {top.unidades} {top.unidades === 1 ? 'unidad vendida' : 'unidades vendidas'}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-extrabold leading-tight text-stone-900">
                  Aún sin ventas
                </p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  Los pedidos del día aparecerán aquí.
                </p>
              </>
            )}
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-brand-gold">
            <IconoEstrella className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 border-t border-stone-100 pt-3">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-800">
            #1 del día
          </span>
        </div>
      </article>
    </section>
  )
}
