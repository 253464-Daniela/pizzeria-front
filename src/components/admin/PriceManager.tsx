import { useState } from 'react'
import type { IngredienteAdmin, ProductoAdmin } from './types'
import { IconoGuardar, IconoIngrediente, IconoProducto, Spinner } from './icons'

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

interface Props {
  productos: ProductoAdmin[]
  ingredientes: IngredienteAdmin[]
  onActualizarProducto: (id: number, precio: number) => Promise<string | null>
  onActualizarIngrediente: (id: number, precioExtra: number) => Promise<string | null>
}

function claveProducto(id: number) {
  return `producto-${id}`
}

function claveIngrediente(id: number) {
  return `ingrediente-${id}`
}

export default function PriceManager({
  productos,
  ingredientes,
  onActualizarProducto,
  onActualizarIngrediente,
}: Props) {
  const [borradores, setBorradores] = useState<Record<string, string>>({})
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [procesando, setProcesando] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const termino = busqueda.trim().toLowerCase()
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(termino),
  )
  const ingredientesFiltrados = ingredientes.filter((ingrediente) =>
    ingrediente.nombre.toLowerCase().includes(termino),
  )

  function actualizarBorrador(clave: string, valor: string) {
    setBorradores((previos) => ({ ...previos, [clave]: valor }))
    setErrores((previos) => {
      if (!previos[clave]) return previos

      const copia = { ...previos }
      delete copia[clave]
      return copia
    })
  }

  function limpiarBorrador(clave: string) {
    setBorradores((previos) => {
      const copia = { ...previos }
      delete copia[clave]
      return copia
    })
  }

  async function guardarProducto(producto: ProductoAdmin) {
    const clave = claveProducto(producto.id)
    const texto = borradores[clave] ?? producto.precio.toFixed(2)
    const valor = Number(texto)

    if (!texto.trim() || !Number.isFinite(valor) || valor <= 0) {
      setErrores((previos) => ({ ...previos, [clave]: 'El precio debe ser mayor a 0.' }))
      return
    }

    setProcesando(clave)

    try {
      const mensaje = await onActualizarProducto(producto.id, Number(valor.toFixed(2)))

      if (mensaje) {
        setErrores((previos) => ({ ...previos, [clave]: mensaje }))
      } else {
        limpiarBorrador(clave)
      }
    } finally {
      setProcesando(null)
    }
  }

  async function guardarIngrediente(ingrediente: IngredienteAdmin) {
    const clave = claveIngrediente(ingrediente.id)
    const texto = borradores[clave] ?? ingrediente.precio_extra.toFixed(2)
    const valor = Number(texto)

    if (!texto.trim() || !Number.isFinite(valor) || valor < 0) {
      setErrores((previos) => ({
        ...previos,
        [clave]: 'El precio extra debe ser mayor o igual a 0.',
      }))
      return
    }

    setProcesando(clave)

    try {
      const mensaje = await onActualizarIngrediente(ingrediente.id, Number(valor.toFixed(2)))

      if (mensaje) {
        setErrores((previos) => ({ ...previos, [clave]: mensaje }))
      } else {
        limpiarBorrador(clave)
      }
    } finally {
      setProcesando(null)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-stone-900">
              Gestión de precios
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-stone-500">
              Actualiza la carta y los extras. Los cambios quedan registrados en el historial.
            </p>
          </div>
          <div className="relative w-full lg:w-72">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar producto o ingrediente..."
              aria-label="Buscar producto o ingrediente"
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs font-bold text-stone-800 placeholder-stone-400 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 p-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                <IconoProducto className="h-4 w-4" />
              </span>
              Productos
            </h3>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
              {productosFiltrados.length} de {productos.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Precio actual</th>
                  <th className="px-4 py-3">Nuevo precio</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-700">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-xs font-bold text-stone-400">
                      No hay productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => {
                    const clave = claveProducto(producto.id)
                    const valor = borradores[clave] ?? producto.precio.toFixed(2)
                    const hayCambio = Number(valor) !== producto.precio
                    const estaProcesando = procesando === clave

                    return (
                      <tr key={producto.id} className="transition hover:bg-stone-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-stone-500">
                              <IconoProducto className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-stone-900">{producto.nombre}</p>
                              <span className="font-mono text-[10px] font-bold text-stone-400">
                                #{producto.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              producto.tipo === 'pizza'
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                          >
                            {producto.tipo === 'pizza' ? 'Pizza' : 'Bebida'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-stone-500">
                          {formatoMoneda.format(producto.precio)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative w-36">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-stone-400">
                              $
                            </span>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              inputMode="decimal"
                              value={valor}
                              onChange={(event) => actualizarBorrador(clave, event.target.value)}
                              aria-label={`Nuevo precio de ${producto.nombre}`}
                              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-6 pr-2 text-right font-mono text-xs font-extrabold text-stone-900 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                            />
                          </div>
                          {errores[clave] && (
                            <p className="mt-1 w-40 text-[10px] font-bold text-red-600">
                              {errores[clave]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => guardarProducto(producto)}
                            disabled={!hayCambio || estaProcesando}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-3 py-2 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none motion-reduce:transition-none"
                          >
                            {estaProcesando ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <IconoGuardar className="h-3.5 w-3.5" />
                            )}
                            Actualizar
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-brand-gold">
                <IconoIngrediente className="h-4 w-4" />
              </span>
              Ingredientes extra
            </h3>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
              {ingredientesFiltrados.length} de {ingredientes.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Ingrediente</th>
                  <th className="px-4 py-3 text-right">Precio extra actual</th>
                  <th className="px-4 py-3">Nuevo precio extra</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-700">
                {ingredientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-xs font-bold text-stone-400">
                      No hay ingredientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  ingredientesFiltrados.map((ingrediente) => {
                    const clave = claveIngrediente(ingrediente.id)
                    const valor = borradores[clave] ?? ingrediente.precio_extra.toFixed(2)
                    const hayCambio = Number(valor) !== ingrediente.precio_extra
                    const estaProcesando = procesando === clave

                    return (
                      <tr key={ingrediente.id} className="transition hover:bg-stone-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-brand-gold">
                              <IconoIngrediente className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-stone-900">{ingrediente.nombre}</p>
                              <span className="font-mono text-[10px] font-bold text-stone-400">
                                #{ingrediente.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-stone-500">
                          {formatoMoneda.format(ingrediente.precio_extra)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative w-36">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-stone-400">
                              $
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={valor}
                              onChange={(event) => actualizarBorrador(clave, event.target.value)}
                              aria-label={`Nuevo precio extra de ${ingrediente.nombre}`}
                              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-6 pr-2 text-right font-mono text-xs font-extrabold text-stone-900 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                            />
                          </div>
                          {errores[clave] && (
                            <p className="mt-1 w-40 text-[10px] font-bold text-red-600">
                              {errores[clave]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => guardarIngrediente(ingrediente)}
                            disabled={!hayCambio || estaProcesando}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-3 py-2 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none motion-reduce:transition-none"
                          >
                            {estaProcesando ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <IconoGuardar className="h-3.5 w-3.5" />
                            )}
                            Actualizar
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
