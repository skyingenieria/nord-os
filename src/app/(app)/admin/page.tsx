export default async function AdminDashboard() {
  return (
    <div className="px-6 py-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Panel de administración de nord-os.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Venta rápida", "Vender y cobrar desde el celular en el mostrador."],
          ["Pedidos", "Alta de pedidos, estados y cobranzas."],
          ["Stock", "Ingresos, ledger de movimientos y stock en tiempo real."],
          ["Listas de precio", "Versionado de costos y precios (precio histórico)."],
          ["Proveedores", "Consignación y liquidaciones (Nora, Susana)."],
          ["Caja / Gastos", "Flujo de caja y gastos por rubro."],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <div className="font-medium">{title}</div>
            <p className="text-sm text-neutral-500 mt-1">{desc}</p>
            <span className="inline-block mt-3 text-[10px] uppercase tracking-wide text-neutral-400">
              próximamente
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
