interface IngredienteBaseMock {
  id: number
  nombre: string
}

interface IngredienteExtraMock {
  id: number
  nombre: string
  precio_extra: number
}

interface ProductoMock {
  id: number
  nombre: string
  descripcion: string
  tipo: 'pizza' | 'bebida'
  precio: number
  imagen_url: string | null
  ingredientes_base: IngredienteBaseMock[]
}

const base = {
  sanMarzano: { id: 1, nombre: 'San Marzano' },
  fiorDiLatte: { id: 2, nombre: 'Fior di Latte' },
  albahaca: { id: 3, nombre: 'Albahaca fresca' },
  aceiteOliva: { id: 4, nombre: 'Aceite de oliva' },
  pepperoni: { id: 5, nombre: 'Pepperoni' },
  oregano: { id: 6, nombre: 'Orégano' },
  gorgonzola: { id: 7, nombre: 'Gorgonzola' },
  parmigiano: { id: 8, nombre: 'Parmigiano Reggiano' },
  fontina: { id: 9, nombre: 'Fontina' },
  champinones: { id: 10, nombre: 'Champiñones' },
  aceiteTrufa: { id: 11, nombre: 'Aceite de trufa' },
  perejil: { id: 12, nombre: 'Perejil fresco' },
  masaMadre: { id: 13, nombre: 'Masa madre' },
  romero: { id: 14, nombre: 'Romero' },
  salMarina: { id: 15, nombre: 'Sal marina' },
} satisfies Record<string, IngredienteBaseMock>

export const productos: ProductoMock[] = [
  {
    id: 1,
    nombre: 'Margherita DOP',
    descripcion:
      'San Marzano DOP, fior di latte, albahaca fresca y un hilo de aceite de oliva virgen extra. La clásica napolitana.',
    tipo: 'pizza',
    precio: 12.99,
    imagen_url: '/mock/margherita.svg',
    ingredientes_base: [base.sanMarzano, base.fiorDiLatte, base.albahaca, base.aceiteOliva],
  },
  {
    id: 2,
    nombre: 'Pepperoni Picante',
    descripcion:
      'Salsa de tomate, mozzarella, pepperoni cup-and-char y orégano. Picante en su justa medida.',
    tipo: 'pizza',
    precio: 15.5,
    imagen_url: '/mock/pepperoni.svg',
    ingredientes_base: [base.sanMarzano, base.fiorDiLatte, base.pepperoni, base.oregano],
  },
  {
    id: 3,
    nombre: 'Quattro Formaggi',
    descripcion:
      'Mozzarella, gorgonzola, parmigiano reggiano y fontina sobre masa madre de 72 horas.',
    tipo: 'pizza',
    precio: 16.75,
    imagen_url: '/mock/formaggi.svg',
    ingredientes_base: [base.fiorDiLatte, base.gorgonzola, base.parmigiano, base.fontina],
  },
  {
    id: 4,
    nombre: 'Funghi e Tartufo',
    descripcion:
      'Mozzarella, champiñones cremini, aceite de trufa blanca y perejil fresco recién cortado.',
    tipo: 'pizza',
    precio: 17.25,
    imagen_url: '/mock/funghi.svg',
    ingredientes_base: [base.fiorDiLatte, base.champinones, base.aceiteTrufa, base.perejil],
  },
  {
    id: 5,
    nombre: 'Focaccia al Rosmarino',
    descripcion:
      'Focaccia de masa madre con romero, sal marina y aceite de oliva. Ideal para compartir.',
    tipo: 'pizza',
    precio: 8.5,
    imagen_url: null,
    ingredientes_base: [base.masaMadre, base.romero, base.aceiteOliva, base.salMarina],
  },
  {
    id: 6,
    nombre: 'Limonada de la Casa',
    descripcion:
      'Limón recién exprimido, agua mineral y un toque de menta. Servida bien fría.',
    tipo: 'bebida',
    precio: 3.5,
    imagen_url: '/mock/limonada.svg',
    ingredientes_base: [],
  },
  {
    id: 7,
    nombre: 'Agua Mineral',
    descripcion: 'Botella de agua mineral natural de 500 ml.',
    tipo: 'bebida',
    precio: 2,
    imagen_url: '/mock/agua.svg',
    ingredientes_base: [],
  },
  {
    id: 8,
    nombre: 'Birra Artesanal',
    descripcion: 'Lager artesanal de la casa, 355 ml. Notas cítricas y final seco.',
    tipo: 'bebida',
    precio: 4.5,
    imagen_url: '/mock/birra.svg',
    ingredientes_base: [],
  },
]

export const ingredientesExtra: IngredienteExtraMock[] = [
  { id: 101, nombre: 'Pepperoni extra', precio_extra: 2.5 },
  { id: 102, nombre: 'Burrata', precio_extra: 3.5 },
  { id: 103, nombre: 'Champiñones', precio_extra: 1.75 },
  { id: 104, nombre: 'Miel picante', precio_extra: 1.99 },
  { id: 105, nombre: 'Aceite de trufa', precio_extra: 2.5 },
  { id: 106, nombre: 'Aceitunas negras', precio_extra: 1.5 },
  { id: 107, nombre: 'Cebolla caramelizada', precio_extra: 1.25 },
  { id: 108, nombre: 'Jalapeños', precio_extra: 1 },
]
