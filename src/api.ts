export type TipoProducto = 'pizza' | 'bebida'
export type EstadoPedido = 'pendiente' | 'listo' | 'entregado'
export type EstadoCocina = 'pendiente' | 'lista'
export type Rol = 'administrador' | 'recepcionista' | 'cocinero'
export type TipoReferencia = 'producto' | 'ingrediente'

export interface IdNombre {
  id: number
  nombre: string
}

export interface IdNombreExtra extends IdNombre {
  precio_extra: number
}

export interface ProductoMenu {
  id: number
  nombre: string
  descripcion: string | null
  tipo: TipoProducto
  precio: number
  imagen_url: string | null
}

export interface ProductoDetalle extends ProductoMenu {
  ingredientes_base: IdNombre[]
}

export interface UsuarioLogin {
  id: number
  nombre: string
  rol: Rol
}

export interface LoginOut {
  token: string
  expira_en: number
  usuario: UsuarioLogin
}

export interface ItemIn {
  producto_id: number
  cantidad: number
  ingredientes_quitar: number[]
  ingredientes_agregar: number[]
}

export interface PedidoIn {
  nombre_cliente: string
  items: ItemIn[]
}

export interface ItemCreado {
  item_id: number
  producto_id: number
  nombre: string
  cantidad: number
  precio_unitario: number
  ingredientes_quitados: IdNombre[]
  ingredientes_agregados: IdNombreExtra[]
}

export interface PedidoCreado {
  id: number
  nombre_cliente: string
  estado: EstadoPedido
  total: number
  fecha_creacion: string
  items: ItemCreado[]
}

export interface ItemResumen {
  nombre: string
  cantidad: number
}

export interface PedidoListado {
  id: number
  nombre_cliente: string
  estado: EstadoPedido
  total: number
  fecha_creacion: string
  fecha_listo: string | null
  fecha_entrega: string | null
  items: ItemResumen[]
}

export interface ItemEstado {
  nombre: string
  cantidad: number
  estado_cocina: EstadoCocina
}

export interface PedidoEstadoOut {
  id: number
  nombre_cliente: string
  estado: EstadoPedido
  total: number
  items: ItemEstado[]
}

export interface EntregaOut {
  id: number
  estado: EstadoPedido
  fecha_entrega: string
}

export interface ItemCola {
  item_id: number
  pedido_id: number
  nombre_cliente: string
  pizza: string
  fecha_creacion: string
  ingredientes: IdNombre[]
  quitados: IdNombre[]
  agregados: IdNombre[]
}

export interface ItemListaOut {
  item_id: number
  estado_cocina: EstadoCocina
  pedido_id: number
  pedido_estado: EstadoPedido
}

export interface ProductoIn {
  nombre: string
  descripcion?: string | null
  tipo?: TipoProducto
  precio: number
  imagen_url?: string | null
  ingredientes_base?: number[]
}

export interface IngredienteIn {
  nombre: string
  precio_extra?: number
}

export interface EliminadoOut {
  id: number
  nombre: string
  activo: boolean
}

export interface CambioPrecioOut {
  id: number
  nombre: string
  precio_anterior: number
  precio_nuevo: number
}

export interface CambioHistorial {
  id: number
  tipo: TipoReferencia
  referencia_id: number
  nombre: string | null
  precio_anterior: number
  precio_nuevo: number
  usuario: string
  fecha: string
}

export interface VentasDia {
  num_pedidos: number
  total_ventas: number
}

export interface ProductoMasVendido {
  id: number
  nombre: string
  unidades: number
}

export interface EstadisticasOut {
  fecha: string
  ventas_dia: VentasDia
  producto_mas_vendido: ProductoMasVendido | null
}

interface MenuOut {
  productos: ProductoMenu[]
}

interface IngredientesOut {
  ingredientes: IdNombreExtra[]
}

interface PedidosOut {
  pedidos: PedidoListado[]
}

interface ColaOut {
  cola: ItemCola[]
}

interface HistorialOut {
  cambios: CambioHistorial[]
}

interface ErrorBody {
  error?: { codigo?: string; mensaje?: string }
  detail?: { msg?: string }[] | string
}

const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://pizeria.onrender.com').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  status: number
  codigo?: string

  constructor(status: number, message: string, codigo?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  token?: string | null
  body?: unknown
  signal?: AbortSignal
}

function mensajeDeError(status: number, body: ErrorBody | null) {
  if (body?.error?.mensaje) return body.error.mensaje
  if (Array.isArray(body?.detail) && body.detail[0]?.msg) return body.detail[0].msg
  if (typeof body?.detail === 'string') return body.detail
  return `Error ${status}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body, signal } = options
  const headers: Record<string, string> = {}

  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const respuesta = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    cache: 'no-store',
  })

  if (!respuesta.ok) {
    const data = (await respuesta.json().catch(() => null)) as ErrorBody | null
    throw new ApiError(
      respuesta.status,
      mensajeDeError(respuesta.status, data),
      data?.error?.codigo,
    )
  }

  if (respuesta.status === 204) return undefined as T

  return (await respuesta.json()) as T
}

export async function login(usuario: string, password: string): Promise<LoginOut> {
  return request<LoginOut>('/auth/login', {
    method: 'POST',
    body: { usuario, password },
  })
}

export async function getMenu(tipo?: TipoProducto, signal?: AbortSignal): Promise<ProductoMenu[]> {
  const query = tipo ? `?tipo=${tipo}` : ''
  const data = await request<MenuOut>(`/menu${query}`, { signal })
  return data.productos
}

export async function getProducto(id: number, signal?: AbortSignal): Promise<ProductoDetalle> {
  return request<ProductoDetalle>(`/productos/${id}`, { signal })
}

export async function getIngredientes(signal?: AbortSignal): Promise<IdNombreExtra[]> {
  const data = await request<IngredientesOut>('/ingredientes', { signal })
  return data.ingredientes
}

export async function crearPedido(payload: PedidoIn): Promise<PedidoCreado> {
  return request<PedidoCreado>('/pedidos', { method: 'POST', body: payload })
}

export async function getPedidos(
  filtros: { fecha?: string; estado?: string },
  token: string | null,
  signal?: AbortSignal,
): Promise<PedidoListado[]> {
  const query = new URLSearchParams()
  if (filtros.fecha) query.set('fecha', filtros.fecha)
  if (filtros.estado) query.set('estado', filtros.estado)
  const sufijo = query.toString()

  const data = await request<PedidosOut>(`/pedidos${sufijo ? `?${sufijo}` : ''}`, {
    token,
    signal,
  })
  return data.pedidos
}

export async function getPedidoEstado(
  id: number,
  signal?: AbortSignal,
): Promise<PedidoEstadoOut> {
  return request<PedidoEstadoOut>(`/pedidos/${id}/estado`, { signal })
}

export async function entregarPedido(
  id: number,
  token: string | null,
): Promise<EntregaOut> {
  return request<EntregaOut>(`/pedidos/${id}/entregar`, { method: 'PATCH', token })
}

export async function getColaCocina(
  token: string | null,
  signal?: AbortSignal,
): Promise<ItemCola[]> {
  const data = await request<ColaOut>('/cocina/cola', { token, signal })
  return data.cola
}

export async function marcarItemListo(
  itemId: number,
  token: string | null,
): Promise<ItemListaOut> {
  return request<ItemListaOut>(`/cocina/items/${itemId}/lista`, { method: 'PATCH', token })
}

export async function actualizarPrecioProducto(
  id: number,
  precio: number,
  token: string | null,
): Promise<CambioPrecioOut> {
  return request<CambioPrecioOut>(`/admin/productos/${id}/precio`, {
    method: 'PUT',
    token,
    body: { precio },
  })
}

export async function actualizarPrecioIngrediente(
  id: number,
  precioExtra: number,
  token: string | null,
): Promise<CambioPrecioOut> {
  return request<CambioPrecioOut>(`/admin/ingredientes/${id}/precio`, {
    method: 'PUT',
    token,
    body: { precio_extra: precioExtra },
  })
}

export async function crearProducto(
  payload: ProductoIn,
  token: string | null,
): Promise<ProductoDetalle> {
  return request<ProductoDetalle>('/admin/productos', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function eliminarProducto(
  id: number,
  token: string | null,
): Promise<EliminadoOut> {
  return request<EliminadoOut>(`/admin/productos/${id}`, { method: 'DELETE', token })
}

export async function crearIngrediente(
  payload: IngredienteIn,
  token: string | null,
): Promise<IdNombreExtra> {
  return request<IdNombreExtra>('/admin/ingredientes', {
    method: 'POST',
    token,
    body: payload,
  })
}

export async function eliminarIngrediente(
  id: number,
  token: string | null,
): Promise<EliminadoOut> {
  return request<EliminadoOut>(`/admin/ingredientes/${id}`, { method: 'DELETE', token })
}

export async function getHistorial(  tipo: TipoReferencia | undefined,
  token: string | null,
  signal?: AbortSignal,
): Promise<CambioHistorial[]> {
  const query = tipo ? `?tipo=${tipo}` : ''
  const data = await request<HistorialOut>(`/admin/historial-precios${query}`, { token, signal })
  return data.cambios
}

export async function getEstadisticas(
  fecha: string | undefined,
  token: string | null,
  signal?: AbortSignal,
): Promise<EstadisticasOut> {
  const query = fecha ? `?fecha=${fecha}` : ''
  return request<EstadisticasOut>(`/admin/estadisticas${query}`, { token, signal })
}
