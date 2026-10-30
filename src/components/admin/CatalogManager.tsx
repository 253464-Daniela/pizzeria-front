import { useState, type FormEvent } from 'react'
import type { IngredienteIn, ProductoIn, TipoProducto } from '../../api'
import type { IngredienteAdmin, ProductoAdmin } from './types'
import {
  IconoAgregar,
  IconoAlerta,
  IconoEliminar,
  IconoIngrediente,
  IconoProducto,
  IconoVolver,
  Spinner,
} from './icons'

const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

type Pestana = 'producto' | 'ingrediente'
type ObjetivoEliminar = { tipo: Pestana; id: number; nombre: string } | null

interface Props {
  productos: ProductoAdmin[]
  ingredientes: IngredienteAdmin[]
  onCrearProducto: (payload: ProductoIn) => Promise<string | null>
  onEliminarProducto: (id: number) => Promise<string | null>
  onCrearIngrediente: (payload: IngredienteIn) => Promise<string | null>
  onEliminarIngrediente: (id: number) => Promise<string | null>
}

const claseInput =
  'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-800 placeholder-stone-400 transition focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red'

const claseEtiqueta = 'text-[11px] font-black uppercase tracking-wider text-stone-500'

export default function CatalogManager({
  productos,
  ingredientes,
  onCrearProducto,
  onEliminarProducto,
  onCrearIngrediente,
  onEliminarIngrediente,
}: Props) {
  const [pestana, setPestana] = useState<Pestana>('producto')
  const [creando, setCreando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [tipo, setTipo] = useState<TipoProducto>('pizza')
  const [descripcion, setDescripcion] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [ingredientesBase, setIngredientesBase] = useState<number[]>([])

  const [nombreIngrediente, setNombreIngrediente] = useState('')
  const [precioExtra, setPrecioExtra] = useState('')

  const [objetivo, setObjetivo] = useState<ObjetivoEliminar>(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  function cambiarPestana(valor: Pestana) {
    setPestana(valor)
    setErrorFormulario(null)
    setErrorEliminar(null)
    setObjetivo(null)
  }

  function alternarIngredienteBase(id: number) {
    setIngredientesBase((previos) =>
      previos.includes(id) ? previos.filter((valor) => valor !== id) : [...previos, id],
    )
  }

  function limpiarProducto() {
    setNombre('')
    setPrecio('')
    setTipo('pizza')
    setDescripcion('')
    setImagenUrl('')
    setIngredientesBase([])
  }

  function limpiarIngrediente() {
    setNombreIngrediente('')
    setPrecioExtra('')
  }

  async function enviarProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorFormulario(null)

    const nombreLimpio = nombre.trim()
    const valor = Number(precio)

    if (!nombreLimpio) {
      setErrorFormulario('El nombre del producto es obligatorio.')
      return
    }

    if (!precio.trim() || !Number.isFinite(valor) || valor <= 0) {
      setErrorFormulario('El precio debe ser un número mayor a 0.')
      return
    }

    setCreando(true)

    try {
      const mensaje = await onCrearProducto({
        nombre: nombreLimpio,
        precio: Number(valor.toFixed(2)),
        tipo,
        descripcion: descripcion.trim() || null,
        imagen_url: imagenUrl.trim() || null,
        ingredientes_base: ingredientesBase,
      })

      if (mensaje) {
        setErrorFormulario(mensaje)
      } else {
        limpiarProducto()
      }
    } finally {
      setCreando(false)
    }
  }

  async function enviarIngrediente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorFormulario(null)

    const nombreLimpio = nombreIngrediente.trim()
    const valor = precioExtra.trim() ? Number(precioExtra) : 0

    if (!nombreLimpio) {
      setErrorFormulario('El nombre del ingrediente es obligatorio.')
      return
    }

    if (!Number.isFinite(valor) || valor < 0) {
      setErrorFormulario('El precio extra debe ser un número mayor o igual a 0.')
      return
    }

    setCreando(true)

    try {
      const mensaje = await onCrearIngrediente({
        nombre: nombreLimpio,
        precio_extra: Number(valor.toFixed(2)),
      })

      if (mensaje) {
        setErrorFormulario(mensaje)
      } else {
        limpiarIngrediente()
      }
    } finally {
      setCreando(false)
    }
  }

  async function confirmarEliminacion() {
    if (!objetivo) return

    setErrorEliminar(null)
    setEliminando(true)

    try {
      const mensaje =
        objetivo.tipo === 'producto'
          ? await onEliminarProducto(objetivo.id)
          : await onEliminarIngrediente(objetivo.id)

      if (mensaje) {
        setErrorEliminar(mensaje)
      } else {
        setObjetivo(null)
      }
    } finally {
      setEliminando(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
          Catálogo
        </p>
        <h2 className="mt-1 text-lg font-black tracking-tight text-stone-900">
          Altas y bajas del menú
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-stone-500">
          Agrega productos o ingredientes nuevos y retira los que ya no ofreces.
        </p>

        <div
          role="tablist"
          aria-label="Seleccionar tipo de registro"
          className="mt-4 inline-flex gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1"
        >
          {([
            { valor: 'producto' as const, etiqueta: 'Nuevo producto' },
            { valor: 'ingrediente' as const, etiqueta: 'Nuevo ingrediente' },
          ]).map((tab) => {
            const activo = tab.valor === pestana

            return (
              <button
                key={tab.valor}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => cambiarPestana(tab.valor)}
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

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {pestana === 'producto' ? (
            <form onSubmit={enviarProducto} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                  <IconoProducto className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-extrabold text-stone-900">Datos del producto</h3>
              </div>

              <div>
                <label htmlFor="producto-nombre" className={claseEtiqueta}>
                  Nombre
                </label>
                <input
                  id="producto-nombre"
                  type="text"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Ej. Margherita Especial"
                  className={`mt-1 ${claseInput}`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="producto-precio" className={claseEtiqueta}>
                    Precio
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-stone-400">
                      $
                    </span>
                    <input
                      id="producto-precio"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={precio}
                      onChange={(event) => setPrecio(event.target.value)}
                      placeholder="0.00"
                      className={`${claseInput} pl-7 font-mono`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="producto-tipo" className={claseEtiqueta}>
                    Tipo
                  </label>
                  <select
                    id="producto-tipo"
                    value={tipo}
                    onChange={(event) => setTipo(event.target.value as TipoProducto)}
                    className={`mt-1 ${claseInput}`}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="bebida">Bebida</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="producto-descripcion" className={claseEtiqueta}>
                  Descripción <span className="font-semibold normal-case text-stone-400">(opcional)</span>
                </label>
                <textarea
                  id="producto-descripcion"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  rows={2}
                  placeholder="Ingredientes y notas del producto"
                  className={`mt-1 resize-none ${claseInput}`}
                />
              </div>

              <div>
                <label htmlFor="producto-imagen" className={claseEtiqueta}>
                  URL de imagen <span className="font-semibold normal-case text-stone-400">(opcional)</span>
                </label>
                <input
                  id="producto-imagen"
                  type="url"
                  value={imagenUrl}
                  onChange={(event) => setImagenUrl(event.target.value)}
                  placeholder="https://..."
                  className={`mt-1 ${claseInput}`}
                />
              </div>

              <div>
                <span className={claseEtiqueta}>
                  Ingredientes base{' '}
                  <span className="font-semibold normal-case text-stone-400">(opcional)</span>
                </span>
                {ingredientes.length === 0 ? (
                  <p className="mt-1 text-xs font-semibold text-stone-400">
                    Aún no hay ingredientes registrados.
                  </p>
                ) : (
                  <div className="mt-1.5 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-2">
                    {ingredientes.map((ingrediente) => {
                      const activo = ingredientesBase.includes(ingrediente.id)

                      return (
                        <button
                          key={ingrediente.id}
                          type="button"
                          aria-pressed={activo}
                          onClick={() => alternarIngredienteBase(ingrediente.id)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none ${
                            activo
                              ? 'border-brand-red bg-brand-red text-white'
                              : 'border-stone-200 bg-white text-stone-600 hover:border-brand-red/40 hover:text-brand-red'
                          }`}
                        >
                          {ingrediente.nombre}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {errorFormulario && (
                <p className="flex items-start gap-1.5 text-xs font-bold text-red-600" role="alert">
                  <IconoAlerta className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {errorFormulario}
                </p>
              )}

              <button
                type="submit"
                disabled={creando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                {creando ? <Spinner className="h-4 w-4" /> : <IconoAgregar className="h-4 w-4" />}
                Agregar producto
              </button>
            </form>
          ) : (
            <form onSubmit={enviarIngrediente} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-brand-gold">
                  <IconoIngrediente className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-extrabold text-stone-900">Datos del ingrediente</h3>
              </div>

              <div>
                <label htmlFor="ingrediente-nombre" className={claseEtiqueta}>
                  Nombre
                </label>
                <input
                  id="ingrediente-nombre"
                  type="text"
                  value={nombreIngrediente}
                  onChange={(event) => setNombreIngrediente(event.target.value)}
                  placeholder="Ej. Queso de cabra"
                  className={`mt-1 ${claseInput}`}
                />
              </div>

              <div>
                <label htmlFor="ingrediente-precio" className={claseEtiqueta}>
                  Precio extra{' '}
                  <span className="font-semibold normal-case text-stone-400">(opcional)</span>
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-stone-400">
                    $
                  </span>
                  <input
                    id="ingrediente-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={precioExtra}
                    onChange={(event) => setPrecioExtra(event.target.value)}
                    placeholder="0.00"
                    className={`${claseInput} pl-7 font-mono`}
                  />
                </div>
              </div>

              {errorFormulario && (
                <p className="flex items-start gap-1.5 text-xs font-bold text-red-600" role="alert">
                  <IconoAlerta className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {errorFormulario}
                </p>
              )}

              <button
                type="submit"
                disabled={creando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              >
                {creando ? <Spinner className="h-4 w-4" /> : <IconoAgregar className="h-4 w-4" />}
                Agregar ingrediente
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-stone-900">
              {pestana === 'producto' ? 'Productos registrados' : 'Ingredientes registrados'}
            </h3>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-extrabold text-stone-500">
              {pestana === 'producto' ? productos.length : ingredientes.length}
            </span>
          </div>

          {errorEliminar && (
            <p className="mb-2 flex items-start gap-1.5 text-xs font-bold text-red-600" role="alert">
              <IconoAlerta className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {errorEliminar}
            </p>
          )}

          <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {pestana === 'producto' && productos.length === 0 && (
              <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-6 text-center text-xs font-semibold text-stone-400">
                Todavía no hay productos registrados.
              </p>
            )}

            {pestana === 'ingrediente' && ingredientes.length === 0 && (
              <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-6 text-center text-xs font-semibold text-stone-400">
                Todavía no hay ingredientes registrados.
              </p>
            )}

            {pestana === 'producto'
              ? productos.map((producto) => {
                  const confirmando =
                    objetivo?.tipo === 'producto' && objetivo.id === producto.id

                  return (
                    <div
                      key={producto.id}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-stone-500">
                        <IconoProducto className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-stone-900">
                          {producto.nombre}
                        </p>
                        <p className="text-[10px] font-semibold text-stone-400">
                          {producto.tipo === 'pizza' ? 'Pizza' : 'Bebida'} ·{' '}
                          <span className="font-mono font-bold text-stone-600">
                            {formatoMoneda.format(producto.precio)}
                          </span>
                        </p>
                      </div>
                      {confirmando ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={confirmarEliminacion}
                            disabled={eliminando}
                            className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60 motion-reduce:transition-none"
                          >
                            {eliminando ? <Spinner className="h-3 w-3" /> : 'Eliminar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setObjetivo(null)}
                            disabled={eliminando}
                            title="Cancelar"
                            aria-label="Cancelar eliminación"
                            className="rounded-lg border border-stone-200 bg-stone-50 p-1 text-stone-500 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60 motion-reduce:transition-none"
                          >
                            <IconoVolver className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorEliminar(null)
                            setObjetivo({
                              tipo: 'producto',
                              id: producto.id,
                              nombre: producto.nombre,
                            })
                          }}
                          title={`Eliminar ${producto.nombre}`}
                          aria-label={`Eliminar ${producto.nombre}`}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
                        >
                          <IconoEliminar className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })
              : ingredientes.map((ingrediente) => {
                  const confirmando =
                    objetivo?.tipo === 'ingrediente' && objetivo.id === ingrediente.id

                  return (
                    <div
                      key={ingrediente.id}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-brand-gold">
                        <IconoIngrediente className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-stone-900">
                          {ingrediente.nombre}
                        </p>
                        <p className="font-mono text-[10px] font-bold text-stone-400">
                          {formatoMoneda.format(ingrediente.precio_extra)} extra
                        </p>
                      </div>
                      {confirmando ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={confirmarEliminacion}
                            disabled={eliminando}
                            className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60 motion-reduce:transition-none"
                          >
                            {eliminando ? <Spinner className="h-3 w-3" /> : 'Eliminar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setObjetivo(null)}
                            disabled={eliminando}
                            title="Cancelar"
                            aria-label="Cancelar eliminación"
                            className="rounded-lg border border-stone-200 bg-stone-50 p-1 text-stone-500 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60 motion-reduce:transition-none"
                          >
                            <IconoVolver className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorEliminar(null)
                            setObjetivo({
                              tipo: 'ingrediente',
                              id: ingrediente.id,
                              nombre: ingrediente.nombre,
                            })
                          }}
                          title={`Eliminar ${ingrediente.nombre}`}
                          aria-label={`Eliminar ${ingrediente.nombre}`}
                          className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
                        >
                          <IconoEliminar className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
          </div>

          {objetivo && (
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-900">
              ¿Confirmas eliminar <span className="font-extrabold">{objetivo.nombre}</span> del
              catálogo? Esta acción lo desactiva del menú.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
