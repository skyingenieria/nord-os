import Link from "next/link";

// Vista mobile ultra-liviana: venta rápida + cobro. Placeholder de la etapa 4.
export default function RapidoPage() {
  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            nord-os
          </p>
          <h1 className="text-xl font-semibold">Venta rápida</h1>
        </div>
        <Link
          href="/admin"
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Admin
        </Link>
      </header>

      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center">
        <p className="text-sm text-neutral-500">
          Acá va el flujo de venta rápida: elegir prendas, cantidad, cobrar y
          listo. Optimizado para el celular y la temporada feb–mar.
        </p>
        <span className="inline-block mt-4 text-[10px] uppercase tracking-wide text-neutral-400">
          próximamente
        </span>
      </div>
    </main>
  );
}
