import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const NAV = [
  { label: 'Menú', href: '#', current: true },
  { label: 'Promociones', href: '#' },
  { label: 'Pedidos', href: '#' },
  { label: 'Ubicación', href: '#' },
]

export function Header() {
  const { items } = useCart()
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0)

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-red text-xl font-black text-white shadow-lg shadow-brand-red/30">
            F
          </span>
          <span>
            <span className="block text-base font-extrabold leading-none tracking-tight text-stone-900">
              Forno &amp; Dough
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-brand-gold">
              Menú del cliente
            </span>
          </span>
        </Link>

        <nav className="order-3 -mx-1 w-full overflow-x-auto md:order-none md:mx-0 md:ml-8 md:w-auto">
          <ul className="flex items-center gap-1 text-sm font-bold">
            {NAV.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-xl px-3 py-2 transition hover:bg-brand-red/5 hover:text-brand-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red ${
                    item.current ? 'bg-brand-red/10 text-brand-red-dark' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-stone-600 shadow-sm sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
            Abierto ahora
          </span>
          <Link
            to="/carrito"
            aria-label={`Carrito, ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`}
            className="relative inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Carrito
            {unidades > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-black text-white ring-2 ring-white">
                {unidades > 9 ? '9+' : unidades}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
