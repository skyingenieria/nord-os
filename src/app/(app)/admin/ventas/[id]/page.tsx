import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentForm } from "./payment-form";

const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export default async function VentaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, order_date, status, payment_status, shipping_charge, discount, customers(name, phone)",
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  const [{ data: items }, { data: bal }, { data: payments }] = await Promise.all([
    supabase
      .from("order_items")
      .select("qty, unit_cost_snapshot, unit_price_snapshot, product_variants(sku, products(name), sizes(code))")
      .eq("order_id", id),
    supabase
      .from("v_order_balance")
      .select("total, pagado, saldo")
      .eq("order_id", id)
      .single(),
    supabase
      .from("payments")
      .select("id, amount, method, paid_at")
      .eq("order_id", id)
      .order("paid_at"),
  ]);

  const cust = order.customers as { name: string; phone: string | null } | null;
  const rows = (items ?? []).map((it) => {
    const v = it.product_variants as {
      sku: string | null;
      products: { name: string } | null;
      sizes: { code: string } | null;
    } | null;
    const price = Number(it.unit_price_snapshot);
    return {
      name: v?.products?.name ?? "",
      code: v?.sizes?.code ?? "",
      qty: it.qty,
      price,
      subtotal: price * it.qty,
    };
  });

  const total = Number(bal?.total ?? 0);
  const pagado = Number(bal?.pagado ?? 0);
  const saldo = Number(bal?.saldo ?? 0);

  return (
    <div className="px-6 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/ventas" className="text-sm text-neutral-500">
          ← Ventas
        </Link>
        <h1 className="text-2xl font-semibold mt-2">
          Venta #{order.order_number}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {order.order_date} · {cust?.name ?? "Sin cliente"}
          {cust?.phone ? ` · ${cust.phone}` : ""} · pago {order.payment_status}
        </p>
      </div>

      {/* Ítems */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Prenda</th>
              <th className="text-left font-medium px-4 py-2.5">Talle</th>
              <th className="text-right font-medium px-4 py-2.5">Cant.</th>
              <th className="text-right font-medium px-4 py-2.5">P. unit.</th>
              <th className="text-right font-medium px-4 py-2.5">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-t border-neutral-100 dark:border-neutral-800"
              >
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2 text-neutral-500">{r.code}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.qty}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {money(r.price)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {money(r.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="text-sm space-y-1 max-w-xs mb-8 ml-auto">
        <div className="flex justify-between text-neutral-500">
          <span>Envío</span>
          <span className="tabular-nums">{money(Number(order.shipping_charge))}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Descuento</span>
          <span className="tabular-nums">−{money(Number(order.discount))}</span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t border-neutral-200 dark:border-neutral-800 pt-1">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Pagado</span>
          <span className="tabular-nums">{money(pagado)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Saldo</span>
          <span className="tabular-nums">{money(saldo)}</span>
        </div>
      </div>

      {/* Cobros */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Cobros
        </h2>
        {payments && payments.length > 0 && (
          <ul className="text-sm mb-4 space-y-1">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between max-w-xs">
                <span className="text-neutral-500">
                  {p.paid_at} · {p.method ?? "—"}
                </span>
                <span className="tabular-nums">{money(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        )}
        {saldo > 0 ? (
          <PaymentForm orderId={order.id} />
        ) : (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Venta saldada.
          </p>
        )}
      </section>
    </div>
  );
}
