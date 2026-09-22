"use client";

import { useState } from "react";

const money = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export type StockVariant = {
  code: string;
  stock: number;
  cost: number;
  price: number;
};
export type StockProduct = {
  id: string;
  name: string;
  totalStock: number;
  costVal: number;
  saleVal: number;
  variants: StockVariant[];
};

export function StockTable({ products }: { products: StockProduct[] }) {
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
            <th className="text-right font-medium px-4 py-2.5">Stock</th>
            <th className="text-right font-medium px-4 py-2.5">Valor costo</th>
            <th className="text-right font-medium px-4 py-2.5">Valor venta</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isOpen = open.has(p.id);
            return (
              <>
                <tr
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className="border-t border-neutral-100 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                >
                  <td className="px-4 py-2.5 font-medium">
                    <span className="inline-block w-4 text-neutral-400">
                      {isOpen ? "▾" : "▸"}
                    </span>
                    {p.name}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {p.totalStock}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-neutral-500">
                    {money(p.costVal)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {money(p.saleVal)}
                  </td>
                </tr>
                {isOpen &&
                  p.variants.map((v) => (
                    <tr
                      key={p.id + v.code}
                      className="bg-neutral-50/50 dark:bg-neutral-900/30 text-neutral-500"
                    >
                      <td className="px-4 py-1.5 pl-12">Talle {v.code}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">
                        {v.stock}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-xs">
                        {money(v.cost)} c/u
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-xs">
                        {money(v.price)} c/u
                      </td>
                    </tr>
                  ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
