"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createSale, type FormState } from "../actions";

const initial: FormState = { error: null };
const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

type Variant = { id: string; sku: string; name: string; code: string; price: number };
type Customer = { id: string; name: string };
type Line = { variantId: string; qty: number };

export function SaleForm({
  variants,
  customers,
}: {
  variants: Variant[];
  customers: Customer[];
}) {
  const [state, action, pending] = useActionState(createSale, initial);
  const [lines, setLines] = useState<Line[]>([]);
  const [pick, setPick] = useState("");
  const [qty, setQty] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);

  const vmap = useMemo(() => new Map(variants.map((v) => [v.id, v])), [variants]);

  const addLine = () => {
    if (!pick || qty <= 0) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === pick);
      if (existing)
        return prev.map((l) =>
          l.variantId === pick ? { ...l, qty: l.qty + qty } : l,
        );
      return [...prev, { variantId: pick, qty }];
    });
    setPick("");
    setQty(1);
  };

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.variantId !== id));

  const subtotal = lines.reduce(
    (acc, l) => acc + (vmap.get(l.variantId)?.price ?? 0) * l.qty,
    0,
  );
  const total = subtotal + Number(shipping || 0) - Number(discount || 0);

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      {/* Cliente */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <p className="text-sm font-medium">Cliente</p>
        <select
          name="customer_id"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">— Cliente nuevo / sin cliente —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {customerId === "" && (
          <div className="grid grid-cols-2 gap-3">
            <input
              name="new_customer_name"
              placeholder="Nombre (opcional)"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <input
              name="new_customer_phone"
              placeholder="Teléfono"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      {/* Ítems */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <p className="text-sm font-medium">Prendas</p>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="flex-1 min-w-48 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Elegí prenda/talle…</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · T{v.code} · {money(v.price)}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm"
          >
            Agregar
          </button>
        </div>

        {lines.length > 0 && (
          <table className="w-full text-sm">
            <tbody>
              {lines.map((l) => {
                const v = vmap.get(l.variantId);
                return (
                  <tr
                    key={l.variantId}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-1.5">
                      {v?.name} · T{v?.code}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-neutral-500">
                      {l.qty} × {money(v?.price ?? 0)}
                    </td>
                    <td className="py-1.5 text-right tabular-nums w-24">
                      {money((v?.price ?? 0) * l.qty)}
                    </td>
                    <td className="py-1.5 text-right w-10">
                      <button
                        type="button"
                        onClick={() => removeLine(l.variantId)}
                        className="text-neutral-400 hover:text-red-600 text-xs"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Ajustes + totales */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">
            Envío ($)
          </label>
          <input
            name="shipping_charge"
            type="number"
            min={0}
            value={shipping}
            onChange={(e) => setShipping(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-neutral-500">
            Descuento ($)
          </label>
          <input
            name="discount"
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="text-sm space-y-1 max-w-xs">
        <div className="flex justify-between text-neutral-500">
          <span>Subtotal</span>
          <span className="tabular-nums">{money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Envío</span>
          <span className="tabular-nums">{money(Number(shipping || 0))}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Descuento</span>
          <span className="tabular-nums">−{money(Number(discount || 0))}</span>
        </div>
        <div className="flex justify-between font-semibold text-base border-t border-neutral-200 dark:border-neutral-800 pt-1">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || lines.length === 0}
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Registrando…" : "Registrar venta"}
        </button>
        <Link href="/admin/ventas" className="text-sm text-neutral-500">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
