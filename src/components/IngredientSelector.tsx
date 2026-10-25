interface IngredienteOpcion {
  id: number
  nombre: string
  precio_extra?: number
}

interface IngredientSelectorProps {
  titulo: string
  descripcion: string
  ingredientes: IngredienteOpcion[]
  seleccionados: number[]
  modo: 'quitar' | 'agregar'
  onToggle: (id: number) => void
}

function Switch({ activo }: { activo: boolean }) {
  return (
    <span className="relative inline-flex flex-shrink-0 items-center">
      <span
        className={`h-5 w-9 rounded-full transition ${activo ? 'bg-brand-red' : 'bg-stone-300'}`}
      />
      <span
        className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          activo ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </span>
  )
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

export function IngredientSelector({
  titulo,
  descripcion,
  ingredientes,
  seleccionados,
  modo,
  onToggle,
}: IngredientSelectorProps) {
  const esAgregar = modo === 'agregar'

  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg shadow-brand-red-deep/5">
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">{titulo}</h2>
        <p className="text-[11px] font-semibold text-stone-500">{descripcion}</p>
      </div>

      {ingredientes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-4 text-center text-xs font-semibold text-stone-400">
          No hay ingredientes disponibles.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ingredientes.map((ingrediente) => {
            const activo = seleccionados.includes(ingrediente.id)

            if (esAgregar) {
              return (
                <li key={ingrediente.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(ingrediente.id)}
                    aria-pressed={activo}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      activo
                        ? 'border-brand-red/60 bg-brand-red/5'
                        : 'border-stone-200 bg-stone-50/60 hover:border-brand-red/40'
                    }`}
                  >
                    <span>
                      <span className="block text-xs font-extrabold text-stone-800">
                        {ingrediente.nombre}
                      </span>
                      <span className="block text-xs font-black text-brand-red">
                        +${(ingrediente.precio_extra ?? 0).toFixed(2)}
                      </span>
                    </span>
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition ${
                        activo ? 'bg-emerald-500' : 'bg-stone-900'
                      }`}
                    >
                      {activo ? <CheckIcon /> : <PlusIcon />}
                    </span>
                  </button>
                </li>
              )
            }

            return (
              <li key={ingrediente.id}>
                <label
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                    activo
                      ? 'border-brand-red/60 bg-brand-red/5'
                      : 'border-stone-200 bg-stone-50/60 hover:border-brand-red/40'
                  }`}
                >
                  <span>
                    <span className="block text-xs font-extrabold text-stone-800">
                      {ingrediente.nombre}
                    </span>
                    <span
                      className={`block text-[10px] font-bold ${
                        activo ? 'text-brand-red' : 'text-stone-400'
                      }`}
                    >
                      {activo ? 'Se quitará' : 'Incluido'}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => onToggle(ingrediente.id)}
                    aria-label={`Quitar ${ingrediente.nombre}`}
                    className="sr-only"
                  />
                  <Switch activo={activo} />
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
