"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPriceListVersion, type FormState } from "../actions";

const initial: FormState = { error: null };

type SourceList = { id: string; version_code: string; effective_date: string };
type Product = { id: string; name: string };

export function VersionForm({
  sources,
  products,
}: {
  sources: SourceList[];
  products: Product[];
}) {
  const [state, action, pending] = useActionState(
    createPriceListVersion,
    initial,
  );
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(products.map((p) => p.id)),
  );

  const allOn = checked.size === products.length;
  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const setAll = (on: boolean) =>
    setChecked(on ? new Set(products.map((p) => p.id)) : new Set());

  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="source_id" className="text-sm font-medium">
            Lista base *
          </label>
          <select
            id="source_id"
            name="source_id"
            defaultValue={sources[0]?.id}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.version_code} · {s.effective_date}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="version_code" className="text-sm font-medium">
            Código nuevo *
          </label>
          <input
            id="version_code"
            name="version_code"
            required
            placeholder="26005"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="effective_date" className="text-sm font-medium">
            Vigencia *
          </label>
          <input
            id="effective_date"
            name="effective_date"
            type="date"
            required
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="cost_pct" className="text-sm font-medium">
            Aumento costo %
          </label>
          <input
            id="cost_pct"
            name="cost_pct"
            type="number"
            step="0.01"
            defaultValue={0}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="price_pct" className="text-sm font-medium">
            Aumento venta %
          </label>
          <input
            id="price_pct"
            name="price_pct"
            type="number"
            step="0.01"
            defaultValue={0}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="note" className="text-sm font-medium">
            Nota
          </label>
          <input
            id="note"
            name="note"
            placeholder="Aumento agosto"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Selección de prendas a las que aplicar el aumento */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Aplicar el aumento a…</p>
          <div className="flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="underline text-neutral-500"
            >
              todas
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="underline text-neutral-500"
            >
              ninguna
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          Las prendas sin tilde copian el precio de la lista base ({checked.size}
          /{products.length} con aumento).
        </p>
        <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2 max-h-64 overflow-y-auto">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="product_ids"
                value={p.id}
                checked={checked.has(p.id)}
                onChange={() => toggle(p.id)}
              />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Generando borrador…" : "Generar borrador"}
        </button>
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          Cancelar
        </Link>
        {!allOn && (
          <span className="text-xs text-neutral-400">
            El aumento se aplica a {checked.size} de {products.length} prendas.
          </span>
        )}
      </div>
    </form>
  );
}
