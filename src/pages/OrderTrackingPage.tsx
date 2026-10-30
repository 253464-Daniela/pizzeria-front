import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getPedidoEstado } from '../api'
import { Header } from '../components/Header'

export interface ItemEstado {
  nombre: string
  cantidad: number
  estado_cocina: 'pendiente' | 'lista'
}

export interface PedidoEstado {
  id: number
  nombre_cliente: string
  estado: 'pendiente' | 'listo' | 'entregado'
  total: number
  items: ItemEstado[]
}

type CodigoError = 'PEDIDO_NO_ENCONTRADO' | 'CONEXION'
type Indicador = 'skeleton' | 'boton' | 'ninguno'

const INTERVALO_MS = 15_000

const ESTADOS = ['pendiente', 'listo', 'entregado'] as const
const ANCHO_PROGRESO = ['w-0', 'w-1/2', 'w-full'] as const

const PASOS = [
  { estado: 'pendiente', titulo: 'Pendiente', detalle: 'En el horno', Icono: ClockIcon },
  { estado: 'listo', titulo: 'Listo', detalle: 'Empacado', Icono: BoxIcon },
  { estado: 'entregado', titulo: 'Entregado', detalle: 'Entregado', Icono: HomeIcon },
] as const

const ESTILO_ESTADO: Record<PedidoEstado['estado'], string> = {
  pendiente: 'bg-amber-100 text-amber-800 ring-amber-200',
  listo: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  entregado: 'bg-stone-900 text-white ring-stone-900',
}

const ETIQUETA_ESTADO: Record<PedidoEstado['estado'], string> = {
  pendiente: 'En preparación',
  listo: 'Listo para entrega',
  entregado: 'Entregado',
}

function formatearHora(fecha: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(fecha)
}

function Icono({
  className = 'h-4 w-4',
  children,
}: {
  className?: string
  children: ReactNode
}) {
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
      {children}
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icono>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="m5 12 5 5L20 7" />
    </Icono>
  )
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </Icono>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </Icono>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Icono>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icono>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icono>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icono>
  )
}

function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 selection:bg-brand-red selection:text-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <ArrowLeftIcon />
          Volver al menú
        </Link>

        {children}
      </main>
    </div>
  )
}

function Esqueleto() {
  return (
    <div className="mt-4 space-y-5" aria-hidden="true">
      <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200/70 motion-reduce:animate-none">
        <div className="h-3 w-20 rounded-full bg-stone-200" />
        <div className="mt-3 h-7 w-32 rounded-full bg-stone-200" />
        <div className="mt-2 h-3 w-48 rounded-full bg-stone-100" />
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200/70 motion-reduce:animate-none">
        <div className="h-3 w-32 rounded-full bg-stone-200" />
        <div className="mt-6 flex items-center justify-between">
          <div className="h-10 w-10 rounded-full bg-stone-200" />
          <div className="h-10 w-10 rounded-full bg-stone-200" />
          <div className="h-10 w-10 rounded-full bg-stone-200" />
        </div>
      </div>
      <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200/70 motion-reduce:animate-none">
        <div className="h-3 w-36 rounded-full bg-stone-200" />
        <div className="mt-5 h-11 w-full rounded-2xl bg-stone-100" />
        <div className="mt-3 h-11 w-full rounded-2xl bg-stone-100" />
      </div>
    </div>
  )
}

function EstadoNoEncontrado({ id, onReintentar }: { id?: string; onReintentar: () => void }) {
  return (
    <section className="mt-6 rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-xl shadow-brand-red-deep/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-brand-red-dark">
        <SearchIcon className="h-6 w-6" />
      </div>

      <span className="mt-4 inline-block rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-red-dark ring-1 ring-rose-200">
        PEDIDO_NO_ENCONTRADO
      </span>

      <h1 className="mt-3 text-xl font-black tracking-tight text-stone-900 sm:text-2xl">
        No encontramos el pedido #{id ?? '—'}
      </h1>
      <p className="mx-auto mt-1 max-w-sm text-sm font-semibold text-stone-500">
        Verifica el número del pedido o vuelve al menú para crear uno nuevo.
      </p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onReintentar}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red-dark px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
        >
          <RefreshIcon className="h-4 w-4" />
          Reintentar
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-extrabold text-stone-700 transition hover:border-brand-red/40 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Ir al menú
        </Link>
      </div>
    </section>
  )
}

function EstadoConexion({
  onReintentar,
  actualizando,
}: {
  onReintentar: () => void
  actualizando: boolean
}) {
  return (
    <section className="mt-6 rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-xl shadow-brand-red-deep/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <AlertIcon className="h-6 w-6" />
      </div>

      <h1 className="mt-4 text-xl font-black tracking-tight text-stone-900 sm:text-2xl">
        No pudimos cargar tu pedido
      </h1>
      <p className="mx-auto mt-1 max-w-sm text-sm font-semibold text-stone-500">
        Revisa tu conexión e inténtalo de nuevo. El estado del pedido sigue seguro en nuestra
        cocina.
      </p>

      <button
        type="button"
        onClick={onReintentar}
        disabled={actualizando}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red-dark px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      >
        <RefreshIcon className={`h-4 w-4 ${actualizando ? 'animate-spin' : ''}`} />
        {actualizando ? 'Reintentando...' : 'Reintentar'}
      </button>
    </section>
  )
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>()

  const [pedido, setPedido] = useState<PedidoEstado | null>(null)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState<CodigoError | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
  const [refresco, setRefresco] = useState(0)

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()
    const pedidoId = Number(id)

    async function consultar(indicador: Indicador) {
      if (indicador === 'skeleton') setCargando(true)
      if (indicador === 'boton') setActualizando(true)

      try {
        if (!Number.isInteger(pedidoId)) throw new ApiError(404, 'not-found')

        const data = await getPedidoEstado(pedidoId, controller.signal)
        if (controller.signal.aborted) return

        setPedido(data)
        setError(null)
        setUltimaActualizacion(new Date())
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof ApiError && err.status === 404) {
          setPedido(null)
          setError('PEDIDO_NO_ENCONTRADO')
          return
        }
        setError((actual) => (actual === 'PEDIDO_NO_ENCONTRADO' ? actual : 'CONEXION'))
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false)
          setActualizando(false)
        }
      }
    }

    consultar(refresco > 0 ? 'boton' : 'skeleton')

    const intervalo = window.setInterval(() => consultar('ninguno'), INTERVALO_MS)

    return () => {
      controller.abort()
      window.clearInterval(intervalo)
    }
  }, [id, refresco])

  const reintentar = () => setRefresco((valor) => valor + 1)

  if (!id || (error === 'PEDIDO_NO_ENCONTRADO' && !pedido)) {
    return (
      <Pagina>
        <EstadoNoEncontrado id={id} onReintentar={reintentar} />
      </Pagina>
    )
  }

  if (error === 'CONEXION' && !pedido) {
    return (
      <Pagina>
        <EstadoConexion onReintentar={reintentar} actualizando={actualizando} />
      </Pagina>
    )
  }

  if (cargando || !pedido) {
    return (
      <Pagina>
        <Esqueleto />
      </Pagina>
    )
  }

  const indiceActual = ESTADOS.indexOf(pedido.estado)
  const anchoProgreso = ANCHO_PROGRESO[indiceActual] ?? 'w-0'

  return (
    <Pagina>
      <div className="mt-4 space-y-5">
        {error === 'CONEXION' && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800"
          >
            <AlertIcon className="h-4 w-4 flex-shrink-0" />
            No pudimos actualizar el estado. Mostrando la última información disponible.
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xl shadow-brand-red-deep/5 sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -right-10 h-36 w-36 rounded-full bg-amber-50 opacity-70"
          />

          <div className="relative z-10 flex flex-col gap-4 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Pedido
                </span>
                <span
                  aria-live="polite"
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${ESTILO_ESTADO[pedido.estado]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {ETIQUETA_ESTADO[pedido.estado]}
                </span>
              </div>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
                #{pedido.id}
              </h1>
              <p className="mt-1 text-xs font-semibold text-stone-500">
                Cliente: <span className="font-extrabold text-stone-800">{pedido.nombre_cliente}</span>
              </p>
            </div>

            <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
              <div className="sm:text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Total
                </span>
                <span className="text-2xl font-black tracking-tight text-brand-red sm:text-3xl">
                  ${pedido.total.toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={reintentar}
                  disabled={actualizando}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px] font-extrabold text-stone-700 transition hover:border-brand-red/40 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                >
                  <RefreshIcon className={`h-3.5 w-3.5 ${actualizando ? 'animate-spin' : ''}`} />
                  {actualizando ? 'Actualizando...' : 'Actualizar'}
                </button>
                <span className="mt-1 block text-[10px] font-medium text-stone-400">
                  {ultimaActualizacion
                    ? `Actualizado a las ${formatearHora(ultimaActualizacion)}`
                    : 'Sin actualizar'}
                </span>
              </div>
            </div>
          </div>

          <p className="relative z-10 mt-4 flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />
            Actualización automática cada 15 segundos
          </p>
        </section>

        <section
          aria-labelledby="progreso-titulo"
          className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xl shadow-brand-red-deep/5 sm:p-6"
        >
          <h2
            id="progreso-titulo"
            className="text-xs font-extrabold uppercase tracking-wider text-stone-400"
          >
            Progreso del pedido
          </h2>

          <ol className="relative mt-6 grid grid-cols-3" aria-label="Estados del pedido">
            <div
              aria-hidden="true"
              className="absolute left-[16.6667%] right-[16.6667%] top-5 h-1 -translate-y-1/2 rounded-full bg-stone-200"
            >
              <div
                className={`h-full rounded-full bg-brand-red transition-all duration-500 motion-reduce:transition-none ${anchoProgreso}`}
              />
            </div>

            {PASOS.map((paso, indice) => {
              const completado = indice < indiceActual
              const activo = indice === indiceActual
              const { Icono: IconoPaso } = paso

              return (
                <li
                  key={paso.estado}
                  aria-current={activo ? 'step' : undefined}
                  className="relative z-10 flex flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition motion-reduce:transition-none ${
                      completado
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : activo
                          ? 'border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30'
                          : 'border-stone-200 bg-white text-stone-400'
                    }`}
                  >
                    {activo && (
                      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-red/30 motion-reduce:animate-none" />
                    )}
                    {completado ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <IconoPaso className="h-4 w-4" />
                    )}
                  </span>

                  <span
                    className={`text-[11px] font-extrabold sm:text-xs ${
                      completado || activo ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {paso.titulo}
                  </span>
                  <span className="hidden text-[10px] font-medium text-stone-400 sm:block">
                    {paso.detalle}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>

        <section
          aria-labelledby="items-titulo"
          className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xl shadow-brand-red-deep/5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <h2
              id="items-titulo"
              className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-stone-400"
            >
              <BoxIcon className="h-3.5 w-3.5 text-brand-red" />
              Artículos del pedido ({pedido.items.length})
            </h2>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-[10px] font-bold text-stone-500">
              Total ${pedido.total.toFixed(2)}
            </span>
          </div>

          {pedido.items.length === 0 ? (
            <p className="py-6 text-center text-xs font-semibold text-stone-400">
              Este pedido todavía no tiene artículos registrados.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-stone-100">
              {pedido.items.map((item, indice) => {
                const lista = item.estado_cocina === 'lista'

                return (
                  <li
                    key={`${item.nombre}-${indice}`}
                    className="flex items-center justify-between gap-3 py-3.5 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-100 text-brand-red-dark">
                        <BoxIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-stone-900">
                          {item.nombre}
                        </p>
                        <p className="text-[11px] font-semibold text-stone-500">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black ring-1 ${
                        lista
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                          : 'bg-amber-100 text-amber-800 ring-amber-200'
                      }`}
                    >
                      {lista ? (
                        <CheckIcon className="h-3 w-3" />
                      ) : (
                        <ClockIcon className="h-3 w-3" />
                      )}
                      {lista ? 'Lista' : 'Pendiente'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </Pagina>
  )
}
