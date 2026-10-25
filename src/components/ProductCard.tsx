import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export interface Ingrediente {
  id: number
  nombre: string
}

export type TipoProducto = 'pizza' | 'bebida'

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  tipo: TipoProducto
  precio: number
  imagen_url: string | null
  ingredientes_base: Ingrediente[]
}

interface ProductCardProps {
  producto: Producto
  onAgregar?: (producto: Producto) => void
}

function PizzaPlaceholder() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-16 w-16"
      aria-hidden="true"
    >
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
    </svg>
  )
}

export function ProductCard({ producto, onAgregar }: ProductCardProps) {
  const esPizza = producto.tipo === 'pizza'
  const ingredientes = producto.ingredientes_base.slice(0, 3)
  const restantes = producto.ingredientes_base.length - ingredientes.length
  const [agregado, setAgregado] = useState(false)
  const detalleUrl = `/producto/${producto.id}`

  useEffect(() => {
    if (!agregado) return

    const timeout = setTimeout(() => setAgregado(false), 1600)
    return () => clearTimeout(timeout)
  }, [agregado])

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-red-deep/5 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-red-deep/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Link
          to={detalleUrl}
          aria-label={`Ver detalle de ${producto.nombre}`}
          className="block h-full w-full rounded-t-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-red"
        >
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-yellow/30 to-brand-red/15 text-brand-red-dark">
              <PizzaPlaceholder />
            </div>
          )}

          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white ${
              esPizza ? 'bg-brand-red' : 'bg-emerald-600'
            }`}
          >
            {esPizza ? 'Pizza' : 'Bebida'}
          </span>

          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-stone-900 shadow-sm ring-1 ring-stone-200/70">
            ${producto.precio.toFixed(2)}
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-stone-900">
            <Link
              to={detalleUrl}
              className="rounded transition hover:text-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {producto.nombre}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-stone-500">
            {producto.descripcion}
          </p>
        </div>

        {ingredientes.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Ingredientes base">
            {ingredientes.map((ingrediente) => (
              <li
                key={ingrediente.id}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-600"
              >
                {ingrediente.nombre}
              </li>
            ))}
            {restantes > 0 && (
              <li className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                +{restantes}
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-stretch gap-2">
          <Link
            to={detalleUrl}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-extrabold text-stone-600 transition hover:border-brand-red/40 hover:text-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Ver detalle
          </Link>

          <button
            type="button"
            onClick={() => {
              onAgregar?.(producto)
              setAgregado(true)
            }}
            aria-live="polite"
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-extrabold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
              agregado
                ? 'bg-emerald-600 shadow-emerald-900/20 hover:bg-emerald-700 focus-visible:ring-emerald-600'
                : 'bg-brand-red-dark shadow-brand-red-deep/25 hover:bg-brand-red-deep focus-visible:ring-brand-red'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              {agregado ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
            </svg>
            {agregado ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}
