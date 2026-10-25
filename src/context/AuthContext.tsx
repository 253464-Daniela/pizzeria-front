/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

export type Rol = 'administrador' | 'recepcionista' | 'cocinero'

export interface Usuario {
  id: number
  nombre: string
  rol: Rol
}

interface AuthContextValue {
  token: string | null
  usuario: Usuario | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

const TOKEN_KEY = 'auth_token'
const USUARIO_KEY = 'auth_usuario'

export const RUTA_POR_ROL: Record<Rol, string> = {
  administrador: '/admin',
  recepcionista: '/recepcion',
  cocinero: '/cocina',
}

const AuthContext = createContext<AuthContextValue | null>(null)

function leerToken(): string | null {
  try {
    const guardado = localStorage.getItem(TOKEN_KEY)
    if (!guardado) return null

    const valor: unknown = JSON.parse(guardado)
    return typeof valor === 'string' && valor ? valor : null
  } catch {
    return null
  }
}

function leerUsuario(): Usuario | null {
  try {
    const guardado = localStorage.getItem(USUARIO_KEY)
    if (!guardado) return null

    const valor = JSON.parse(guardado) as Partial<Usuario> | null

    if (!valor || typeof valor.id !== 'number' || typeof valor.nombre !== 'string') {
      return null
    }

    if (
      valor.rol !== 'administrador' &&
      valor.rol !== 'recepcionista' &&
      valor.rol !== 'cocinero'
    ) {
      return null
    }

    return { id: valor.id, nombre: valor.nombre, rol: valor.rol }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(leerToken)
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuario)

  const login = useCallback((nuevoToken: string, nuevoUsuario: Usuario) => {
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)
    localStorage.setItem(TOKEN_KEY, JSON.stringify(nuevoToken))
    localStorage.setItem(USUARIO_KEY, JSON.stringify(nuevoUsuario))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({ token, usuario, login, logout }),
    [token, usuario, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }

  return contexto
}
