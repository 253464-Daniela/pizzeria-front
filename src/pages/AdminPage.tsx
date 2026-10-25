import { useEffect, useState } from 'react'
import HistorySection from '../components/admin/HistorySection'
import PriceManager from '../components/admin/PriceManager'
import StatsSection from '../components/admin/StatsSection'
import type {
  Estadisticas,
  HistorialPrecio,
  IngredienteAdmin,
  ProductoAdmin,
} from '../components/admin/types'
import {
  IconoActualizar,
  IconoAlerta,
  IconoDescargar,
  IconoSalir,
} from '../components/admin/icons'
import { useAuth } from '../context/AuthContext'

const ESTADISTICAS_VACIAS: Estadisticas = {
  num_pedidos: 0,
  total_ventas: 0,
  producto_mas_vendido: null,
}

async function obtenerJson<T>(url: string, token: string | null, signal?: AbortSignal): Promise<T> {
  const respuesta = await fetch(url, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
    signal,
    cache: 'no-store',
  })

  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)

  return (await respuesta.json()) as T
}

function fechaDeHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

export default function AdminPage() {
  const { token, usuario, logout } = useAuth()

  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [historial, setHistorial] = useState<HistorialPrecio[]>([])
  const [productos, setProductos] = useState<ProductoAdmin[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteAdmin[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function cargarPanel() {
      try {
        const [stats, hist, prods, ings] = await Promise.all([
          obtenerJson<Estadisticas>('/api/admin/estadisticas', token, controller.signal),
          obtenerJson<HistorialPrecio[]>('/api/admin/historial-precios', token, controller.signal),
          obtenerJson<ProductoAdmin[]>('/api/menu', token, controller.signal),
          obtenerJson<IngredienteAdmin[]>('/api/ingredientes', token, controller.signal),
        ])

        if (controller.signal.aborted) return

        setEstadisticas(stats)
        setHistorial(hist)
        setProductos(prods)
        setIngredientes(ings)
        setError(null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return

        setError(
          'No pudimos cargar el panel de administración. Revisa tu conexión e intenta de nuevo.',
        )
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarPanel()

    return () => controller.abort()
  }, [token, recarga])

  useEffect(() => {
    if (!aviso) return

    const id = window.setTimeout(() => setAviso(null), 3500)
    return () => window.clearTimeout(id)
  }, [aviso])

  function refrescar() {
    setCargando(true)
    setError(null)
    setErrorAccion(null)
    setRecarga((valor) => valor + 1)
  }

  async function recargarHistorial() {
    try {
      const datos = await obtenerJson<HistorialPrecio[]>('/api/admin/historial-precios', token)
      setHistorial(datos)
    } catch {
      setErrorAccion('El precio se actualizó, pero no pudimos refrescar el historial.')
    }
  }

  async function actualizarProducto(id: number, precio: number): Promise<string | null> {
    const nombre = productos.find((producto) => producto.id === id)?.nombre ?? 'producto'
    setErrorAccion(null)

    try {
      const respuesta = await fetch(`/api/admin/productos/${id}/precio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ precio }),
      })

      if (respuesta.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
      if (respuesta.status === 422) return 'El precio debe ser mayor a 0.'
      if (respuesta.status === 404) return 'El producto ya no existe.'
      if (!respuesta.ok) return 'No pudimos actualizar el precio. Intenta de nuevo.'

      setProductos((previos) =>
        previos.map((producto) =>
          producto.id === id ? { ...producto, precio: Number(precio.toFixed(2)) } : producto,
        ),
      )
      setAviso(`Precio de ${nombre} actualizado a $${precio.toFixed(2)}.`)
      await recargarHistorial()
      return null
    } catch {
      return 'No pudimos actualizar el precio. Revisa tu conexión e intenta de nuevo.'
    }
  }

  async function actualizarIngrediente(id: number, precioExtra: number): Promise<string | null> {
    const nombre =
      ingredientes.find((ingrediente) => ingrediente.id === id)?.nombre ?? 'ingrediente'
    setErrorAccion(null)

    try {
      const respuesta = await fetch(`/api/admin/ingredientes/${id}/precio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ precio_extra: precioExtra }),
      })

      if (respuesta.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
      if (respuesta.status === 422) return 'El precio extra debe ser mayor o igual a 0.'
      if (respuesta.status === 404) return 'El ingrediente ya no existe.'
      if (!respuesta.ok) return 'No pudimos actualizar el precio. Intenta de nuevo.'

      setIngredientes((previos) =>
        previos.map((ingrediente) =>
          ingrediente.id === id
            ? { ...ingrediente, precio_extra: Number(precioExtra.toFixed(2)) }
            : ingrediente,
        ),
      )
      setAviso(`Precio extra de ${nombre} actualizado a $${precioExtra.toFixed(2)}.`)
      await recargarHistorial()
      return null
    } catch {
      return 'No pudimos actualizar el precio. Revisa tu conexión e intenta de nuevo.'
    }
  }

  function exportarCSV() {
    const filas: string[][] = [
      ['Nombre', 'Tipo', 'Precio'],
      ...productos.map((producto) => [
        producto.nombre,
        producto.tipo,
        producto.precio.toFixed(2),
      ]),
      [],
      ['Ingrediente', 'Precio extra'],
      ...ingredientes.map((ingrediente) => [
        ingrediente.nombre,
        ingrediente.precio_extra.toFixed(2),
      ]),
    ]

    const csv = filas
      .map((fila) => fila.map((celda) => `"${celda.replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `forno-precios-${fechaDeHoy()}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
    setAviso('Matriz de precios exportada a CSV.')
  }

  const iniciales =
    usuario?.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') ?? 'A'

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-stone-900 selection:bg-brand-red selection:text-white">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-lg font-black text-white shadow-md shadow-brand-red/20">
              F
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-stone-900">
                  Forno &amp; Dough
                </span>
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Admin Console
                </span>
              </div>
              <span className="mt-0.5 block text-xs font-semibold text-stone-500">
                Tienda #102 · Menú y precios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refrescar}
              disabled={cargando}
              title="Actualizar datos"
              aria-label="Actualizar datos"
              className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              <IconoActualizar className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={exportarCSV}
              disabled={cargando || productos.length === 0}
              className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:cursor-not-allowed disabled:opacity-60 sm:flex motion-reduce:transition-none"
            >
              <IconoDescargar className="h-4 w-4 text-stone-500" />
              Exportar CSV
            </button>

            <div className="mx-1 hidden h-6 w-px bg-stone-200 sm:block" aria-hidden="true" />

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs font-black text-brand-gold">
                {iniciales}
              </div>
              <div className="hidden text-left sm:block">
                <span className="block text-xs font-extrabold leading-none text-stone-900">
                  {usuario?.nombre ?? 'Administración'}
                </span>
                <span className="text-[11px] font-semibold text-stone-500">Administrador</span>
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

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 lg:px-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
            Operación de la tienda
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            Revisa el desempeño del día y mantén la carta actualizada.
          </p>
        </div>

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
              onClick={refrescar}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-extrabold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </div>
        )}

        {errorAccion && (
          <div
            role="alert"
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900"
          >
            <div className="flex items-start gap-2">
              <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorAccion}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorAccion(null)}
              className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 motion-reduce:transition-none"
            >
              Cerrar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="space-y-6" aria-busy="true">
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((indice) => (
                <div
                  key={indice}
                  className="animate-pulse rounded-2xl border border-stone-200/80 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-stone-200" />
                      <div className="h-8 w-36 rounded bg-stone-200" />
                      <div className="h-3 w-28 rounded bg-stone-100" />
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-stone-200" />
                  </div>
                  <div className="mt-5 h-6 w-32 rounded-full bg-stone-100" />
                </div>
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-2xl border border-stone-200/80 bg-white" />
            <div className="h-64 animate-pulse rounded-2xl border border-stone-200/80 bg-white" />
          </div>
        ) : error ? null : (
          <>
            <StatsSection estadisticas={estadisticas ?? ESTADISTICAS_VACIAS} />
            <PriceManager
              productos={productos}
              ingredientes={ingredientes}
              onActualizarProducto={actualizarProducto}
              onActualizarIngrediente={actualizarIngrediente}
            />
            <HistorySection historial={historial} />
            <p className="text-center text-[11px] font-semibold text-stone-400">
              Los cambios de precio se registran automáticamente en el historial.
            </p>
          </>
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
                <path d="m4.5 12.5 5 5L20 6.5" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-extrabold text-stone-900">Cambios guardados</p>
              <p className="text-[11px] font-semibold text-stone-500">{aviso}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
