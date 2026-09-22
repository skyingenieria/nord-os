"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPriceListVersion, type FormState } from "../actions";

const initial: FormState = { error: null };

type SourceList = { id: string; version_code: string; effective_date: string };

export function VersionForm({ sources }: { sources: SourceList[] }) {
  const [state, action, pending] = useActionState(
    createPriceListVersion,
    initial,
  );

  return (
    <form action={action} className="space-y-4 max-w-lg">
      <div className="space-y-1">
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
        <p className="text-xs text-neutral-500">
          La versión nueva copia todos los ítems de esta lista aplicando los %.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-1">
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

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Generando…" : "Generar versión"}
        </button>
        <Link href="/admin/precios" className="text-sm text-neutral-500">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
