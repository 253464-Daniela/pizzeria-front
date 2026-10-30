import { useMemo } from 'react'
import type { PedidoListado } from '../../api'
import { IconoProducto, IconoVentas } from './icons'

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

interface Props {
  pedidos: PedidoListado[]
}

interface VentaHora {
  hora: number
  total: number
  pedidos: number
}

interface ProductoVendido {
  nombre: string
  unidades: number
}

function agruparPorHora(pedidos: PedidoListado[]): VentaHora[] {
  const mapa = new Map<number, VentaHora>()

  for (const pedido of pedidos) {
    const referencia = pedido.fecha_entrega ?? pedido.fecha_listo ?? pedido.fecha_creacion
    const fecha = new Date(referencia)
    if (Number.isNaN(fecha.getTime())) continue

    const hora = fecha.getHours()
    const acumulado = mapa.get(hora) ?? { hora, total: 0, pedidos: 0 }
    acumulado.total += pedido.total
    acumulado.pedidos += 1
    mapa.set(hora, acumulado)
  }

  if (mapa.size === 0) return []

  const horas = [...mapa.keys()]
  const desde = Math.min(...horas)
  const hasta = Math.max(...horas)
  const serie: VentaHora[] = []

  for (let hora = desde; hora <= hasta; hora++) {
    serie.push(mapa.get(hora) ?? { hora, total: 0, pedidos: 0 })
  }

  return serie
}

function agruparProductos(pedidos: PedidoListado[]): ProductoVendido[] {
  const mapa = new Map<string, number>()

  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      mapa.set(item.nombre, (mapa.get(item.nombre) ?? 0) + item.cantidad)
    }
  }

  return [...mapa.entries()]
    .map(([nombre, unidades]) => ({ nombre, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5)
}

export default function SalesCharts({ pedidos }: Props) {
  const porHora = useMemo(() => agruparPorHora(pedidos), [pedidos])
  const topProductos = useMemo(() => agruparProductos(pedidos), [pedidos])

  const maxVentaHora = Math.max(1, ...porHora.map((fila) => fila.total))
  const maxUnidades = Math.max(1, ...topProductos.map((producto) => producto.unidades))
  const totalPedidos = porHora.reduce((suma, fila) => suma + fila.pedidos, 0)

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-brand-red">
                <IconoVentas className="h-4 w-4" />
              </span>
              Ventas por hora
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-stone-500">
              Monto cobrado según la hora de entrega.
            </p>
          </div>
          {porHora.length > 0 && (
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
              {totalPedidos} {totalPedidos === 1 ? 'pedido' : 'pedidos'}
            </span>
          )}
        </div>

        {porHora.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-10 text-center text-xs font-bold text-stone-400">
            Sin ventas registradas para esta fecha.
          </p>
        ) : (
          <div
            role="img"
            aria-label="Gráfica de ventas por hora del día"
            className="mt-5 flex h-40 items-end gap-1.5 sm:gap-2"
          >
            {porHora.map((fila) => {
              const altura = fila.total > 0 ? Math.max(6, (fila.total / maxVentaHora) * 100) : 2

              return (
                <div
                  key={fila.hora}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-lg border border-stone-200 bg-white px-2 py-1 text-[10px] font-extrabold text-stone-700 shadow-md group-hover:block">
                    {formatoMoneda.format(fila.total)} · {fila.pedidos}{' '}
                    {fila.pedidos === 1 ? 'pedido' : 'pedidos'}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-colors ${
                      fila.total > 0
                        ? 'bg-gradient-to-t from-brand-red to-amber-400 group-hover:from-brand-red-dark'
                        : 'bg-stone-200'
                    }`}
                    style={{ height: `${altura}%` }}
                    title={`${String(fila.hora).padStart(2, '0')}:00 · ${formatoMoneda.format(fila.total)}`}
                  />
                </div>
              )
            })}
          </div>
        )}

        {porHora.length > 0 && (
          <div className="mt-2 flex gap-1.5 sm:gap-2" aria-hidden="true">
            {porHora.map((fila) => (
              <span
                key={fila.hora}
                className="flex-1 text-center font-mono text-[10px] font-bold text-stone-400"
              >
                {String(fila.hora).padStart(2, '0')}:00
              </span>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-brand-gold">
                <IconoProducto className="h-4 w-4" />
              </span>
              Top productos
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-stone-500">
              Productos más vendidos del día por unidades.
            </p>
          </div>
          {topProductos.length > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-800">
              Top 5
            </span>
          )}
        </div>

        {topProductos.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-10 text-center text-xs font-bold text-stone-400">
            Aún no hay productos vendidos para esta fecha.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {topProductos.map((producto, indice) => (
              <li key={producto.nombre}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="font-mono text-[11px] font-black text-stone-400">
                      {indice + 1}
                    </span>
                    <span className="truncate text-xs font-bold text-stone-800">
                      {producto.nombre}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-extrabold text-stone-500">
                    {producto.unidades} u
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-gold to-amber-300"
                    style={{ width: `${(producto.unidades / maxUnidades) * 100}%` }}
                    role="img"
                    aria-label={`${producto.nombre}: ${producto.unidades} unidades`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  )
}
