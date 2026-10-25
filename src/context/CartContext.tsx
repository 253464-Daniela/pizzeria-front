/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_base: number
  cantidad: number
  ingredientes_quitar: number[]
  ingredientes_agregar: number[]
  precio_extra_total: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; index: number }
  | { type: 'CLEAR_CART' }

interface CartContextValue {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { items: [...state.items, action.item] }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((_, index) => index !== action.index) }
    case 'CLEAR_CART':
      return { items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', item })
  }, [])

  const removeItem = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ITEM', index })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const total = useMemo(
    () =>
      state.items.reduce(
        (suma, item) => suma + (item.precio_base + item.precio_extra_total) * item.cantidad,
        0,
      ),
    [state.items],
  )

  const value = useMemo(
    () => ({ items: state.items, total, addItem, removeItem, clearCart }),
    [state.items, total, addItem, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }

  return context
}
