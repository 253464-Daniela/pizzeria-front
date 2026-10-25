import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header'
import { IngredientSelector } from '../components/IngredientSelector'
import { useCart } from '../context/CartContext'

export interface IngredienteBase {
  id: number
  nombre: string
}

export interface IngredienteExtra {
  id: number
  nombre: string
  precio_extra: number
}

export interface ProductoDetalle {
  id: number
  nombre: string
  descripcion: string
  tipo: 'pizza' | 'bebida'
  precio: number
  ingredientes_base: IngredienteBase[]
}

const MAX_CANTIDAD = 10

function alternarSeleccion(actuales: number[], id: number) {
  return actuales.includes(id) ? actuales.filter((valor) => valor !== id) : [...actuales, id]
}

function PizzaArt() {
  return (
    <svg
      viewBox="0 0 300 300"
      className="h-full w-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <circle cx="150" cy="150" r="135" fill="#D97706" stroke="#B45309" strokeWidth="8" />
      <circle cx="150" cy="150" r="120" fill="#FBBF24" />
      <circle cx="150" cy="150" r="112" fill="#DC2626" />
      <circle cx="150" cy="150" r="105" fill="#FEF08A" opacity="0.9" />
      <circle cx="120" cy="110" r="22" fill="#FEF08A" />
      <circle cx="180" cy="130" r="25" fill="#FEF08A" />
      <circle cx="140" cy="180" r="24" fill="#FEF08A" />
      <circle cx="110" cy="100" r="18" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <circle cx="185" cy="115" r="19" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <circle cx="145" cy="150" r="20" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <circle cx="100" cy="170" r="18" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <circle cx="180" cy="180" r="19" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <circle cx="145" cy="210" r="17" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
      <path d="M140 120 C 130 100, 110 110, 140 135 C 170 110, 150 100, 140 120 Z" fill="#15803D" />
      <path d="M170 170 C 160 150, 140 160, 170 185 C 200 160, 180 150, 170 170 Z" fill="#16A34A" />
      <path d="M110 170 C 100 150, 80 160, 110 185 C 140 160, 120 150, 110 170 Z" fill="#15803D" />
    </svg>
  )
}

function DrinkArt() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-4/5 w-4/5 drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)]"
      aria-hidden="true"
    >
      <path d="M60 45h80l-11 125H71L60 45Z" fill="#F5F5F4" stroke="#A8A29E" strokeWidth="4" />
      <path d="M64 82h72l-2 20H66l-2-20Z" fill="#E53E3E" />
      <path d="M78 45l4-18h36l4 18" fill="none" stroke="#E53E3E" strokeWidth="8" />
      <path d="M74 120h52l-4 40H78l-4-40Z" fill="#FCA5A5" opacity="0.55" />
      <circle cx="92" cy="132" r="6" fill="#E53E3E" />
      <circle cx="112" cy="148" r="5" fill="#E53E3E" />
    </svg>
  )
}

function SkeletonDetalle() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-12" aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-3xl bg-stone-200 lg:col-span-5 motion-reduce:animate-none" />
      <div className="space-y-4 lg:col-span-7">
        <div className="h-40 animate-pulse rounded-3xl bg-white ring-1 ring-stone-200/70 motion-reduce:animate-none" />
        <div className="h-56 animate-pulse rounded-3xl bg-white ring-1 ring-stone-200/70 motion-reduce:animate-none" />
        <div className="h-48 animate-pulse rounded-3xl bg-white ring-1 ring-stone-200/70 motion-reduce:animate-none" />
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [producto, setProducto] = useState<ProductoDetalle | null>(null)
  const [ingredientesExtra, setIngredientesExtra] = useState<IngredienteExtra[]>([])
  const [cargando, setCargando] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [quitar, setQuitar] = useState<number[]>([])
  const [agregar, setAgregar] = useState<number[]>([])

  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    async function cargarDetalle() {
      setCargando(true)
      setError(null)

      try {
        const [respuestaProducto, respuestaExtras] = await Promise.all([
          fetch(`/api/products/${id}`, { signal: controller.signal }),
          fetch('/api/ingredientes', { signal: controller.signal }),
        ])

        if (respuestaProducto.status === 404) throw new Error('not-found')
        if (!respuestaProducto.ok) throw new Error(`Producto: ${respuestaProducto.status}`)
        if (!respuestaExtras.ok) throw new Error(`Ingredientes: ${respuestaExtras.status}`)

        const [detalle, extras]: [ProductoDetalle, IngredienteExtra[]] = await Promise.all([
          respuestaProducto.json(),
          respuestaExtras.json(),
        ])

        if (controller.signal.aborted) return

        setProducto(detalle)
        setIngredientesExtra(extras)
        setCantidad(1)
        setQuitar([])
        setAgregar([])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof Error && err.message === 'not-found') {
          setError('Ese producto no existe o ya no está disponible.')
        } else {
          setError('No pudimos cargar el producto. Intenta de nuevo.')
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarDetalle()

    return () => controller.abort()
  }, [id, intento])

  const errorVisible = id ? error : 'Producto no encontrado.'
  const esPizza = producto?.tipo === 'pizza'
  const cantidadEfectiva = esPizza ? 1 : cantidad

  const extrasSeleccionados = ingredientesExtra.filter((extra) => agregar.includes(extra.id))
  const total = producto
    ? (producto.precio + extrasSeleccionados.reduce((suma, extra) => suma + extra.precio_extra, 0)) *
      cantidadEfectiva
    : 0

  const cambiarCantidad = (delta: number) => {
    setCantidad((actual) => Math.min(MAX_CANTIDAD, Math.max(1, actual + delta)))
  }

  const agregarAlCarrito = () => {
    if (!producto) return

    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio,
      cantidad: cantidadEfectiva,
      ingredientes_quitar: quitar,
      ingredientes_agregar: agregar,
      precio_extra_total: extrasSeleccionados.reduce(
        (suma, extra) => suma + extra.precio_extra,
        0,
      ),
    })

    navigate('/carrito')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 selection:bg-brand-red selection:text-white">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-100 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
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
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Volver al menú
        </Link>

        {cargando ? (
          <SkeletonDetalle />
        ) : errorVisible || !producto ? (
          <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-stone-200/80 bg-white p-8 text-center shadow-lg shadow-brand-red-deep/5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-brand-red-dark">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h1 className="mt-4 text-lg font-extrabold text-stone-900">Producto no disponible</h1>
            <p className="mt-1 text-sm font-semibold text-stone-500">{errorVisible}</p>
            <button
              type="button"
              onClick={() => setIntento((valor) => valor + 1)}
              className="mt-5 rounded-2xl bg-brand-red-dark px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <section className="space-y-4 lg:sticky lg:top-24 lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-6 text-white shadow-2xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-red/10 via-transparent to-brand-yellow/10" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/20 blur-3xl" />

                <div className="relative flex items-center justify-between gap-3 text-xs">
                  <span className="rounded-full bg-stone-800/90 px-3 py-1.5 font-bold text-stone-300 ring-1 ring-stone-700/60">
                    {esPizza ? 'Pizza artesanal' : 'Bebida'}
                  </span>
                  <span className="rounded-full bg-stone-800/80 px-3 py-1.5 font-bold text-amber-300 ring-1 ring-stone-700/60">
                    ${producto.precio.toFixed(2)} base
                  </span>
                </div>

                <div className="relative my-6 flex aspect-square items-center justify-center">
                  {esPizza ? <PizzaArt /> : <DrinkArt />}
                </div>

                <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-stone-800 bg-stone-900/90 p-3 text-xs text-stone-300">
                  <span className="font-bold text-white">{producto.nombre}</span>
                  {esPizza && (
                    <span className="flex-shrink-0 font-semibold text-stone-400">
                      {producto.ingredientes_base.length - quitar.length} base · {agregar.length} extras
                    </span>
                  )}
                </div>
              </div>

              {esPizza && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-900">
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
                      <path d="M12 3v18" />
                      <path d="m5 8 7-5 7 5" />
                      <path d="m5 16 7 5 7-5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wide text-amber-950">
                      Cómo se calcula el precio
                    </h2>
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-amber-900/80">
                      Agregar ingredientes suma su precio extra. Quitar ingredientes base no descuenta
                      del precio.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-6 lg:col-span-7">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        esPizza ? 'bg-brand-red/10 text-brand-red-dark' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {esPizza ? 'Personalizable' : 'Bebida'}
                    </span>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                      {producto.nombre}
                    </h1>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className="block text-[10px] font-bold uppercase text-stone-400">
                      Precio base
                    </span>
                    <span className="text-2xl font-black text-brand-red">
                      ${producto.precio.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium leading-relaxed text-stone-500 sm:text-sm">
                  {producto.descripcion}
                </p>

                {esPizza && (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-bold text-stone-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    Cantidad fija: 1 pizza personalizada
                  </p>
                )}
              </div>

              {esPizza ? (
                <>
                  <IngredientSelector
                    modo="quitar"
                    titulo="1. Quita ingredientes base"
                    descripcion="Activa los ingredientes que no quieres en tu pizza."
                    ingredientes={producto.ingredientes_base}
                    seleccionados={quitar}
                    onToggle={(ingredienteId) =>
                      setQuitar((actuales) => alternarSeleccion(actuales, ingredienteId))
                    }
                  />

                  <IngredientSelector
                    modo="agregar"
                    titulo="2. Agrega ingredientes extra"
                    descripcion="Cada extra se suma al precio base de la pizza."
                    ingredientes={ingredientesExtra}
                    seleccionados={agregar}
                    onToggle={(ingredienteId) =>
                      setAgregar((actuales) => alternarSeleccion(actuales, ingredienteId))
                    }
                  />
                </>
              ) : (
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Cantidad
                      </h2>
                      <p className="text-[11px] font-semibold text-stone-500">
                        Elige entre 1 y {MAX_CANTIDAD} unidades.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-2xl border border-stone-200 bg-stone-100 p-1">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(-1)}
                        disabled={cantidad <= 1}
                        aria-label="Restar una unidad"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-800 shadow-sm transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-10 text-center text-sm font-black text-stone-900" aria-live="polite">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(1)}
                        disabled={cantidad >= MAX_CANTIDAD}
                        aria-label="Sumar una unidad"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-stone-800 shadow-sm transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {producto && !cargando && !errorVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3.5 shadow-2xl backdrop-blur-lg sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] font-bold uppercase text-stone-400">
                Total estimado
              </span>
              <span className="text-xl font-black leading-tight text-stone-900 sm:text-2xl">
                ${total.toFixed(2)}
              </span>
              <span className="ml-2 text-xs font-bold text-stone-400">
                {cantidadEfectiva} {cantidadEfectiva === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>

            <button
              type="button"
              onClick={agregarAlCarrito}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-red to-rose-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-red/30 transition hover:from-brand-red-dark hover:to-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none sm:px-8 sm:text-base"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Agregar al carrito (${total.toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
