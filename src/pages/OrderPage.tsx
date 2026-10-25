import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header'

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const numero = id ?? localStorage.getItem('pedido_id') ?? '—'

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 selection:bg-brand-red selection:text-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 text-center shadow-lg shadow-brand-red-deep/5 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          </div>

          <span className="mt-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Pedido confirmado
          </span>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            Pedido #{numero} recibido
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-stone-500">
            Gracias por tu compra. Tu pedido ya está registrado y pronto comenzará a prepararse en
            el horno de leña.
          </p>

          <div className="mx-auto mt-6 flex max-w-md items-center justify-between gap-4 rounded-2xl bg-stone-900 p-5 text-left text-white shadow-lg">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Número de pedido
              </span>
              <span className="text-lg font-black">#{numero}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Estado
              </span>
              <span className="text-xs font-extrabold text-amber-400">En preparación</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] font-medium text-stone-400">
            Guardamos el identificador en este dispositivo. Si recargas la página, podrás volver a
            consultar tu pedido.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand-red-dark px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Volver al menú
          </Link>
        </div>
      </main>
    </div>
  )
}
