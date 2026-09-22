"use client";

import { useActionState } from "react";
import { registerIngreso, type FormState } from "./actions";

const initial: FormState = { error: null };

type VariantOption = { id: string; sku: string };
type SupplierOption = { id: string; name: string };

export function IngresoForm({
  variants,
  suppliers,
}: {
  variants: VariantOption[];
  suppliers: SupplierOption[];
}) {
  const [state, action, pending] = useActionState(registerIngreso, initial);

  return (
    <form
      action={action}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Registrar ingreso
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="variant_id" className="text-xs uppercase tracking-wide text-neutral-500">
            Prenda / talle (SKU)
          </label>
          <select
            id="variant_id"
            name="variant_id"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Elegí…</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.sku}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="qty" className="text-xs uppercase tracking-wide text-neutral-500">
            Cantidad
          </label>
          <input
            id="qty"
            name="qty"
            type="number"
            min="1"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="unit_cost" className="text-xs uppercase tracking-wide text-neutral-500">
            Costo unitario
          </label>
          <input
            id="unit_cost"
            name="unit_cost"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="supplier_id" className="text-xs uppercase tracking-wide text-neutral-500">
            Proveedor
          </label>
          <select
            id="supplier_id"
            name="supplier_id"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="ownership" className="text-xs uppercase tracking-wide text-neutral-500">
            Propiedad
          </label>
          <select
            id="ownership"
            name="ownership"
            defaultValue="propio"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="propio">Propio</option>
            <option value="consignacion">Consignación</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.ok && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Ingreso registrado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar ingreso"}
      </button>
    </form>
  );
}
