"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { ACTIVE_SCHOOL_COOKIE, type School } from "@/lib/school-constants";

// Módulos del admin. Se van habilitando (ready:true) por módulo.
// La venta rápida NO es un módulo del admin: vive aparte (link al pie).
const MODULES = [
  { label: "Dashboard", href: "/admin", ready: true },
  { label: "Productos", href: "/admin/productos", ready: true },
  { label: "Listas de precio", href: "/admin/precios", ready: true },
  { label: "Stock", href: "/admin/stock", ready: true },
  { label: "Ventas", href: "/admin/ventas", ready: true },
  { label: "Clientes", href: "/admin/clientes", ready: false },
  { label: "Proveedores", href: "/admin/proveedores", ready: false },
  { label: "Caja / Gastos", href: "/admin/caja", ready: false },
] as const;

export function Sidebar({
  schools,
  activeSchoolId,
  userEmail,
}: {
  schools: School[];
  activeSchoolId: string | null;
  userEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function onSchoolChange(id: string) {
    // Cookie leída por el server para saber el colegio activo.
    document.cookie = `${ACTIVE_SCHOOL_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

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
            value={activeSchoolId ?? schools[0]?.id}
            onChange={(e) => onSchoolChange(e.target.value)}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">
            Sin colegios visibles.
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

      {/* Venta rápida: acceso aparte, no es un módulo del admin */}
      <div className="px-2 pb-2">
        <Link
          href="/rapido"
          className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <span aria-hidden>⚡</span> Venta rápida
        </Link>
      </div>

      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <p className="text-xs text-neutral-500 truncate">
          {userEmail ?? "Sin sesión"}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
