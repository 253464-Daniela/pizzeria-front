import type { IncomingMessage, ServerResponse } from 'node:http'
import { ingredientesExtra, productos } from './data.ts'

type EstadoPedido = 'pendiente' | 'listo' | 'entregado'

interface ItemEstadoMock {
  nombre: string
  cantidad: number
  estado_cocina: 'pendiente' | 'lista'
}

interface PedidoMock {
  id: number
  nombre_cliente: string
  total: number
  items: ItemEstadoMock[]
  creadoEn: number
  fechaListo: number | null
  fechaEntrega: number | null
}

interface UsuarioStaffMock {
  id: number
  nombre: string
  rol: 'administrador' | 'recepcionista' | 'cocinero'
  usuario: string
  password: string
}

interface IngredienteColaMock {
  id: number
  nombre: string
  accion?: 'quitado' | 'agregado'
}

interface ItemColaMock {
  item_id: number
  pedido_id: number
  nombre_cliente: string
  pizza: string
  fecha_creacion: string
  ingredientes: IngredienteColaMock[]
}

interface HistorialPrecioMock {
  id: number
  tipo: 'producto' | 'ingrediente'
  id_referencia: number
  nombre: string
  precio_anterior: number
  precio_nuevo: number
  fecha_cambio: string
}

const pedidos = new Map<number, PedidoMock>()

let siguienteItemId = 900

const colaCocina: ItemColaMock[] = [
  {
    item_id: 101,
    pedido_id: 8944,
    nombre_cliente: 'Chef Luigi (Staff)',
    pizza: 'Quattro Formaggi',
    fecha_creacion: new Date(Date.now() - 18 * 60_000).toISOString(),
    ingredientes: [
      { id: 7, nombre: 'Gorgonzola' },
      { id: 8, nombre: 'Parmigiano Reggiano' },
      { id: 9, nombre: 'Fontina', accion: 'quitado' },
    ],
  },
  {
    item_id: 102,
    pedido_id: 8942,
    nombre_cliente: 'Marcus Vance',
    pizza: 'Margherita DOP',
    fecha_creacion: new Date(Date.now() - 16 * 60_000).toISOString(),
    ingredientes: [
      { id: 1, nombre: 'San Marzano' },
      { id: 2, nombre: 'Fior di Latte' },
      { id: 3, nombre: 'Albahaca fresca', accion: 'quitado' },
      { id: 101, nombre: 'Burrata', accion: 'agregado' },
    ],
  },
  {
    item_id: 103,
    pedido_id: 8942,
    nombre_cliente: 'Marcus Vance',
    pizza: 'Pepperoni Picante',
    fecha_creacion: new Date(Date.now() - 16 * 60_000).toISOString(),
    ingredientes: [
      { id: 1, nombre: 'San Marzano' },
      { id: 5, nombre: 'Pepperoni' },
      { id: 104, nombre: 'Miel picante', accion: 'agregado' },
    ],
  },
  {
    item_id: 104,
    pedido_id: 8943,
    nombre_cliente: 'Sarah Jenkins',
    pizza: 'Funghi e Tartufo',
    fecha_creacion: new Date(Date.now() - 12 * 60_000).toISOString(),
    ingredientes: [
      { id: 2, nombre: 'Fior di Latte' },
      { id: 10, nombre: 'Champiñones' },
      { id: 12, nombre: 'Perejil fresco', accion: 'quitado' },
      { id: 11, nombre: 'Aceite de trufa', accion: 'agregado' },
    ],
  },
  {
    item_id: 105,
    pedido_id: 8945,
    nombre_cliente: 'Elena Rostova',
    pizza: 'Margherita DOP',
    fecha_creacion: new Date(Date.now() - 5 * 60_000).toISOString(),
    ingredientes: [
      { id: 1, nombre: 'San Marzano' },
      { id: 2, nombre: 'Fior di Latte' },
      { id: 3, nombre: 'Albahaca fresca' },
      { id: 4, nombre: 'Aceite de oliva' },
    ],
  },
]

function minutosAtras(minutos: number) {
  return Date.now() - minutos * 60_000
}

const pedidosDemoRecepcion: PedidoMock[] = [
  {
    id: 8001,
    nombre_cliente: 'Marcus Vance',
    total: 58.8,
    items: [
      { nombre: 'Margherita DOP', cantidad: 2, estado_cocina: 'lista' },
      { nombre: 'Pepperoni Picante', cantidad: 1, estado_cocina: 'lista' },
    ],
    creadoEn: minutosAtras(38),
    fechaListo: minutosAtras(24),
    fechaEntrega: null,
  },
  {
    id: 8002,
    nombre_cliente: 'Sarah Jenkins',
    total: 33.5,
    items: [
      { nombre: 'Funghi e Tartufo', cantidad: 1, estado_cocina: 'lista' },
      { nombre: 'Focaccia al Rosmarino', cantidad: 1, estado_cocina: 'lista' },
    ],
    creadoEn: minutosAtras(31),
    fechaListo: minutosAtras(18),
    fechaEntrega: null,
  },
  {
    id: 8003,
    nombre_cliente: 'Elena Rostova',
    total: 21,
    items: [{ nombre: 'Quattro Formaggi', cantidad: 1, estado_cocina: 'lista' }],
    creadoEn: minutosAtras(20),
    fechaListo: minutosAtras(6),
    fechaEntrega: null,
  },
  {
    id: 8004,
    nombre_cliente: 'David Kim',
    total: 40,
    items: [
      { nombre: 'Pepperoni Picante', cantidad: 1, estado_cocina: 'lista' },
      { nombre: 'Limonada de la Casa', cantidad: 2, estado_cocina: 'lista' },
    ],
    creadoEn: minutosAtras(50),
    fechaListo: minutosAtras(32),
    fechaEntrega: minutosAtras(16),
  },
  {
    id: 8005,
    nombre_cliente: 'Robert Paulson',
    total: 43.5,
    items: [{ nombre: 'Pepperoni Picante', cantidad: 2, estado_cocina: 'lista' }],
    creadoEn: minutosAtras(55),
    fechaListo: minutosAtras(37),
    fechaEntrega: minutosAtras(8),
  },
  {
    id: 8006,
    nombre_cliente: 'Jessica Alba',
    total: 31.5,
    items: [{ nombre: 'Funghi e Tartufo', cantidad: 1, estado_cocina: 'lista' }],
    creadoEn: minutosAtras(76),
    fechaListo: minutosAtras(57),
    fechaEntrega: minutosAtras(46),
  },
  {
    id: 8007,
    nombre_cliente: 'Thomas Wright',
    total: 18,
    items: [{ nombre: 'Margherita DOP', cantidad: 1, estado_cocina: 'lista' }],
    creadoEn: minutosAtras(26 * 60),
    fechaListo: minutosAtras(25 * 60),
    fechaEntrega: minutosAtras(24 * 60),
  },
]

for (const pedido of pedidosDemoRecepcion) {
  pedidos.set(pedido.id, pedido)
}

let siguienteHistorialId = 4

const historialPrecios: HistorialPrecioMock[] = [
  {
    id: 3,
    tipo: 'producto',
    id_referencia: 1,
    nombre: 'Margherita DOP',
    precio_anterior: 11.99,
    precio_nuevo: 12.99,
    fecha_cambio: new Date(minutosAtras(120)).toISOString(),
  },
  {
    id: 2,
    tipo: 'ingrediente',
    id_referencia: 102,
    nombre: 'Burrata',
    precio_anterior: 3,
    precio_nuevo: 3.5,
    fecha_cambio: new Date(minutosAtras(26 * 60)).toISOString(),
  },
  {
    id: 1,
    tipo: 'producto',
    id_referencia: 2,
    nombre: 'Pepperoni Picante',
    precio_anterior: 14.99,
    precio_nuevo: 15.5,
    fecha_cambio: new Date(minutosAtras(50 * 60)).toISOString(),
  },
]

function calcularEstadisticas() {
  const hoy = fechaLocal(Date.now())
  const pedidosDelDia = [...pedidos.values()].filter(
    (pedido) => fechaLocal(pedido.creadoEn) === hoy,
  )
  const totalVentas = pedidosDelDia.reduce((suma, pedido) => suma + pedido.total, 0)
  const unidadesPorProducto = new Map<
    number,
    { id: number; nombre: string; unidades: number }
  >()

  for (const pedido of pedidosDelDia) {
    for (const item of pedido.items) {
      const producto = productos.find((candidato) => candidato.nombre === item.nombre)
      if (!producto) continue

      const acumulado = unidadesPorProducto.get(producto.id) ?? {
        id: producto.id,
        nombre: producto.nombre,
        unidades: 0,
      }
      acumulado.unidades += item.cantidad
      unidadesPorProducto.set(producto.id, acumulado)
    }
  }

  const productoMasVendido =
    [...unidadesPorProducto.values()].sort((a, b) => b.unidades - a.unidades)[0] ?? null

  return {
    num_pedidos: pedidosDelDia.length,
    total_ventas: Number(totalVentas.toFixed(2)),
    producto_mas_vendido: productoMasVendido,
  }
}

const usuariosStaff: UsuarioStaffMock[] = [
  {
    id: 1,
    nombre: 'Marco Rossi',
    rol: 'cocinero',
    usuario: 'cocinero',
    password: 'cocinero123',
  },
  {
    id: 2,
    nombre: 'Sam Rivera',
    rol: 'recepcionista',
    usuario: 'recepcionista',
    password: 'recepcionista123',
  },
  {
    id: 3,
    nombre: 'Luigi Bianchi',
    rol: 'administrador',
    usuario: 'admin',
    password: 'admin123',
  },
]

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function estaAutorizado(req: IncomingMessage) {
  const auth = req.headers.authorization
  return typeof auth === 'string' && auth.startsWith('Bearer ')
}

function fechaLocal(ms: number) {
  const fecha = new Date(ms)
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function estadoPedidoMock(pedido: PedidoMock): 'listo' | 'entregado' {
  return pedido.fechaEntrega ? 'entregado' : 'listo'
}

export function handler(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const { pathname, searchParams } = new URL(req.url ?? '/', 'http://localhost')

  if (pathname === '/api/productos' || pathname === '/api/menu') {
    sendJson(res, 200, productos)
    return
  }

  if (pathname === '/api/ingredientes') {
    sendJson(res, 200, ingredientesExtra)
    return
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let payload: { usuario?: unknown; password?: unknown }

      try {
        payload = JSON.parse(body)
      } catch {
        sendJson(res, 400, {
          error: {
            codigo: 'JSON_INVALIDO',
            mensaje: 'El cuerpo de la solicitud no es válido.',
          },
        })
        return
      }

      if (
        typeof payload.usuario !== 'string' ||
        !payload.usuario.trim() ||
        typeof payload.password !== 'string' ||
        !payload.password
      ) {
        sendJson(res, 400, {
          error: {
            codigo: 'CREDENCIALES_REQUERIDAS',
            mensaje: 'Usuario y contraseña son obligatorios.',
          },
        })
        return
      }

      const usuario = payload.usuario.trim()
      const password = payload.password

      const staff = usuariosStaff.find(
        (candidato) => candidato.usuario === usuario && candidato.password === password,
      )

      if (!staff) {
        sendJson(res, 401, {
          error: {
            codigo: 'CREDENCIALES_INVALIDAS',
            mensaje: 'Usuario o contraseña incorrectos.',
          },
        })
        return
      }

      sendJson(res, 200, {
        token: `demo-token-${staff.id}-${Date.now()}`,
        usuario: { id: staff.id, nombre: staff.nombre, rol: staff.rol },
      })
    })

    return
  }

  if (pathname === '/api/admin/estadisticas' && req.method === 'GET') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    sendJson(res, 200, calcularEstadisticas())
    return
  }

  if (pathname === '/api/admin/historial-precios' && req.method === 'GET') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    sendJson(res, 200, historialPrecios.slice(0, 50))
    return
  }

  if (pathname === '/api/pedidos' && req.method === 'GET') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    const fecha = searchParams.get('fecha') ?? ''
    const estadoFiltro = searchParams.get('estado') ?? 'listo,entregado'

    const fechaParseada = new Date(`${fecha}T12:00:00`)
    const fechaValida =
      /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
      !Number.isNaN(fechaParseada.getTime()) &&
      fechaLocal(fechaParseada.getTime()) === fecha

    if (!fechaValida) {
      sendJson(res, 400, {
        error: { codigo: 'FECHA_INVALIDA', mensaje: 'La fecha debe tener el formato YYYY-MM-DD.' },
      })
      return
    }

    const estados = estadoFiltro
      .split(',')
      .map((valor) => valor.trim())
      .filter(Boolean)

    if (!estados.length || estados.some((valor) => valor !== 'listo' && valor !== 'entregado')) {
      sendJson(res, 400, {
        error: {
          codigo: 'ESTADO_INVALIDO',
          mensaje: 'El estado debe ser listo, entregado o listo,entregado.',
        },
      })
      return
    }

    const resultado = [...pedidos.values()]
      .filter((pedido) => pedido.fechaListo !== null && fechaLocal(pedido.fechaListo) === fecha)
      .filter((pedido) => estados.includes(estadoPedidoMock(pedido)))
      .sort((a, b) => {
        const aEntregado = Boolean(a.fechaEntrega)
        const bEntregado = Boolean(b.fechaEntrega)

        if (aEntregado !== bEntregado) return aEntregado ? 1 : -1
        if (aEntregado) return (b.fechaEntrega ?? 0) - (a.fechaEntrega ?? 0)
        return (a.fechaListo ?? a.creadoEn) - (b.fechaListo ?? b.creadoEn)
      })
      .map((pedido) => ({
        id: pedido.id,
        nombre_cliente: pedido.nombre_cliente,
        estado: estadoPedidoMock(pedido),
        total: pedido.total,
        fecha_creacion: new Date(pedido.creadoEn).toISOString(),
        fecha_listo: new Date(pedido.fechaListo ?? pedido.creadoEn).toISOString(),
        fecha_entrega: pedido.fechaEntrega ? new Date(pedido.fechaEntrega).toISOString() : null,
        items: pedido.items.map((item) => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
        })),
      }))

    sendJson(res, 200, resultado)
    return
  }

  if (pathname === '/api/pedidos' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let payload: { nombre_cliente?: unknown; items?: unknown }

      try {
        payload = JSON.parse(body)
      } catch {
        sendJson(res, 400, {
          error: {
            codigo: 'JSON_INVALIDO',
            mensaje: 'El cuerpo del pedido no es válido.',
          },
        })
        return
      }

      if (typeof payload.nombre_cliente !== 'string' || !payload.nombre_cliente.trim()) {
        sendJson(res, 422, {
          error: {
            codigo: 'NOMBRE_REQUERIDO',
            mensaje: 'El nombre del cliente es obligatorio.',
          },
        })
        return
      }

      if (!Array.isArray(payload.items) || payload.items.length === 0) {
        sendJson(res, 422, {
          error: {
            codigo: 'SIN_ITEMS',
            mensaje: 'El pedido debe incluir al menos un producto.',
          },
        })
        return
      }

      let id = Math.floor(Math.random() * 9000) + 1000
      while (pedidos.has(id)) {
        id = Math.floor(Math.random() * 9000) + 1000
      }

      const nombreCliente = payload.nombre_cliente.trim()
      const itemsEstado: ItemEstadoMock[] = []
      let total = 0

      for (const raw of payload.items) {
        if (typeof raw !== 'object' || raw === null) continue

        const item = raw as {
          producto_id?: unknown
          cantidad?: unknown
          ingredientes_quitar?: unknown
          ingredientes_agregar?: unknown
        }

        const producto = productos.find((p) => p.id === Number(item.producto_id))
        if (!producto) continue

        const cantidad = Math.max(1, Math.trunc(Number(item.cantidad)) || 1)
        const quitar = Array.isArray(item.ingredientes_quitar)
          ? item.ingredientes_quitar.map(Number)
          : []
        const agregar = Array.isArray(item.ingredientes_agregar)
          ? item.ingredientes_agregar.map(Number)
          : []
        const extras = agregar.reduce((suma, idExtra) => {
          const extra = ingredientesExtra.find((e) => e.id === idExtra)
          return suma + (extra?.precio_extra ?? 0)
        }, 0)

        total += (producto.precio + extras) * cantidad
        itemsEstado.push({ nombre: producto.nombre, cantidad, estado_cocina: 'pendiente' })

        const ingredientesCola: IngredienteColaMock[] = [
          ...producto.ingredientes_base
            .filter((ingrediente) => !quitar.includes(ingrediente.id))
            .map((ingrediente) => ({ id: ingrediente.id, nombre: ingrediente.nombre })),
          ...quitar.flatMap((idBase) => {
            const ingrediente = producto.ingredientes_base.find((base) => base.id === idBase)
            return ingrediente
              ? [{ id: ingrediente.id, nombre: ingrediente.nombre, accion: 'quitado' as const }]
              : []
          }),
          ...agregar.flatMap((idExtra) => {
            const extra = ingredientesExtra.find((candidato) => candidato.id === idExtra)
            return extra
              ? [{ id: extra.id, nombre: extra.nombre, accion: 'agregado' as const }]
              : []
          }),
        ]

        colaCocina.push({
          item_id: siguienteItemId++,
          pedido_id: id,
          nombre_cliente: nombreCliente,
          pizza: producto.nombre,
          fecha_creacion: new Date().toISOString(),
          ingredientes: ingredientesCola,
        })
      }

      pedidos.set(id, {
        id,
        nombre_cliente: nombreCliente,
        total: Number(total.toFixed(2)),
        items: itemsEstado,
        creadoEn: Date.now(),
        fechaListo: null,
        fechaEntrega: null,
      })

      sendJson(res, 201, { id, estado: 'pendiente' })
    })

    return
  }

  const estadoPedido = pathname.match(/^\/api\/pedidos\/(\d+)\/estado$/)
  if (estadoPedido && req.method === 'GET') {
    const pedido = pedidos.get(Number(estadoPedido[1]))

    if (!pedido) {
      sendJson(res, 404, {
        error: {
          codigo: 'PEDIDO_NO_ENCONTRADO',
          mensaje: 'El pedido indicado no existe.',
        },
      })
      return
    }

    const transcurrido = (Date.now() - pedido.creadoEn) / 1000
    const estado: EstadoPedido = pedido.fechaEntrega
      ? 'entregado'
      : pedido.fechaListo
        ? 'listo'
        : transcurrido >= 45
          ? 'entregado'
          : transcurrido >= 28
            ? 'listo'
            : 'pendiente'

    const items = pedido.items.map((item, indice) => ({
      ...item,
      estado_cocina:
        estado !== 'pendiente' || (indice > 0 && transcurrido >= 12) ? 'lista' : 'pendiente',
    }))

    sendJson(res, 200, {
      id: pedido.id,
      nombre_cliente: pedido.nombre_cliente,
      estado,
      total: pedido.total,
      items,
    })
    return
  }

  if (pathname === '/api/cocina/cola' && req.method === 'GET') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    sendJson(res, 200, colaCocina)
    return
  }

  const itemListo = pathname.match(/^\/api\/cocina\/items\/(\d+)\/lista$/)
  if (itemListo && req.method === 'PATCH') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    const indice = colaCocina.findIndex((item) => item.item_id === Number(itemListo[1]))

    if (indice === -1) {
      sendJson(res, 404, {
        error: {
          codigo: 'ITEM_NO_ENCONTRADO',
          mensaje: 'El ítem no está en la cola de cocina.',
        },
      })
      return
    }

    const [eliminado] = colaCocina.splice(indice, 1)

    if (eliminado) {
      const pedido = pedidos.get(eliminado.pedido_id)
      const quedanItems = colaCocina.some((item) => item.pedido_id === eliminado.pedido_id)

      if (pedido && !pedido.fechaListo && !quedanItems) {
        pedido.fechaListo = Date.now()
      }
    }

    sendJson(res, 200, { ok: true })
    return
  }

  const entregarPedido = pathname.match(/^\/api\/pedidos\/(\d+)\/entregar$/)
  if (entregarPedido && req.method === 'PATCH') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    const pedido = pedidos.get(Number(entregarPedido[1]))

    if (!pedido) {
      sendJson(res, 404, {
        error: {
          codigo: 'PEDIDO_NO_ENCONTRADO',
          mensaje: 'El pedido indicado no existe.',
        },
      })
      return
    }

    if (!pedido.fechaListo) {
      sendJson(res, 409, {
        error: {
          codigo: 'PEDIDO_NO_LISTO',
          mensaje: 'El pedido todavía no está listo para entregarse.',
        },
      })
      return
    }

    if (pedido.fechaEntrega) {
      sendJson(res, 409, {
        error: {
          codigo: 'PEDIDO_YA_ENTREGADO',
          mensaje: 'El pedido ya fue marcado como entregado.',
        },
      })
      return
    }

    pedido.fechaEntrega = Date.now()

    sendJson(res, 200, {
      ok: true,
      estado: 'entregado',
      fecha_entrega: new Date(pedido.fechaEntrega).toISOString(),
    })
    return
  }

  const precioProducto = pathname.match(/^\/api\/admin\/productos\/(\d+)\/precio$/)
  if (precioProducto && req.method === 'PUT') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let payload: { precio?: unknown }

      try {
        payload = JSON.parse(body)
      } catch {
        sendJson(res, 400, {
          error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la solicitud no es válido.' },
        })
        return
      }

      if (
        typeof payload.precio !== 'number' ||
        !Number.isFinite(payload.precio) ||
        payload.precio <= 0
      ) {
        sendJson(res, 422, {
          error: {
            codigo: 'PRECIO_INVALIDO',
            mensaje: 'El precio debe ser un número mayor a 0.',
          },
        })
        return
      }

      const producto = productos.find((candidato) => candidato.id === Number(precioProducto[1]))

      if (!producto) {
        sendJson(res, 404, {
          error: {
            codigo: 'PRODUCTO_NO_ENCONTRADO',
            mensaje: 'El producto indicado no existe.',
          },
        })
        return
      }

      const precioAnterior = producto.precio
      producto.precio = Number(payload.precio.toFixed(2))

      historialPrecios.unshift({
        id: siguienteHistorialId++,
        tipo: 'producto',
        id_referencia: producto.id,
        nombre: producto.nombre,
        precio_anterior: precioAnterior,
        precio_nuevo: producto.precio,
        fecha_cambio: new Date().toISOString(),
      })

      sendJson(res, 200, {
        ok: true,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          tipo: producto.tipo,
        },
      })
    })

    return
  }

  const precioIngrediente = pathname.match(/^\/api\/admin\/ingredientes\/(\d+)\/precio$/)
  if (precioIngrediente && req.method === 'PUT') {
    if (!estaAutorizado(req)) {
      sendJson(res, 401, {
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Se requiere un token válido.' },
      })
      return
    }

    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let payload: { precio_extra?: unknown }

      try {
        payload = JSON.parse(body)
      } catch {
        sendJson(res, 400, {
          error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la solicitud no es válido.' },
        })
        return
      }

      if (
        typeof payload.precio_extra !== 'number' ||
        !Number.isFinite(payload.precio_extra) ||
        payload.precio_extra < 0
      ) {
        sendJson(res, 422, {
          error: {
            codigo: 'PRECIO_INVALIDO',
            mensaje: 'El precio extra debe ser un número mayor o igual a 0.',
          },
        })
        return
      }

      const ingrediente = ingredientesExtra.find(
        (candidato) => candidato.id === Number(precioIngrediente[1]),
      )

      if (!ingrediente) {
        sendJson(res, 404, {
          error: {
            codigo: 'INGREDIENTE_NO_ENCONTRADO',
            mensaje: 'El ingrediente indicado no existe.',
          },
        })
        return
      }

      const precioAnterior = ingrediente.precio_extra
      ingrediente.precio_extra = Number(payload.precio_extra.toFixed(2))

      historialPrecios.unshift({
        id: siguienteHistorialId++,
        tipo: 'ingrediente',
        id_referencia: ingrediente.id,
        nombre: ingrediente.nombre,
        precio_anterior: precioAnterior,
        precio_nuevo: ingrediente.precio_extra,
        fecha_cambio: new Date().toISOString(),
      })

      sendJson(res, 200, {
        ok: true,
        ingrediente: {
          id: ingrediente.id,
          nombre: ingrediente.nombre,
          precio_extra: ingrediente.precio_extra,
        },
      })
    })

    return
  }

  const detalle = pathname.match(/^\/api\/products\/(\d+)$/)
  if (detalle) {
    const producto = productos.find((item) => item.id === Number(detalle[1]))

    if (!producto) {
      sendJson(res, 404, { message: 'Producto no encontrado' })
      return
    }

    sendJson(res, 200, producto)
    return
  }

  next()
}
