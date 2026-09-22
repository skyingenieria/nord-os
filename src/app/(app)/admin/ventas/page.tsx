import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveSchool } from "@/lib/school";

const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

const PAY_BADGE: Record<string, string> = {
  pagado: "text-emerald-600 dark:text-emerald-400",
  parcial: "text-amber-600 dark:text-amber-400",
  impago: "text-neutral-400",
};

export default async function VentasPage() {
  const school = await getActiveSchool();
  if (!school) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-neutral-500">No hay colegio activo.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: orders }, { data: balances }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, order_date, status, payment_status, customers(name)")
      .eq("school_id", school.id)
      .order("order_number", { ascending: false }),
    supabase
      .from("v_order_balance")
      .select("order_id, total, saldo")
      .eq("school_id", school.id),
  ]);

  const bmap = new Map(
    (balances ?? []).map((b) => [
      b.order_id,
      { total: Number(b.total ?? 0), saldo: Number(b.saldo ?? 0) },
    ]),
  );
  const rows = orders ?? [];

  return (
    <div className="px-6 py-8 max-w-5xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {school.name} · {rows.length} ventas
          </p>
        </div>
        <Link
          href="/admin/ventas/nueva"
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium"
        >
          Nueva venta
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-500">
            Todavía no hay ventas en {school.name}.
          </p>
          <Link href="/admin/ventas/nueva" className="inline-block mt-3 text-sm underline">
            Registrar la primera
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">#</th>
                <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                <th className="text-right font-medium px-4 py-2.5">Total</th>
                <th className="text-right font-medium px-4 py-2.5">Saldo</th>
                <th className="text-right font-medium px-4 py-2.5">Pago</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const b = bmap.get(o.id) ?? { total: 0, saldo: 0 };
                const cust = o.customers as { name: string } | null;
                return (
                  <tr
                    key={o.id}
                    className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/ventas/${o.id}`}
                        className="font-medium hover:underline"
                      >
                        {o.order_number ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500 tabular-nums">
                      {o.order_date}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">
                      {cust?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {money(b.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-neutral-500">
                      {money(b.saldo)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right text-xs ${PAY_BADGE[o.payment_status] ?? ""}`}
                    >
                      {o.payment_status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
