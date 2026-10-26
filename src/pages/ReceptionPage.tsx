import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface ItemPedido {
  nombre: string
  cantidad: number
}

interface PedidoRecepcion {
  id: number
  nombre_cliente: string
  estado: 'listo' | 'entregado'
  total: number
  fecha_creacion: string
  fecha_listo: string
  fecha_entrega: string | null
  items: ItemPedido[]
}

type FiltroEstado = 'listo' | 'entregado' | 'listo,entregado'

type ResultadoPedidos =
  | { ok: true; pedidos: PedidoRecepcion[] }
  | { ok: false; mensaje: string | null }

const TABS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: 'listo', etiqueta: 'Listos' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'listo,entregado', etiqueta: 'Todos' },
]

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

function formatearHora(iso: string | null) {
  if (!iso) return '—'

  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
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

async function solicitarPedidos(
  token: string | null,
  fecha: string,
  estado: FiltroEstado,
  signal?: AbortSignal,
): Promise<ResultadoPedidos> {
  if (!fecha) {
    return { ok: false, mensaje: 'Selecciona una fecha para consultar los pedidos.' }
  }

  try {
    const parametros = new URLSearchParams({ fecha, estado })
    const respuesta = await fetch(`/api/pedidos?${parametros.toString()}`, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
      signal,
      cache: 'no-store',
    })

    if (respuesta.status === 401) {
      return { ok: false, mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
    }

    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)

    const data = (await respuesta.json()) as PedidoRecepcion[]
    return { ok: true, pedidos: data }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, mensaje: null }
    }

    return {
      ok: false,
      mensaje: 'No pudimos cargar los pedidos. Revisa tu conexión e intenta de nuevo.',
    }
  }
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

function IconoCheck({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="m4.5 12.5 5 5L20 6.5" />
    </svg>
  )
}

function IconoCheckCirculo({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  )
}

function IconoFuego({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M12 3c1.5 3-1.5 4.5-1.5 7A3.5 3.5 0 0 0 14 13.5c2-1 2.5-2.5 2.5-4C18.5 11 20 13.4 20 16a8 8 0 0 1-16 0c0-4.5 3.5-7.5 8-13Z" />
    </svg>
  )
}

function IconoActualizar({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M20 11a8 8 0 1 0-2.3 5.6" />
      <path d="M20 4v7h-7" />
    </svg>
  )
}

function IconoSalir({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4M6 12h11" />
    </svg>
  )
}

function IconoAlerta({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 16.5h.01" />
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

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function ReceptionPage() {
  const { token, usuario, logout } = useAuth()

  const [fecha, setFecha] = useState(fechaDeHoy)
  const [estado, setEstado] = useState<FiltroEstado>('listo')
  const [pedidos, setPedidos] = useState<PedidoRecepcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [procesandoId, setProcesandoId] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [recarga, setRecarga] = useState(0)
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const controller = new AbortController()

    async function cargarPedidos() {
      const resultado = await solicitarPedidos(token, fecha, estado, controller.signal)
      if (controller.signal.aborted) return

      if (resultado.ok) {
        setPedidos(resultado.pedidos)
        setError(null)
      } else if (resultado.mensaje) {
        setError(resultado.mensaje)
      }

      setCargando(false)
    }

    cargarPedidos()

    return () => controller.abort()
  }, [token, fecha, estado, recarga])

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(new Date()), 1000)
    return () => window.clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (!aviso) return

    const id = window.setTimeout(() => setAviso(null), 3500)
    return () => window.clearTimeout(id)
  }, [aviso])

  function actualizar() {
    setCargando(true)
    setError(null)
    setRecarga((valor) => valor + 1)
  }

  function cambiarFecha(valor: string) {
    setFecha(valor)
    setCargando(true)
    setError(null)
  }

  function cambiarEstado(valor: FiltroEstado) {
    if (valor === estado) return

    setEstado(valor)
    setCargando(true)
    setError(null)
  }

  async function recargarPedidos() {
    const resultado = await solicitarPedidos(token, fecha, estado)

    if (resultado.ok) {
      setPedidos(resultado.pedidos)
      setError(null)
    } else if (resultado.mensaje) {
      setError(resultado.mensaje)
    }
  }

  async function marcarEntregado(pedido: PedidoRecepcion) {
    if (procesandoId !== null) return

    setProcesandoId(pedido.id)
    setError(null)

    try {
      const respuesta = await fetch(`/api/pedidos/${pedido.id}/entregar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })

      if (respuesta.status === 409) {
        setError(
          'Este pedido todavía no está listo para entregarse. La cocina pudo haber revertido su estado: actualiza la lista e inténtalo de nuevo.',
        )
        return
      }

      if (respuesta.status === 404) {
        setError('El pedido ya no existe. Actualiza la lista para sincronizarte.')
        return
      }

      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)

      setAviso(`Pedido #${pedido.id} de ${pedido.nombre_cliente} entregado.`)
      await recargarPedidos()
    } catch {
      setError('No pudimos marcar el pedido como entregado. Intenta de nuevo.')
    } finally {
      setProcesandoId(null)
    }
  }

  const iniciales =
    usuario?.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') ?? 'R'

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F5F0] text-stone-900 selection:bg-brand-red selection:text-white">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-lg font-black text-white shadow-md shadow-brand-red/20">
              LRV
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-stone-900">
                  La Rodaja Voladora
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand-gold">
                  Recepción
                </span>
              </div>
              <span className="mt-0.5 block text-xs font-semibold text-stone-500">
                Caja · Terminal #02
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-[11px] font-bold text-stone-600">Sincronizado</span>
              <span className="text-stone-300" aria-hidden="true">
                |
              </span>
              <span className="font-mono text-xs font-extrabold text-stone-800">
                {ahora.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs font-black text-brand-gold">
                {iniciales}
              </div>
              <div className="hidden text-left sm:block">
                <span className="block text-xs font-extrabold leading-none text-stone-900">
                  {usuario?.nombre ?? 'Recepción'}
                </span>
                <span className="text-[11px] font-semibold text-stone-500">Recepcionista</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
              >
                <IconoSalir className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              Puesto de recepción
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900">
              Entrega de pedidos
            </h1>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              Confirma las entregas de lo que cocina ya marcó como listo.
            </p>
          </div>
          <button
            type="button"
            onClick={actualizar}
            disabled={cargando}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-stone-700 shadow-sm transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            <IconoActualizar className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="filtro-fecha"
                className="text-[11px] font-black uppercase tracking-wider text-stone-400"
              >
                Fecha de preparación
              </label>
              <div className="relative">
                <IconoCalendario className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gold" />
                <input
                  id="filtro-fecha"
                  type="date"
                  value={fecha}
                  onChange={(event) => cambiarFecha(event.target.value)}
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm font-bold text-stone-800 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red sm:w-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
                Estado del pedido
              </span>
              <div
                role="tablist"
                aria-label="Filtrar pedidos por estado"
                className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1"
              >
                {TABS.map((tab) => {
                  const activo = tab.valor === estado

                  return (
                    <button
                      key={tab.valor}
                      type="button"
                      role="tab"
                      aria-selected={activo}
                      onClick={() => cambiarEstado(tab.valor)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none ${
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
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            <div className="flex items-start gap-2">
              <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={actualizar}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-stone-900">
            Pedidos · {formatearFechaLarga(fecha)}
          </h2>
          {!cargando && !error && (
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
              {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          )}
        </div>

        {cargando ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((indice) => (
              <div
                key={indice}
                className="animate-pulse rounded-2xl border border-stone-200/80 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-stone-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 rounded bg-stone-200" />
                    <div className="h-4 w-32 rounded bg-stone-200" />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-stone-100" />
                  <div className="h-3 w-4/5 rounded bg-stone-100" />
                  <div className="h-10 w-full rounded-xl bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? null : pedidos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <IconoCaja className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-stone-900">
              No hay pedidos para este filtro
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs font-semibold text-stone-500">
              {estado === 'listo'
                ? 'Cuando cocina marque un pedido como listo aparecerá aquí.'
                : 'Prueba con otra fecha o cambia el estado seleccionado.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pedidos.map((pedido) => {
              const entregado = pedido.estado === 'entregado'
              const procesando = procesandoId === pedido.id

              return (
                <article
                  key={pedido.id}
                  className="flex flex-col rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:shadow-md motion-reduce:transition-none"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          entregado
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border-amber-200 bg-amber-50 text-brand-gold'
                        }`}
                      >
                        {entregado ? (
                          <IconoCheckCirculo className="h-5 w-5" />
                        ) : (
                          <IconoFuego className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-black text-stone-400">
                          #{pedido.id}
                        </span>
                        <h3 className="truncate text-sm font-extrabold text-stone-900">
                          {pedido.nombre_cliente}
                        </h3>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        entregado
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-brand-gold'
                      }`}
                    >
                      {entregado ? 'Entregado' : 'Listo'}
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

                    <div className="space-y-1.5 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-600">
                      <p className="flex items-center gap-1.5">
                        <IconoReloj className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                        <span>
                          Listo a las{' '}
                          <span className="font-mono font-bold text-stone-800">
                            {formatearHora(pedido.fecha_listo)}
                          </span>
                        </span>
                      </p>
                      {entregado && pedido.fecha_entrega && (
                        <p className="flex items-center gap-1.5 text-emerald-700">
                          <IconoCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Entregado a las{' '}
                            <span className="font-mono font-bold">
                              {formatearHora(pedido.fecha_entrega)}
                            </span>
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 p-4">
                    {entregado ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-emerald-700">
                        <IconoCheckCirculo className="h-4 w-4" />
                        Pedido entregado
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => marcarEntregado(pedido)}
                        disabled={procesando}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none motion-reduce:transition-none"
                      >
                        {procesando ? (
                          <>
                            <Spinner className="h-4 w-4" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <IconoCheck className="h-4 w-4" />
                            Marcar como Entregado
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {!cargando && !error && pedidos.length > 0 && (
          <p className="text-center text-[11px] font-semibold text-stone-400">
            Los pedidos entregados quedan bloqueados y no se pueden modificar.
          </p>
        )}
      </main>

      {aviso && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <IconoCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-stone-900">Entrega registrada</p>
              <p className="text-[11px] font-semibold text-stone-500">{aviso}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
