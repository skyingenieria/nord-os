"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Tables } from "@/types/database";

type School = Pick<Tables<"schools">, "id" | "name" | "slug" | "organization_id">;

// Módulos del admin. Solo "Dashboard" está implementado; el resto se habilita
// por módulo en la etapa 4.
const MODULES = [
  { label: "Dashboard", href: "/admin", ready: true },
  { label: "Venta rápida", href: "/rapido", ready: true },
  { label: "Pedidos", href: "/admin/pedidos", ready: false },
  { label: "Stock", href: "/admin/stock", ready: false },
  { label: "Productos", href: "/admin/productos", ready: false },
  { label: "Listas de precio", href: "/admin/precios", ready: false },
  { label: "Clientes", href: "/admin/clientes", ready: false },
  { label: "Proveedores", href: "/admin/proveedores", ready: false },
  { label: "Caja / Gastos", href: "/admin/caja", ready: false },
] as const;

export function Sidebar({
  schools,
  userEmail,
}: {
  schools: School[];
  userEmail: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-dvh sticky top-0">
      <div className="px-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          nord-os
        </p>
      </div>

      {/* Selector de colegio */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <label className="text-[11px] uppercase tracking-wide text-neutral-500">
          Colegio
        </label>
        {schools.length > 0 ? (
          <select
            className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
            defaultValue={schools[0]?.id}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">
            Sin colegios visibles. Iniciá sesión para ver tus datos.
          </p>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {MODULES.map((m) => {
          const active =
            m.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(m.href);

          if (!m.ready) {
            return (
              <span
                key={m.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-400 dark:text-neutral-600 cursor-not-allowed select-none"
              >
                {m.label}
                <span className="text-[10px] uppercase tracking-wide">pronto</span>
              </span>
            );
          }

          return (
            <Link
              key={m.href}
              href={m.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 truncate">
        {userEmail ?? "Sin sesión"}
      </div>
    </aside>
  );
}
