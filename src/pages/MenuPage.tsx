import { useEffect, useMemo, useState } from 'react'
import { getMenu } from '../api'
import { Header } from '../components/Header'
import { ProductCard, type Producto } from '../components/ProductCard'
import { useCart } from '../context/CartContext'

type Filtro = 'todos' | 'pizza' | 'bebida'

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pizza', label: 'Pizzas' },
  { value: 'bebida', label: 'Bebidas' },
]

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200/70" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-stone-200 motion-reduce:animate-none" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-stone-200 motion-reduce:animate-none" />
        <div className="h-3 w-full animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
        <div className="h-11 w-full animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none" />
      </div>
    </div>
  )
}

export default function MenuPage() {
  const { addItem } = useCart()
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarProductos() {
      setCargando(true)
      setError(null)

      try {
        const data = await getMenu(undefined, controller.signal)
        setProductos(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError('No pudimos cargar el menú. Intenta de nuevo.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarProductos()

    return () => controller.abort()
  }, [intento])

  const productosFiltrados = useMemo(() => {
    if (filtro === 'todos') return productos
    return productos.filter((producto) => producto.tipo === filtro)
  }, [productos, filtro])

  const agregarAlCarrito = (producto: Producto) => {
    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio,
      cantidad: 1,
      ingredientes_quitar: [],
      ingredientes_agregar: [],
      precio_extra_total: 0,
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-stone-900 selection:bg-brand-red selection:text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,#FEE2E2_0%,#FFFBEB_35%,#F8F5F0_100%)]">
        <Header />

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
          <section className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-brand-gold ring-1 ring-brand-gold/30">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
              Horno de leña · Masa madre
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Nuestro Menú
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500 sm:text-base">
              Pizzas artesanales y bebidas listas para tu mesa. Elige tu favorita y agrégala al
              pedido.
            </p>
          </section>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por tipo">
              {FILTROS.map((opcion) => {
                const activo = filtro === opcion.value
                return (
                  <button
                    key={opcion.value}
                    type="button"
                    onClick={() => setFiltro(opcion.value)}
                    aria-pressed={activo}
                    className={`rounded-full px-5 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      activo
                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red-deep/20'
                        : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:text-stone-900 hover:ring-brand-red/30'
                    }`}
                  >
                    {opcion.label}
                  </button>
                )
              })}
            </div>

            {!cargando && !error && (
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>

          <section aria-busy={cargando}>
            {error ? (
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-brand-red-deep/5 ring-1 ring-stone-200/70">
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
                <h2 className="mt-4 text-lg font-extrabold text-stone-900">Menú no disponible</h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">{error}</p>
                <button
                  type="button"
                  onClick={() => setIntento((valor) => valor + 1)}
                  className="mt-5 rounded-2xl bg-brand-red-dark px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Reintentar
                </button>
              </div>
            ) : cargando ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-brand-red-deep/5 ring-1 ring-stone-200/70">
                <h2 className="text-lg font-extrabold text-stone-900">Sin productos en esta categoría</h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  Prueba con otro filtro para ver el resto del menú.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productosFiltrados.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} onAgregar={agregarAlCarrito} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
