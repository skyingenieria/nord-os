"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct, type FormState } from "../actions";

const initial: FormState = { error: null };

export function ProductForm() {
  const [state, action, pending] = useActionState(createProduct, initial);

  return (
    <form action={action} className="space-y-4 max-w-lg">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre de la prenda *
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Chomba blanca"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">
            Categoría
          </label>
          <input
            id="category"
            name="category"
            placeholder="Remeras"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="gender" className="text-sm font-medium">
            Género
          </label>
          <input
            id="gender"
            name="gender"
            placeholder="Unisex"
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
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
          {pending ? "Creando…" : "Crear prenda"}
        </button>
        <Link href="/admin/productos" className="text-sm text-neutral-500">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
