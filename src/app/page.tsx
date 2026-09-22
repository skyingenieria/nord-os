import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          nord-os
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold">
          Gestión de uniformes escolares
        </h1>
        <p className="text-neutral-500 max-w-md mx-auto text-sm">
          Plataforma multi-tenant para Su Uniformes y Nord. Elegí por dónde entrar.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-md sm:grid-cols-2">
        <Link
          href="/admin"
          className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
        >
          <div className="text-lg font-medium">Administración</div>
          <p className="text-sm text-neutral-500 mt-1">
            Pedidos, stock, precios, clientes y caja.
          </p>
        </Link>

        <Link
          href="/rapido"
          className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
        >
          <div className="text-lg font-medium">Venta rápida</div>
          <p className="text-sm text-neutral-500 mt-1">
            Vista mobile para vender y cobrar en el momento.
          </p>
        </Link>
      </div>
    </main>
  );
}
