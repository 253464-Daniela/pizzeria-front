import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, getPedidos, type EstadoPedido, type PedidoListado } from '../../api'
import { IconoActualizar, IconoAlerta, IconoPedidos } from './icons'
import SalesCharts from './SalesCharts'

interface Props {
  token: string | null
}

type Filtro = 'todos' | EstadoPedido

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'listo', etiqueta: 'Listos' },
  { valor: 'entregado', etiqueta: 'Entregados' },
]

const ESTILO_ESTADO: Record<EstadoPedido, { etiqueta: string; clases: string }> = {
  pendiente: {
    etiqueta: 'En preparación',
    clases: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  listo: {
    etiqueta: 'Listo',
    clases: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  entregado: {
    etiqueta: 'Entregado',
    clases: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
}

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function fechaDeHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

function formatearFechaLarga(valor: string) {
  if (!valor) return 'sin fecha'

  const fecha = new Date(`${valor}T12:00:00`)
  if (Number.isNaN(fecha.getTime())) return valor

  const texto = fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatearHora(iso: string | null) {
  if (!iso) return '—'

  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function IconoCalendario({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function IconoReloj({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function IconoCaja({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
      <path d="M2 8l3-5h14l3 5M2 8h20M9 12h6" />
    </svg>
  )
}

function IconoFlecha({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function OrdersSection({ token }: Props) {
  const [fecha, setFecha] = useState(fechaDeHoy)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [pedidos, setPedidos] = useState<PedidoListado[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarPedidos() {
      try {
        const datos = await getPedidos({ fecha, estado: 'listo,entregado' }, token, controller.signal)
        if (controller.signal.aborted) return

        setPedidos(datos)
        setError(null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return

        if (err instanceof ApiError && err.status === 401) {
          setError('Tu sesión expiró. Vuelve a iniciar sesión.')
        } else {
          setError(
            'No pudimos cargar los pedidos del día. Revisa tu conexión e intenta de nuevo.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarPedidos()

    return () => controller.abort()
  }, [token, fecha, recarga])

  const visibles = useMemo(
    () => (filtro === 'todos' ? pedidos : pedidos.filter((pedido) => pedido.estado === filtro)),
    [pedidos, filtro],
  )

  const resumen = useMemo(
    () => ({
      total: pedidos.length,
      listos: pedidos.filter((pedido) => pedido.estado === 'listo').length,
      entregados: pedidos.filter((pedido) => pedido.estado === 'entregado').length,
    }),
    [pedidos],
  )

  function cambiarFecha(valor: string) {
    setFecha(valor)
    setCargando(true)
    setError(null)
  }

  function refrescar() {
    setCargando(true)
    setError(null)
    setRecarga((valor) => valor + 1)
  }

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
            Historial operativo
          </p>
          <h2 className="mt-1 text-lg font-black tracking-tight text-stone-900">
            Pedidos por día
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-stone-500">
            Consulta los pedidos listos y entregados en la jornada.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-filtro-fecha"
              className="text-[10px] font-black uppercase tracking-wider text-stone-400"
            >
              Fecha de preparación
            </label>
            <div className="relative">
              <IconoCalendario className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold" />
              <input
                id="admin-filtro-fecha"
                type="date"
                value={fecha}
                onChange={(event) => cambiarFecha(event.target.value)}
                className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm font-bold text-stone-800 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red sm:w-auto"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={refrescar}
            disabled={cargando}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-3.5 text-xs font-extrabold text-stone-700 transition hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            <IconoActualizar className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-600">
            <IconoPedidos className="h-3.5 w-3.5 text-stone-400" />
            {resumen.total} {resumen.total === 1 ? 'pedido' : 'pedidos'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
            {resumen.listos} listos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {resumen.entregados} entregados
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Filtrar pedidos por estado"
          className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1"
        >
          {FILTROS.map((tab) => {
            const activo = tab.valor === filtro

            return (
              <button
                key={tab.valor}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setFiltro(tab.valor)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none ${
                  activo
                    ? 'bg-white font-extrabold text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.etiqueta}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
        >
          <div className="flex items-start gap-2">
            <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={refrescar}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && <SalesCharts pedidos={pedidos} />}

      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold text-stone-900">
          {formatearFechaLarga(fecha)}
        </h3>
        {!cargando && !error && visibles.length > 0 && (
          <span className="text-[11px] font-semibold text-stone-400">
            Mostrando {visibles.length} de {pedidos.length}
          </span>
        )}
      </div>

      {cargando ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((indice) => (
            <div
              key={indice}
              className="animate-pulse rounded-2xl border border-stone-200/80 bg-white p-4 motion-reduce:animate-none"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-stone-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-14 rounded bg-stone-200" />
                  <div className="h-4 w-28 rounded bg-stone-200" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-stone-100" />
                <div className="h-3 w-4/5 rounded bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? null : visibles.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-6 py-10 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <IconoCaja className="h-5 w-5" />
          </span>
          <h3 className="mt-2 text-sm font-extrabold text-stone-900">
            {pedidos.length === 0 ? 'Sin pedidos para esta fecha' : 'Sin pedidos con este estado'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs font-semibold text-stone-500">
            {pedidos.length === 0
              ? 'Prueba con otra fecha para consultar el historial.'
              : 'Cambia el filtro para ver los pedidos de la jornada.'}
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((pedido) => {
            const estado = ESTILO_ESTADO[pedido.estado]

            return (
              <article
                key={pedido.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 p-4">
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] font-black text-stone-400">
                      #{pedido.id}
                    </span>
                    <h4 className="truncate text-sm font-extrabold text-stone-900">
                      {pedido.nombre_cliente}
                    </h4>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${estado.clases}`}
                  >
                    {estado.etiqueta}
                  </span>
                </div>

                <div className="flex-1 space-y-3 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Total
                    </span>
                    <span className="font-mono text-lg font-black text-stone-900">
                      {formatoMoneda.format(pedido.total)}
                    </span>
                  </div>

                  {pedido.items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {pedido.items.map((item, indice) => (
                        <li
                          key={`${pedido.id}-${item.nombre}-${indice}`}
                          className="flex items-center gap-2 text-xs font-semibold text-stone-700"
                        >
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-stone-100 px-1 font-mono text-[10px] font-black text-stone-600">
                            {item.cantidad}x
                          </span>
                          <span className="truncate">{item.nombre}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs font-semibold text-stone-400">Sin artículos registrados.</p>
                  )}

                  <div className="space-y-1 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-600">
                    <p className="flex items-center gap-1.5">
                      <IconoReloj className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      Creado a las{' '}
                      <span className="font-mono font-bold text-stone-800">
                        {formatearHora(pedido.fecha_creacion)}
                      </span>
                    </p>
                    {pedido.fecha_listo && (
                      <p className="flex items-center gap-1.5 text-sky-700">
                        <IconoReloj className="h-3.5 w-3.5 shrink-0" />
                        Listo a las{' '}
                        <span className="font-mono font-bold">
                          {formatearHora(pedido.fecha_listo)}
                        </span>
                      </p>
                    )}
                    {pedido.fecha_entrega && (
                      <p className="flex items-center gap-1.5 text-emerald-700">
                        <IconoReloj className="h-3.5 w-3.5 shrink-0" />
                        Entregado a las{' '}
                        <span className="font-mono font-bold">
                          {formatearHora(pedido.fecha_entrega)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 p-3">
                  <Link
                    to={`/pedido/${pedido.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] font-extrabold text-stone-600 transition hover:border-brand-red/40 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                  >
                    Ver seguimiento
                    <IconoFlecha className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
