export interface Estadisticas {
  num_pedidos: number
  total_ventas: number
  producto_mas_vendido: { id: number; nombre: string; unidades: number } | null
}

export interface HistorialPrecio {
  id: number
  tipo: 'producto' | 'ingrediente'
  id_referencia: number
  nombre: string
  precio_anterior: number
  precio_nuevo: number
  fecha_cambio: string
}

export interface ProductoAdmin {
  id: number
  nombre: string
  precio: number
  tipo: 'pizza' | 'bebida'
}

export interface IngredienteAdmin {
  id: number
  nombre: string
  precio_extra: number
}
