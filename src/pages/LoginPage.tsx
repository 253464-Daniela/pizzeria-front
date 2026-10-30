import { useEffect, useState, type ComponentType, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, login as loginRequest } from '../api'
import { RUTA_POR_ROL, useAuth, type Rol } from '../context/AuthContext'

interface IconoProps {
  className?: string
}

const PRESETS: {
  etiqueta: string
  usuario: string
  password: string
  rol: Rol
  Icono: ComponentType<IconoProps>
}[] = [
  {
    etiqueta: 'Chef principal',
    usuario: 'cocina',
    password: 'cocina123',
    rol: 'cocinero',
    Icono: FireIcon,
  },
  {
    etiqueta: 'Recepción',
    usuario: 'recepcion',
    password: 'recepcion123',
    rol: 'recepcionista',
    Icono: ScooterIcon,
  },
  {
    etiqueta: 'Administrador',
    usuario: 'admin',
    password: 'admin123',
    rol: 'administrador',
    Icono: ClipboardIcon,
  },
]

function Icono({ className = 'h-4 w-4', children }: IconoProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function UtensilsIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M4 3v7a3 3 0 0 0 6 0V3" />
      <path d="M7 10v11" />
      <path d="M17 3c-1.7 1.6-2.5 3.6-2.5 5.5 0 1.6.8 2.5 2.5 2.5" />
      <path d="M18.5 3v18" />
    </Icono>
  )
}

function FireIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3.5 2-4.5.3 1 .8 1.6 1.5 2C12.5 7 12 5 12 3Z" />
      <path d="M12 17v4" />
    </Icono>
  )
}

function ScooterIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M8.5 17.5h6l3-8h-3" />
      <path d="M11 9.5H7L5.5 17.5" />
    </Icono>
  )
}

function ShieldIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icono>
  )
}

function ClipboardIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </Icono>
  )
}

function UserIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icono>
  )
}

function LockIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icono>
  )
}

function EyeIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icono>
  )
}

function EyeOffIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17.6 17.6 0 0 1-3 3.6" />
      <path d="M6.3 6.9C3.7 8.6 2 12 2 12s3.5 6 10 6a9.8 9.8 0 0 0 4.2-.9" />
    </Icono>
  )
}

function LoginIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </Icono>
  )
}

function RefreshIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Icono>
  )
}

function AlertIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icono>
  )
}

function InfoIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Icono>
  )
}

function ArrowLeftIcon({ className }: IconoProps) {
  return (
    <Icono className={className}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icono>
  )
}

export default function LoginPage() {
  const { token, usuario, login } = useAuth()
  const navigate = useNavigate()

  const [usuarioInput, setUsuarioInput] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    if (!aviso) return

    const id = window.setTimeout(() => setAviso(null), 3200)
    return () => window.clearTimeout(id)
  }, [aviso])

  if (token && usuario) {
    return <Navigate to={RUTA_POR_ROL[usuario.rol]} replace />
  }

 /*  function aplicarPreset(preset: (typeof PRESETS)[number]) {
    setUsuarioInput(preset.usuario)
    setPassword(preset.password)
    setError(null)
    setAviso(`Credenciales de ${preset.etiqueta.toLowerCase()} cargadas.`)
  }
 */
  async function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const usuarioLimpio = usuarioInput.trim()

    if (!usuarioLimpio || !password) {
      setError('Ingresa tu usuario y contraseña.')
      return
    }

    setCargando(true)
    setError(null)

    try {
      const data = await loginRequest(usuarioLimpio, password)

      login(data.token, data.usuario)
      setCargando(false)
      navigate(RUTA_POR_ROL[data.usuario.rol] ?? '/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setError('Usuario o contraseña incorrectos.')
      } else {
        setError('No pudimos conectar con el servidor. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#F8F5F0] bg-[radial-gradient(circle_at_50%_30%,#FEE2E2_0%,#FFFBEB_40%,#F8F5F0_100%)] text-stone-900 selection:bg-brand-red selection:text-white">
      <header className="z-20 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-red text-xl font-black text-white shadow-lg shadow-brand-red/30">
            F
          </span>
          <span>
            <span className="block text-base font-extrabold leading-none tracking-tight text-stone-900">
              La Rodaja Voladora
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Sistema de personal
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-500 transition hover:bg-white/60 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">App de clientes</span>
          </Link>
        </div>
      </header>

      <main className="z-10 mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-8">
        <div className="w-full rounded-3xl border border-amber-900/10 bg-white/95 p-6 shadow-2xl shadow-brand-red-deep/10 backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-brand-red text-white shadow-lg shadow-brand-red/20">
              <UtensilsIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Portal de personal
            </h1>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              Autentícate para acceder a cocina, recepción y administración.
            </p>
          </div>

          <form onSubmit={manejarEnvio} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="staff-usuario"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
              >
                Usuario / ID de personal
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  id="staff-usuario"
                  name="usuario"
                  type="text"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={usuarioInput}
                  onChange={(event) => {
                    setUsuarioInput(event.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Ej. chef_marco"
                  aria-invalid={Boolean(error)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 py-3 pl-10 pr-4 text-sm font-bold text-stone-900 shadow-sm transition placeholder:font-medium placeholder:text-stone-400 focus:border-brand-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-red/10 motion-reduce:transition-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="staff-password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <LockIcon className="h-4 w-4" />
                </span>
                <input
                  id="staff-password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 py-3 pl-10 pr-11 text-sm font-bold text-stone-900 shadow-sm transition placeholder:font-medium placeholder:text-stone-400 focus:border-brand-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-red/10 motion-reduce:transition-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((valor) => !valor)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                >
                  {mostrarPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end px-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-400">
                <ShieldIcon className="h-3 w-3" />
                Sesión cifrada
              </span>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-bold text-brand-red-dark"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-red-dark py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-red-dark/25 transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none"
            >
              {cargando ? (
                <RefreshIcon className="h-4 w-4 animate-spin" />
              ) : (
                <LoginIcon className="h-4 w-4" />
              )}
              {cargando ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

         {/*  <div className="mt-6 border-t border-stone-100 pt-5">
            <span className="mb-2.5 block text-center text-[10px] font-black uppercase tracking-widest text-stone-400">
              Acceso rápido de demostración
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.usuario}
                  type="button"
                  onClick={() => aplicarPreset(preset)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-1 py-2 text-[11px] font-extrabold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
                >
                  <preset.Icono className="h-3.5 w-3.5" />
                  {preset.etiqueta}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </main>

      <footer className="z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 border-t border-stone-200/50 px-4 py-4 text-xs font-semibold text-stone-400 sm:flex-row sm:px-8">
        <div>
          <span>© 2026 La Rodaja Voladora Pizzeria</span>
          <span className="mx-2">•</span>
          <span>OS v4.12.0</span>
        </div>
        <div className="flex items-center gap-4 text-stone-500">
          <button
            type="button"
            onClick={() => setAviso('Mesa de ayuda: ext. 4099.')}
            className="transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
          >
            Soporte IT
          </button>
          <button
            type="button"
            onClick={() => setAviso('Roster del turno cargado.')}
            className="transition hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red motion-reduce:transition-none"
          >
            Turnos
          </button>
        </div>
      </footer>

      <div
        aria-live="polite"
        className={`fixed right-4 top-4 z-50 w-full max-w-xs transition-all duration-300 motion-reduce:transition-none ${
          aviso ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <InfoIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-stone-900">Aviso</h2>
            <p className="text-[11px] font-semibold text-stone-500">{aviso ?? ' '}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
