import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'
import { useCart } from '../context/CartContext'

interface IngredienteResumen {
  id: number
  nombre: string
}

interface ProductoResumen {
  ingredientes_base: IngredienteResumen[]
}

const MAX_NOMBRE = 80

function BagIcon() {
  return (
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
  )
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [nombreCliente, setNombreCliente] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [nombresBase, setNombresBase] = useState<Record<number, string>>({})
  const [nombresExtras, setNombresExtras] = useState<Record<number, string>>({})
  const inputNombre = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarNombres() {
      try {
        const [respuestaProductos, respuestaExtras] = await Promise.all([
          fetch('/api/productos', { signal: controller.signal }),
          fetch('/api/ingredientes', { signal: controller.signal }),
        ])

        if (!respuestaProductos.ok || !respuestaExtras.ok) return

        const productos: ProductoResumen[] = await respuestaProductos.json()
        const extras: IngredienteResumen[] = await respuestaExtras.json()

        if (controller.signal.aborted) return

        const base: Record<number, string> = {}
        for (const producto of productos) {
          for (const ingrediente of producto.ingredientes_base) {
            base[ingrediente.id] = ingrediente.nombre
          }
        }

        const adicionales: Record<number, string> = {}
        for (const extra of extras) {
          adicionales[extra.id] = extra.nombre
        }

        setNombresBase(base)
        setNombresExtras(adicionales)
      } catch {
        return
      }
    }

    cargarNombres()

    return () => controller.abort()
  }, [])

  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0)

  async function confirmarPedido(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nombre = nombreCliente.trim()

    if (!nombre) {
      setError('El nombre del cliente es obligatorio.')
      inputNombre.current?.focus()
      return
    }

    if (items.length === 0) return

    setEnviando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_cliente: nombre,
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            ingredientes_quitar: item.ingredientes_quitar,
            ingredientes_agregar: item.ingredientes_agregar,
          })),
        }),
      })

      const data: unknown = await respuesta.json().catch(() => null)

      if (respuesta.status === 201) {
        const pedido = data as { id?: number } | null

        if (!pedido?.id) {
          setError('El pedido se creó, pero no recibimos su identificador.')
          return
        }

        localStorage.setItem('pedido_id', String(pedido.id))
        clearCart()
        navigate(`/pedido/${pedido.id}`)
        return
      }

      if (respuesta.status === 422 || respuesta.status === 400) {
        const errorApi = data as { error?: { mensaje?: string } } | null
        setError(errorApi?.error?.mensaje ?? 'No pudimos validar el pedido.')
      } else {
        setError('No pudimos crear el pedido. Intenta de nuevo.')
      }
    } catch {
      setError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 selection:bg-brand-red selection:text-white">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          Seguir comprando
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
            Tu carrito
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500">
            Revisa los productos y personalizaciones antes de confirmar tu pedido.
          </p>
        </div>

        <form onSubmit={confirmarPedido} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-stone-900">
                    <span className="text-brand-red">
                      <BagIcon />
                    </span>
                    1. Tu pedido
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-stone-500">
                    Los precios son una estimación; el backend calcula el total real.
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                  {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <BagIcon />
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-stone-900">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    Agrega una pizza o una bebida para comenzar tu pedido.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-brand-red-dark px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    Ver el menú
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {items.map((item, index) => {
                    const precioUnitario = item.precio_base + item.precio_extra_total
                    const tieneModificadores =
                      item.ingredientes_quitar.length > 0 || item.ingredientes_agregar.length > 0

                    return (
                      <li
                        key={`${item.producto_id}-${index}`}
                        className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-100 text-brand-red-dark">
                            <BagIcon />
                          </div>

                          <div>
                            <h3 className="text-sm font-extrabold text-stone-900">
                              {item.nombre}
                            </h3>
                            <p className="mt-0.5 text-xs font-semibold text-stone-500">
                              ${item.precio_base.toFixed(2)} base
                              {item.precio_extra_total > 0 &&
                                ` + $${item.precio_extra_total.toFixed(2)} extras`}
                              {` · x${item.cantidad}`}
                            </p>

                            {tieneModificadores && (
                              <ul className="mt-2 flex flex-wrap gap-1.5">
                                {item.ingredientes_quitar.map((ingredienteId) => (
                                  <li
                                    key={`quitar-${ingredienteId}`}
                                    className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-stone-600 ring-1 ring-stone-200"
                                  >
                                    Sin {nombresBase[ingredienteId] ?? `ingrediente #${ingredienteId}`}
                                  </li>
                                ))}
                                {item.ingredientes_agregar.map((ingredienteId) => (
                                  <li
                                    key={`agregar-${ingredienteId}`}
                                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200"
                                  >
                                    + {nombresExtras[ingredienteId] ?? `extra #${ingredienteId}`}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                          <span className="text-sm font-black text-stone-900">
                            ${(precioUnitario * item.cantidad).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold text-stone-400 transition hover:bg-rose-50 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                          >
                            <TrashIcon />
                            Eliminar
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <Link
                to="/"
                className="mt-4 block w-full rounded-2xl border-2 border-dashed border-stone-200 py-2.5 text-center text-xs font-bold text-stone-600 transition hover:border-brand-red/50 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
              >
                + Agregar más productos
              </Link>
            </div>

            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
              <h2 className="text-base font-extrabold text-stone-900">2. Datos del cliente</h2>
              <p className="mt-0.5 text-xs font-semibold text-stone-500">
                Necesitamos un nombre para identificar tu pedido.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="nombre-cliente"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
                >
                  Nombre del Cliente *
                </label>
                <input
                  ref={inputNombre}
                  id="nombre-cliente"
                  name="nombre_cliente"
                  type="text"
                  required
                  maxLength={MAX_NOMBRE}
                  autoComplete="name"
                  value={nombreCliente}
                  onChange={(event) => {
                    setNombreCliente(event.target.value)
                    if (error) setError(null)
                  }}
                  aria-invalid={Boolean(error)}
                  placeholder="Ej. Marco Rossi"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-900 shadow-sm transition focus:border-brand-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                />
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-medium text-stone-400">
                    Máximo {MAX_NOMBRE} caracteres.
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">
                    {nombreCliente.length}/{MAX_NOMBRE}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
              <h2 className="border-b border-stone-100 pb-3 text-base font-extrabold text-stone-900">
                3. Resumen
              </h2>

              <dl className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <dt>Artículos</dt>
                  <dd className="font-bold text-stone-900">
                    {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <dt>Subtotal</dt>
                  <dd className="font-bold text-stone-900">${total.toFixed(2)}</dd>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex items-end justify-between">
                  <dt>
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-stone-400">
                      Total estimado
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">
                      Impuestos y envío se calculan al confirmar
                    </span>
                  </dt>
                  <dd className="text-2xl font-black tracking-tight text-brand-red sm:text-3xl">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </dl>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-brand-red-dark"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={items.length === 0 || enviando}
                className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-red to-rose-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand-red/30 transition hover:from-brand-red-dark hover:to-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 motion-reduce:transition-none sm:text-base"
              >
                <BagIcon />
                {enviando ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>

              <p className="mt-3 text-center text-[10px] font-medium text-stone-400">
                Al confirmar, aceptas los términos de servicio y la política de entrega de Forno
                &amp; Dough.
              </p>
            </div>
          </aside>
        </form>
      </main>
    </div>
  )
}
