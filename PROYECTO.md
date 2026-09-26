# nord-os — Guía del proyecto

Sistema de gestión (ERP + e-commerce) para negocios de uniformes escolares.
Este archivo es la **fuente de verdad** para retomar el proyecto desde cero (sirve
como onboarding para una persona nueva o para un asistente de IA sin historial).

> ⚠️ El repo es **público**. No pongas acá contraseñas, service keys ni tokens.
> La clave *publishable* de Supabase sí puede estar (es pública por diseño; la
> seguridad real la da RLS).

---

## 1. Qué es esto

Migración del negocio **Su Uniformes** (de la mamá de Fede) de Google Sheets a
una web app a medida. Objetivo: sistema a prueba de errores para administrar el
negocio + base para e-commerce público.

- **Multi-tenant.** El concepto raíz es la **Organización** (tenant). Hoy hay dos:
  - **Su Uniformes** (mamá) → colegios **DVDS, Futuro, Toddlers**.
  - **Nord** (Fede + su novia) → colegio **Wellspring**. Nord se absorbe al
    sistema **más adelante**; hoy la web de Nord vive aparte (repo
    `skyingenieria/nord-uniformes`). **No confundir los dos negocios.**
- Debajo del tenant está el **Colegio** (school). Casi todo el catálogo, precios,
  clientes y ventas se scopean **por colegio**.

### Reglas de negocio clave
- **Precio histórico congelado** = prioridad #1. Cada venta guarda un *snapshot*
  inmutable de costo y precio en la línea (`order_items.unit_cost_snapshot` /
  `unit_price_snapshot`). Aunque después cambien las listas, la venta no se altera.
- **Consignación.** El stock tiene tipo de propiedad (`propio` / `consignacion`).
  La liquidación al proveedor se paga al **costo vigente al momento de la venta**
  → es el mismo snapshot de costo (un dato sirve para margen y para deuda).
- **Stock por ledger.** El stock actual se calcula sumando movimientos
  (`inventory_movements`), no es un campo editable.
- **SKU automático**, snake_case sin tildes (ver §5).

---

## 2. Infraestructura y accesos

| Qué | Dónde |
|---|---|
| Repo (público) | `github.com/skyingenieria/nord-os` (cuenta GitHub: **skyingenieria**) |
| App en vivo | **https://nord-os.vercel.app** (Vercel, auto-deploy en cada push a `main`) |
| Base de datos | Supabase, project ref **`todtgtxokhhmnwwbdtsl`** (`https://todtgtxokhhmnwwbdtsl.supabase.co`) |
| Login de prueba | usuario **alonsofede93@gmail.com** (owner de ambas orgs). La contraseña se comparte aparte (no va en el repo). |

- **MCP de Supabase correcto:** el que apunta a `todtgtxokhhmnwwbdtsl` (en esta
  configuración se llamó `supabase-nordos`). El MCP `supabase` "a secas" apuntaba
  a **otro** proyecto (cálculo estructural de Sky Ingeniería) — **no usarlo** para
  nord-os.
- **Vercel — cuidado al importar:** el *Framework Preset* debe ser **Next.js**
  (si queda en "Other", compila pero sirve 404 en todo). *Root Directory* vacío/`./`.

### Variables de entorno (`.env.local`, ya en `.env.example`)
```
NEXT_PUBLIC_SUPABASE_URL=https://todtgtxokhhmnwwbdtsl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_U17CiNxT_P2-eSrVNe389w_g694bIGe
```

---

## 3. Stack

- **Next.js 16** (App Router, Turbopack, TypeScript) + **Tailwind v4**.
- **Supabase** (Postgres + Auth + RLS) vía `@supabase/ssr` +
  `@supabase/supabase-js` **pineado en `2.116.0`** (la `2.117.0` tiene una
  dependencia rota en el registry).
- Deploy en **Vercel**.

### Correr en local
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # valida TypeScript + build (útil antes de pushear)
```

### ⚠️ Next.js 16 tiene convenciones nuevas (leer antes de codear)
`nord-os/AGENTS.md` (lo regenera `next dev`) apunta a los docs en
`node_modules/next/dist/docs/`. Puntos que ya nos pegaron:
- `params` y `searchParams` son **promesas** (`await params`).
- Helpers globales `PageProps<'/ruta'>` / `LayoutProps<'/ruta'>`.
- **`middleware.ts` está deprecado → se usa `proxy.ts`** con
  `export function proxy()`. Acá está en `src/proxy.ts` (refresca la sesión).
- `turbopack.root = __dirname` en `next.config.ts` (había un `package-lock.json`
  en la carpeta padre que confundía la detección de raíz).

---

## 4. Estructura del código

```
src/
  proxy.ts                      # refresco de sesión Supabase (ex-middleware)
  types/database.ts             # tipos de la DB (escritos a mano — ver gotcha §7)
  lib/
    supabase/{client,server,middleware}.ts   # clientes SSR (browser/server) + updateSession
    school.ts / school-constants.ts          # colegio activo (cookie) + tipo School
    pricing.ts                               # lista de precios activa + mapa de precios
  components/sidebar.tsx        # sidebar admin (selector de colegio + módulos)
  app/
    layout.tsx  page.tsx        # root + landing
    login/                      # login email+password (server actions)
    auth/callback/route.ts      # code exchange (magic link / confirmación)
    rapido/                     # vista mobile "venta rápida" (placeholder)
    (app)/                      # grupo protegido (redirige a /login sin sesión)
      layout.tsx                # shell admin: sidebar + main
      admin/
        page.tsx                # dashboard = solo métricas
        productos/              # catálogo (lista expandible, alta, detalle editable)
        precios/                # listas de precio + asistente de aumento (borradores)
        stock/                  # stock por prenda, valorizado, read-only
        ventas/                 # registro de venta completo + cobros
supabase/
  migrations/000{1..4}_*.sql    # esquema (trackeado)
  seed.sql                      # organizaciones, colegios, proveedores
```

**Colegio activo:** se guarda en la cookie `nordos_school` (la setea el selector
del sidebar) y se lee en el server con `getActiveSchool()` (`src/lib/school.ts`).
Casi todas las páginas del admin filtran por ese colegio.

---

## 5. Base de datos (resumen)

Migraciones aplicadas: `0001_init_schema`, `0002_sku_convention_and_hardening`,
`0003_move_unaccent_to_extensions`, `0004_price_list_status`.

**Tenancy:** `organizations`, `schools`, `profiles`, `memberships` (rol
owner/admin/vendedor por org).
**Catálogo (por colegio):** `sizes` (talles, compartidos entre prendas del
colegio), `products` (prendas: `category` = Formal/Deportivo, `gender` =
Varon/Mujer/Unisex), `product_variants` (prenda×talle → `sku`).
**Precios:** `price_lists` (versión por colegio; `status` draft/active),
`price_list_items` (costo+precio por variante).
**Ventas:** `customers` (por colegio), `orders` (cabecera; `order_number`
correlativo por colegio vía trigger; envío/descuento a nivel pedido),
`order_items` (líneas con snapshots), `payments` (cobros).
**Proveedores/stock:** `suppliers` (por org), `supplier_payments`,
`stock_receipts` (ingresos), `inventory_movements` (ledger), `fx_rates` (dólar).
**Vistas:** `v_stock_actual`, `v_order_balance`, `v_supplier_balances`
(todas con `security_invoker=true` → respetan RLS).

- **RLS activo en todas las tablas.** Aísla por org/colegio con los helpers
  `user_org_ids()` / `user_school_ids()` (SECURITY DEFINER). Un usuario solo ve
  la data de sus organizaciones.
- **SKU:** función `make_sku(nombre, talle)` = única fuente de verdad. Un trigger
  (`trg_variant_sku`) autogenera `product_variants.sku` al insertar. Formato:
  minúsculas, sin tildes/ñ, `/` y espacios → `_`, prefijo `T` en el talle.
  Ej: `Chomba blanca` + `11/12` → **`chomba_blanca_T11_12`**.

---

## 6. Estado de los módulos

**Hechos y verificados en producción:**
- ✅ **Auth** — login/logout email+password, rutas del admin protegidas.
- ✅ **Dashboard** — solo métricas (catálogo + operación).
- ✅ **Productos** — lista expandible (talles+SKU), alta, detalle **editable**
  (nombre/categoría/género/descr.), agregar/eliminar talles, eliminar prenda.
- ✅ **Listas de precio** — versiones por colegio; **asistente de aumento** con
  aumento **selectivo por prenda**; la versión nace **BORRADOR** editable ítem
  por ítem, con Finalizar / Descartar.
- ✅ **Stock** — read-only, agrupado por prenda con desplegable de talles y
  **valorización costo/venta** (usa la lista activa).
- ✅ **Ventas** — registro completo (cliente, ítems, envío/descuento); congela
  costo+precio de la lista activa, descuenta stock, y **cobros** que recalculan
  el estado de pago.

**Datos cargados:** catálogo **DVDS** importado del ERP (Uniformes DVDS_2026,
lista 26004): **30 prendas, 40 talles, 220 variantes con precio**. Toddlers,
Futuro y Wellspring todavía **sin catálogo**.

**Pendientes (próximos pasos, en orden sugerido):**
1. **Compras** — ingresos de stock (compra a proveedor → `stock_receipts` +
   `inventory_movements`). Hoy no hay forma de sumar stock desde la UI.
2. **Clientes** — ABM.
3. **Proveedores / consignación** — liquidación al costo de la venta
   (`v_supplier_balances`).
4. **Caja / Gastos**.
5. **Venta rápida** `/rapido` real (mobile, clave para temporada feb-mar).
6. Menores: UI de alta de usuarios, cambio de contraseña, cargar catálogo de los
   otros colegios.

---

## 7. Gotchas (cosas que ya nos pegaron)

- **`src/types/database.ts` está escrito a mano.** El cliente de Supabase tipa
  los `select` anidados (ej: `products(name)`, `price_list_items(count)`) leyendo
  el array `Relationships` de cada tabla. Si usás un embed nuevo y falla el
  type-check, completá el `Relationships` de esa tabla (o regenerá los tipos con
  el MCP `generate_typescript_types` y reemplazá el archivo).
- **No importar `lib/supabase/server.ts` (usa `next/headers`) en un componente
  cliente** — arrastra código server al bundle y rompe el build. Por eso las
  constantes/tipos client-safe van en `school-constants.ts`.
- **Crear usuarios en `auth.users` por SQL:** las columnas de token de texto
  (`confirmation_token`, `recovery_token`, `email_change*`, `phone_change*`,
  `reauthentication_token`) deben ir en `''` (no NULL) o el login da 500
  "Database error querying schema". Además hay que insertar la fila en
  `auth.identities` y setear `email_confirmed_at`. Lo normal es crear usuarios
  desde el panel de Supabase (Authentication → Users → Add user).
- **Vercel Framework Preset = Next.js** (ver §2).

---

## 8. Flujo de trabajo

- Cada push a `main` **redeploya solo** en Vercel.
- Antes de pushear: `npm run build` (valida TS + build).
- Cambios de esquema: crear un `.sql` nuevo en `supabase/migrations/` y aplicarlo
  como migración trackeada (MCP `apply_migration`), manteniendo el archivo y la
  base sincronizados.
- Convención de commits: mensaje en español, imperativo.
