"use client";

import { useActionState } from "react";
import { updateDraftItems, type FormState } from "../actions";

const initial: FormState = { error: null };

export type DraftItem = {
  id: string;
  variantId: string;
  name: string;
  code: string;
  cost: number;
  price: number;
};

export function DraftEditor({
  listId,
  items,
}: {
  listId: string;
  items: DraftItem[];
}) {
  const [state, action, pending] = useActionState(updateDraftItems, initial);

  return (
    <form action={action}>
      <input type="hidden" name="price_list_id" value={listId} />

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Prenda</th>
              <th className="text-left font-medium px-4 py-2.5">Talle</th>
              <th className="text-right font-medium px-4 py-2.5">Costo</th>
              <th className="text-right font-medium px-4 py-2.5">Precio</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-neutral-100 dark:border-neutral-800"
              >
                <td className="px-4 py-1.5">{it.name}</td>
                <td className="px-4 py-1.5 text-neutral-500">{it.code}</td>
                <td className="px-2 py-1.5 text-right">
                  <input type="hidden" name={`item_${it.id}_variant`} value={it.variantId} />
                  <input
                    name={`item_${it.id}_cost`}
                    type="number"
                    step="1"
                    defaultValue={it.cost}
                    className="w-24 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-right tabular-nums"
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <input
                    name={`item_${it.id}_price`}
                    type="number"
                    step="1"
                    defaultValue={it.price}
                    className="w-24 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-right tabular-nums"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {!state.error && !pending && state !== initial && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Cambios guardados.
          </p>
        )}
      </div>
    </form>
  );
}
