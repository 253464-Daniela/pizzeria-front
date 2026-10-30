import { useEffect, useState, type ReactNode } from 'react'
import { ApiError, getColaCocina, marcarItemListo, type ItemCola } from '../api'
import { useAuth } from '../context/AuthContext'

export interface IngredienteCocina {
  id: number
  nombre: string
  accion?: 'quitado' | 'agregado'
}

export interface ItemCocina {
  item_id: number
  pedido_id: number
  nombre_cliente: string
  pizza: string
  fecha_creacion: string
  ingredientes: IngredienteCocina[]
}

interface EstiloUrgencia {
  tiempo: string
  borde: string
  etiqueta: string
}

const URGENCIA = {
  normal: {
    tiempo: 'border-emerald-800 bg-emerald-950/80 text-emerald-400',
    borde: 'border-stone-800',
    etiqueta: 'A tiempo',
  },
  advertencia: {
    tiempo: 'border-amber-700 bg-amber-950/90 font-bold text-amber-300',
    borde: 'border-amber-600/60',
    etiqueta: 'Atención',
  },
  urgente: {
    tiempo: 'border-red-700 bg-red-950 font-black text-red-300',
    borde: 'border-red-600/80',
    etiqueta: 'Urgente',
  },
} satisfies Record<string, EstiloUrgencia>

function Icono({ className = 'h-4 w-4', children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3.5 2-4.5.3 1 .8 1.6 1.5 2C12.5 7 12 5 12 3Z" />
      <path d="M12 17v4" />
    </Icono>
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icono>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M5 12h14" />
    </Icono>
  )
}

function DotIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
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

function LogoutIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
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

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <Icono className={className}>
      <path d="M6 14a4 4 0 0 1-1-7.9 4 4 0 0 1 7-3.1 4 4 0 0 1 7 3.1A4 4 0 0 1 18 14" />
      <path d="M6 14v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6" />
      <path d="M9 18h6" />
    </Icono>
  )
}

function formatearHora(fecha: string) {
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return '--:--'
  return valor.toLocaleTimeString()
}

function minutosTranscurridos(fecha: string, ahora: Date) {
  const valor = new Date(fecha).getTime()
  if (Number.isNaN(valor)) return 0
  return Math.max(0, Math.floor((ahora.getTime() - valor) / 60_000))
}

function estiloUrgencia(minutos: number): EstiloUrgencia {
  if (minutos >= 15) return URGENCIA.urgente
  if (minutos >= 10) return URGENCIA.advertencia
  return URGENCIA.normal
}

type ResultadoCola = { ok: true; cola: ItemCocina[] } | { ok: false; mensaje: string | null }

function mapearItem(item: ItemCola): ItemCocina {
  const idsAgregados = new Set(item.agregados.map((ingrediente) => ingrediente.id))

  return {
    item_id: item.item_id,
    pedido_id: item.pedido_id,
    nombre_cliente: item.nombre_cliente,
    pizza: item.pizza,
    fecha_creacion: item.fecha_creacion,
    ingredientes: [
      ...item.ingredientes.filter((ingrediente) => !idsAgregados.has(ingrediente.id)),
      ...item.quitados.map((ingrediente) => ({ ...ingrediente, accion: 'quitado' as const })),
      ...item.agregados.map((ingrediente) => ({ ...ingrediente, accion: 'agregado' as const })),
    ],
  }
}

async function solicitarCola(token: string | null, signal?: AbortSignal): Promise<ResultadoCola> {
  try {
    const cola = await getColaCocina(token, signal)
    return { ok: true, cola: cola.map(mapearItem) }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, mensaje: null }
    }

    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
    }

    return {
      ok: false,
      mensaje: 'No pudimos cargar la cola de cocina. Revisa tu conexión e intenta de nuevo.',
    }
  }
}

function TarjetaEsqueleto() {
  return (
    <div className="animate-pulse rounded-3xl border border-stone-800 bg-[#161822] motion-reduce:animate-none">
      <div className="h-20 rounded-t-3xl border-b border-stone-800 bg-[#1E222F]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 rounded-full bg-stone-800" />
        <div className="h-3 w-1/2 rounded-full bg-stone-800/70" />
        <div className="h-3 w-3/4 rounded-full bg-stone-800/70" />
      </div>
      <div className="border-t border-stone-800 bg-[#12141C] p-3">
        <div className="h-12 rounded-2xl bg-stone-800/80" />
      </div>
    </div>
  )
}

export default function KitchenPage() {
  const { token, usuario, logout } = useAuth()

  const [cola, setCola] = useState<ItemCocina[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [procesando, setProcesando] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    const controller = new AbortController()

    async function cargarInicial() {
      const resultado = await solicitarCola(token, controller.signal)
      if (controller.signal.aborted) return

      if (resultado.ok) {
        setCola(resultado.cola)
        setError(null)
      } else if (resultado.mensaje) {
        setError(resultado.mensaje)
      }

      setCargando(false)
    }

    cargarInicial()

    return () => controller.abort()
  }, [token])

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(new Date()), 1000)
    return () => window.clearInterval(intervalo)
  }, [])

  useEffect(() => {
    if (!aviso) return

    const id = window.setTimeout(() => setAviso(null), 3200)
    return () => window.clearTimeout(id)
  }, [aviso])

  async function refrescar() {
    setRefrescando(true)
    setError(null)

    const resultado = await solicitarCola(token)
    if (resultado.ok) {
      setCola(resultado.cola)
      setError(null)
    } else if (resultado.mensaje) {
      setError(resultado.mensaje)
    }

    setRefrescando(false)
  }

  async function marcarLista(item: ItemCocina) {
    if (procesando !== null) return

    setProcesando(item.item_id)
    setError(null)

    try {
      await marcarItemListo(item.item_id, token)

      setAviso(`Pedido #${item.pedido_id} · ${item.pizza} marcada como lista.`)

      const resultado = await solicitarCola(token)
      if (resultado.ok) {
        setCola(resultado.cola)
      } else if (resultado.mensaje) {
        setError(resultado.mensaje)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Tu sesión expiró. Vuelve a iniciar sesión.')
      } else {
        setError('No pudimos marcar la pizza como lista. Intenta de nuevo.')
      }
    } finally {
      setProcesando(null)
    }
  }

  const hayError = Boolean(error)

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0C10] text-stone-100 selection:bg-brand-red selection:text-white">
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-[#12141C]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red to-amber-600 text-white shadow-lg shadow-brand-red/30">
              <FlameIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white lg:text-lg">
                  La Rodaja Voladora
                </h1>
                <span className="rounded-md border border-red-800/60 bg-red-950/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">
                  KDS · Cocina
                </span>
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-stone-400">
                <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500 motion-reduce:animate-none" />
                <span className="truncate">{usuario?.nombre ?? 'Cocinero'}</span>
                <span className="font-mono text-emerald-400">{ahora.toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-stone-800 bg-[#1A1D26] px-3 py-1.5 sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                En cola
              </span>
              <span className="font-mono text-lg font-black leading-none text-amber-400">
                {cola.length}
              </span>
            </div>

            <button
              type="button"
              onClick={refrescar}
              disabled={refrescando}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-bold text-stone-300 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              <RefreshIcon className={`h-4 w-4 ${refrescando ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-bold text-stone-300 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
            >
              <LogoutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Cola de cocina
            </h2>
            <p className="mt-1 text-xs font-semibold text-stone-400">
              Los tickets más antiguos aparecen primero. Marca cada pizza al salir del horno.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> A tiempo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> 10+ min
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" /> 15+ min
            </span>
          </div>
        </div>

        {hayError && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-red-800/70 bg-red-950/60 px-4 py-3 text-xs font-bold text-red-200"
          >
            <span className="flex items-start gap-2">
              <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              {error}
            </span>
            <button
              type="button"
              onClick={refrescar}
              className="flex-shrink-0 rounded-lg border border-red-700 px-2.5 py-1 text-[11px] font-extrabold text-red-100 transition hover:bg-red-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando && cola.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, indice) => (
              <TarjetaEsqueleto key={indice} />
            ))}
          </div>
        ) : cola.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-800 bg-[#13151D] px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckIcon className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-stone-200">
              {hayError ? 'Cola no disponible' : '¡Todo al día!'}
            </h3>
            <p className="mt-1 max-w-sm text-xs font-semibold text-stone-500">
              {hayError
                ? 'No pudimos obtener los tickets pendientes. Usa "Reintentar" para volver a consultar.'
                : 'No hay pizzas pendientes en este momento. Los nuevos pedidos aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cola.map((item) => {
              const minutos = minutosTranscurridos(item.fecha_creacion, ahora)
              const urgencia = estiloUrgencia(minutos)
              const enProceso = procesando === item.item_id
              const ocupado = procesando !== null

              return (
                <article
                  key={item.item_id}
                  className={`flex flex-col overflow-hidden rounded-3xl border bg-[#161822] shadow-xl shadow-black/40 transition-colors motion-reduce:transition-none ${urgencia.borde}`}
                >
                  <header className="border-b border-stone-800 bg-[#1E222F] px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-lg font-black tracking-wide text-white">
                            #{item.pedido_id}
                          </span>
                          {minutos >= 15 && (
                            <span className="animate-pulse rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white motion-reduce:animate-none">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs font-extrabold text-stone-300">
                          {item.nombre_cliente}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-xs ${urgencia.tiempo}`}
                        >
                          <ClockIcon className="h-3 w-3" />
                          {minutos} min
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {formatearHora(item.fecha_creacion)}
                        </span>
                      </div>
                    </div>
                  </header>

                  <div className="flex-1 space-y-4 p-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                        Pizza
                      </span>
                      <h3 className="mt-0.5 text-base font-extrabold leading-snug text-white">
                        {item.pizza}
                      </h3>
                      <span className="mt-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-stone-600">
                        Ticket #{item.item_id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                        Ingredientes
                      </span>

                      {item.ingredientes.length === 0 ? (
                        <p className="mt-1 text-xs font-semibold text-stone-500">
                          Sin modificaciones registradas.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {item.ingredientes.map((ingrediente) => {
                            const quitado = ingrediente.accion === 'quitado'
                            const agregado = ingrediente.accion === 'agregado'

                            return (
                              <li
                                key={`${item.item_id}-${ingrediente.id}-${ingrediente.accion ?? 'normal'}`}
                                className={`flex items-start gap-1.5 text-sm ${
                                  quitado
                                    ? 'text-red-400 line-through'
                                    : agregado
                                      ? 'font-bold text-emerald-400'
                                      : 'font-medium text-stone-300'
                                }`}
                              >
                                <span className="mt-0.5 flex-shrink-0">
                                  {quitado ? (
                                    <MinusIcon className="h-3.5 w-3.5" />
                                  ) : agregado ? (
                                    <PlusIcon className="h-3.5 w-3.5" />
                                  ) : (
                                    <DotIcon className="h-3.5 w-3.5 text-stone-600" />
                                  )}
                                </span>
                                <span>{ingrediente.nombre}</span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  <footer className="border-t border-stone-800 bg-[#12141C] p-3">
                    <button
                      type="button"
                      onClick={() => marcarLista(item)}
                      disabled={ocupado}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12141C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transition-none"
                    >
                      {enProceso ? (
                        <RefreshIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckIcon className="h-5 w-5" />
                      )}
                      {enProceso ? 'Procesando...' : 'Marcar como lista'}
                    </button>
                  </footer>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-800/80 bg-[#12141C] px-4 py-2.5 text-[11px] font-semibold text-stone-400">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Sincronización POS activa
          </span>
          <span className="flex items-center gap-2">
            <ChefHatIcon className="h-3.5 w-3.5 text-amber-400" />
            Estación principal · Horno de leña
          </span>
        </div>
      </footer>

      <div
        aria-live="polite"
        className={`fixed bottom-6 right-4 z-50 w-full max-w-sm transition-all duration-300 motion-reduce:transition-none ${
          aviso ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-stone-700 bg-[#1A1D26] p-4 shadow-2xl">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-white">Ticket listo</h2>
            <p className="text-[11px] font-semibold text-stone-400">{aviso ?? ' '}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
