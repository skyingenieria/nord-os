"use client";

import { useActionState } from "react";
import { createVariant, createSize, type FormState } from "../actions";

const initial: FormState = { error: null };

type SizeOption = { id: string; code: string; label: string | null };

export function AddVariantForm({
  productId,
  availableSizes,
}: {
  productId: string;
  availableSizes: SizeOption[];
}) {
  const [state, action, pending] = useActionState(createVariant, initial);

  if (availableSizes.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No quedan talles libres para agregar. Creá un talle nuevo abajo.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="product_id" value={productId} />
      <div className="space-y-1">
        <label htmlFor="size_id" className="text-xs uppercase tracking-wide text-neutral-500">
          Talle
        </label>
        <select
          id="size_id"
          name="size_id"
          className="block rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        >
          {availableSizes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label ? `${s.code} · ${s.label}` : s.code}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar variante"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function AddSizeForm() {
  const [state, action, pending] = useActionState(createSize, initial);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="code" className="text-xs uppercase tracking-wide text-neutral-500">
          Código *
        </label>
        <input
          id="code"
          name="code"
          required
          placeholder="6 · 11/12 · XL"
          className="block w-28 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="label" className="text-xs uppercase tracking-wide text-neutral-500">
          Etiqueta
        </label>
        <input
          id="label"
          name="label"
          placeholder="opcional"
          className="block w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="sort_order" className="text-xs uppercase tracking-wide text-neutral-500">
          Orden
        </label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={0}
          className="block w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear talle"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
