"use client";

import Link from "next/link";
import { useState } from "react";

export type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  gender: string | null;
  active: boolean;
  variants: { sku: string; code: string }[];
};

export function ProductList({ products }: { products: ProductRow[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500">
          <tr>
            <th className="text-left font-medium px-4 py-2.5">Prenda</th>
            <th className="text-left font-medium px-4 py-2.5">Categoría</th>
            <th className="text-left font-medium px-4 py-2.5">Género</th>
            <th className="text-right font-medium px-4 py-2.5">Talles</th>
            <th className="text-right font-medium px-4 py-2.5">Editar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isOpen = open.has(p.id);
            return (
              <>
                <tr
                  key={p.id}
                  className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                >
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggle(p.id)}
                      className="text-left font-medium flex items-center gap-2"
                    >
                      <span className="inline-block w-3 text-neutral-400">
                        {isOpen ? "▾" : "▸"}
                      </span>
                      {p.name}
                      {!p.active && (
                        <span className="text-[10px] uppercase text-neutral-400">
                          inactivo
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {p.gender ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {p.variants.length}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="text-xs underline text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      editar
                    </Link>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-neutral-50/50 dark:bg-neutral-900/30">
                    <td colSpan={5} className="px-4 py-3">
                      {p.variants.length === 0 ? (
                        <p className="text-xs text-neutral-500 pl-7">
                          Sin talles cargados.
                        </p>
                      ) : (
                        <div className="pl-7 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                          {p.variants.map((v) => (
                            <div
                              key={v.sku}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="text-neutral-500">
                                Talle {v.code}
                              </span>
                              <span className="font-mono text-neutral-400">
                                {v.sku}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
