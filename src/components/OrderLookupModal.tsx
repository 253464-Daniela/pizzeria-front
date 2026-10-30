import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ApiError, getPedidoEstado, type EstadoPedido, type PedidoEstadoOut } from '../api'

interface OrderLookupModalProps {
  onClose: () => void
}

const ESTILO_ESTADO: Record<EstadoPedido, { etiqueta: string; clases: string }> = {
  pendiente: {
    etiqueta: 'En preparación',
    clases: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  listo: {
    etiqueta: 'Listo para entrega',
    clases: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  entregado: {
    etiqueta: 'Entregado',
    clases: 'bg-stone-900 text-white ring-stone-900',
  },
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

export function OrderLookupModal({ onClose }: OrderLookupModalProps) {
  const [numero, setNumero] = useState(() => localStorage.getItem('pedido_id') ?? '')
  const [pedido, setPedido] = useState<PedidoEstadoOut | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function manejarTecla(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', manejarTecla)

    return () => {
      window.removeEventListener('keydown', manejarTecla)
      document.body.style.overflow = overflowPrevio
    }
  }, [onClose])

  async function consultar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const id = Number(numero)
    if (!Number.isInteger(id) || id <= 0) {
      setError('Ingresa un número de pedido válido.')
      return
    }

    setCargando(true)
    setError(null)
    setPedido(null)

    try {
      const data = await getPedidoEstado(id)
      setPedido(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`No encontramos el pedido #${id}. Verifica el número e intenta de nuevo.`)
      } else {
        setError('No pudimos consultar el pedido. Revisa tu conexión e intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consulta-pedido-titulo"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl ring-1 ring-stone-200 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-5 sm:p-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">
              Seguimiento
            </span>
            <h2
              id="consulta-pedido-titulo"
              className="mt-1 text-xl font-black tracking-tight text-stone-900"
            >
              Consultar pedido
            </h2>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              Ingresa tu número de pedido para ver el detalle y su estado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <form onSubmit={consultar} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={numero}
                onChange={(event) => {
                  setNumero(event.target.value.replace(/\D/g, ''))
                  if (error) setError(null)
                }}
                placeholder="Ej. 8001"
                aria-label="Número de pedido"
                aria-invalid={Boolean(error)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm font-bold text-stone-900 shadow-sm transition placeholder:font-medium placeholder:text-stone-400 focus:border-brand-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-red/10"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red-dark px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-red-deep/20 transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              <SearchIcon />
              {cargando ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-brand-red-dark"
            >
              {error}
            </div>
          )}

          {pedido && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Pedido
                    </span>
                    <p className="text-2xl font-black tracking-tight text-stone-900">
                      #{pedido.id}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">
                      Cliente:{' '}
                      <span className="font-extrabold text-stone-800">{pedido.nombre_cliente}</span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold ring-1 ${ESTILO_ESTADO[pedido.estado].clases}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {ESTILO_ESTADO[pedido.estado].etiqueta}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-stone-200/70 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Total
                  </span>
                  <span className="text-xl font-black text-brand-red">
                    ${pedido.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-stone-400">
                  <BoxIcon />
                  Artículos ({pedido.items.length})
                </h3>

                {pedido.items.length === 0 ? (
                  <p className="mt-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-4 text-center text-xs font-semibold text-stone-400">
                    Este pedido todavía no tiene artículos registrados.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-stone-100">
                    {pedido.items.map((item, indice) => {
                      const lista = item.estado_cocina === 'lista'

                      return (
                        <li
                          key={`${item.nombre}-${indice}`}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-stone-900">
                              {item.nombre}
                            </p>
                            <p className="text-[11px] font-semibold text-stone-500">
                              Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${
                              lista
                                ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                                : 'bg-amber-100 text-amber-800 ring-amber-200'
                            }`}
                          >
                            {lista ? <CheckIcon /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                            {lista ? 'Lista' : 'Pendiente'}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <Link
                to={`/pedido/${pedido.id}`}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-extrabold text-stone-700 transition hover:border-brand-red/40 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Ver seguimiento completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
