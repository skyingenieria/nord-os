"use client";

import { useActionState } from "react";
import { createPayment, type FormState } from "../actions";

const initial: FormState = { error: null };

export function PaymentForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(createPayment, initial);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="order_id" value={orderId} />
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-neutral-500">
          Monto
        </label>
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          required
          className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-neutral-500">
          Método
        </label>
        <input
          name="method"
          placeholder="Efectivo / Transf."
          className="w-40 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar cobro"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
