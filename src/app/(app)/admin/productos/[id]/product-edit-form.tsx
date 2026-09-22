"use client";

import { useActionState } from "react";
import { updateProduct, type FormState } from "../actions";

const initial: FormState = { error: null };

type Product = {
  id: string;
  name: string;
  category: string | null;
  gender: string | null;
  description: string | null;
};

export function ProductEditForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(updateProduct, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={product.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product.name}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product.category ?? ""}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="Formal">Formal</option>
            <option value="Deportivo">Deportivo</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="gender" className="text-sm font-medium">
            Género
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue={product.gender ?? ""}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">—</option>
            <option value="Varon">Varón</option>
            <option value="Mujer">Mujer</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={product.description ?? ""}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {!state.error && !pending && state !== initial && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Guardado.
          </p>
        )}
      </div>
    </form>
  );
}
