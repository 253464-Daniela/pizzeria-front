import type { HistorialPrecio } from './types'
import { IconoHistorial } from './icons'

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

interface Props {
  historial: HistorialPrecio[]
}

function formatearFecha(iso: string) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistorySection({ historial }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-stone-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
              <IconoHistorial className="h-4 w-4" />
            </span>
            Historial de precios
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-stone-500">
            Últimos cambios aplicados a productos e ingredientes extra.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
          {historial.length} {historial.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Ítem</th>
              <th className="px-4 py-3 text-right">Precio anterior</th>
              <th className="px-4 py-3 text-right">Precio nuevo</th>
              <th className="px-4 py-3 text-right">Variación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-700">
            {historial.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-xs font-bold text-stone-400">
                    Todavía no hay cambios de precios registrados.
                  </p>
                </td>
              </tr>
            ) : (
              historial.map((registro) => {
                const diferencia = registro.precio_nuevo - registro.precio_anterior
                const subio = diferencia >= 0

                return (
                  <tr key={registro.id} className="transition hover:bg-stone-50/70">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-bold text-stone-500">
                      {formatearFecha(registro.fecha_cambio)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          registro.tipo === 'producto'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {registro.tipo === 'producto' ? 'Producto' : 'Ingrediente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-stone-900">{registro.nombre}</p>
                      <span className="font-mono text-[10px] font-bold text-stone-400">
                        #{registro.id_referencia}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-stone-500">
                      {formatoMoneda.format(registro.precio_anterior)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-stone-900">
                      {formatoMoneda.format(registro.precio_nuevo)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-[11px] font-extrabold ${
                        subio ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {subio ? '+' : '−'}
                      {formatoMoneda.format(Math.abs(diferencia))}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
