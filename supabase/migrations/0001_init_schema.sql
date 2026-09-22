-- ============================================================================
-- nord-os · Esquema inicial (multi-tenant) — Su Uniformes + Nord
-- Proyecto Supabase destino: todtgtxokhhmnwwbdtsl
-- Diseño aprobado (sept 2026). Ajustes: customers y sizes por COLEGIO;
-- order_number correlativo por COLEGIO.
-- ============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- 0) ENUMS
-- ---------------------------------------------------------------------------
create type membership_role       as enum ('owner','admin','vendedor');
create type order_status          as enum ('pendiente','armado','entregado','devuelto');
create type order_payment_status  as enum ('impago','parcial','pagado');
create type stock_ownership       as enum ('propio','consignacion');
create type movement_type         as enum ('ingreso','venta','devolucion','ajuste');
create type supplier_payment_kind as enum ('a_cuenta','liquidacion');

-- ---------------------------------------------------------------------------
-- 1) TENANCY
-- ---------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

create table memberships (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            membership_role not null default 'vendedor',
  created_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index on memberships (user_id);

create table schools (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  slug            text not null,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (organization_id, slug)
);
create index on schools (organization_id);

-- ---------------------------------------------------------------------------
-- 2) HELPERS DE SEGURIDAD (SECURITY DEFINER, evitan recursión de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.user_org_ids()
returns setof uuid language sql security definer stable set search_path = public as $$
  select organization_id from memberships where user_id = auth.uid()
$$;

create or replace function public.user_school_ids()
returns setof uuid language sql security definer stable set search_path = public as $$
  select id from schools where organization_id in (select public.user_org_ids())
$$;

-- ---------------------------------------------------------------------------
-- 3) CATÁLOGO (por colegio)
-- ---------------------------------------------------------------------------
create table sizes (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  code        text not null,            -- normalizado: "3","11/12","XL","grande"
  label       text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (school_id, code)
);
create index on sizes (school_id);

create table products (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  name        text not null,            -- "Chomba blanca"
  category    text,
  gender      text,
  description text,
  photo_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, name)
);
create index on products (school_id);

create table product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  size_id     uuid not null references sizes(id) on delete restrict,
  sku         text not null,            -- "Chomba blanca T3"
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (product_id, size_id)
);
create index on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- 4) PROVEEDORES (nivel organización)
-- ---------------------------------------------------------------------------
create table suppliers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,        -- Nora, Susana
  contact         text,
  notes           text,
  created_at      timestamptz not null default now(),
  unique (organization_id, name)
);
create index on suppliers (organization_id);

create table supplier_payments (
  id          uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  amount      numeric(14,2) not null check (amount > 0),
  kind        supplier_payment_kind not null default 'a_cuenta',
  paid_at     date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);
create index on supplier_payments (supplier_id);

-- ---------------------------------------------------------------------------
-- 5) PRECIOS VERSIONADOS (corazón del precio histórico)
-- ---------------------------------------------------------------------------
create table price_lists (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references schools(id) on delete cascade,
  version_code   text not null,         -- "26004"
  effective_date date not null,
  note           text,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  unique (school_id, version_code)
);
create index on price_lists (school_id);

create table price_list_items (
  id            uuid primary key default gen_random_uuid(),
  price_list_id uuid not null references price_lists(id) on delete cascade,
  variant_id    uuid not null references product_variants(id) on delete cascade,
  cost          numeric(14,2) not null,
  price         numeric(14,2) not null,
  unique (price_list_id, variant_id)
);
create index on price_list_items (variant_id);

-- ---------------------------------------------------------------------------
-- 6) CLIENTES (por colegio) + VENTAS
-- ---------------------------------------------------------------------------
create table customers (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  name        text not null,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index on customers (school_id);

create table orders (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references schools(id) on delete cascade,
  customer_id     uuid references customers(id) on delete set null,
  order_number    int,                  -- correlativo POR COLEGIO (trigger)
  order_date      date not null default current_date,
  status          order_status not null default 'pendiente',
  payment_status  order_payment_status not null default 'impago',
  shipping_charge numeric(14,2) not null default 0 check (shipping_charge >= 0),
  discount        numeric(14,2) not null default 0 check (discount >= 0),
  usd_rate        numeric(14,2),        -- snapshot cotización al vender
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, order_number)
);
create index on orders (school_id);
create index on orders (customer_id);

create table order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  variant_id          uuid not null references product_variants(id) on delete restrict,
  supplier_id         uuid references suppliers(id) on delete set null,
  ownership           stock_ownership not null default 'propio',
  qty                 int not null check (qty > 0),
  unit_cost_snapshot  numeric(14,2) not null,   -- CONGELADO al vender
  unit_price_snapshot numeric(14,2) not null,   -- CONGELADO al vender
  price_list_id       uuid references price_lists(id),
  created_at          timestamptz not null default now()
);
create index on order_items (order_id);
create index on order_items (variant_id);
create index on order_items (supplier_id);

-- Correlativo por colegio (BEFORE INSERT)
create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    perform 1 from schools where id = new.school_id for update;
    select coalesce(max(order_number),0)+1 into new.order_number
      from orders where school_id = new.school_id;
  end if;
  return new;
end $$;
create trigger trg_orders_number before insert on orders
  for each row execute function public.set_order_number();

-- ---------------------------------------------------------------------------
-- 7) COBRANZAS, GASTOS, STOCK, FX
-- ---------------------------------------------------------------------------
create table payments (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  amount     numeric(14,2) not null check (amount > 0),
  method     text,
  paid_at    date not null default current_date,
  notes      text,
  created_at timestamptz not null default now()
);
create index on payments (order_id);

create table expenses (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  school_id       uuid references schools(id) on delete set null,   -- opcional
  category        text not null,        -- Insumos, Monotributo, Viáticos, Logística
  detail          text,
  amount          numeric(14,2) not null check (amount > 0),
  method          text,
  incurred_at     date not null default current_date,
  created_at      timestamptz not null default now()
);
create index on expenses (organization_id);

create table stock_receipts (
  id            uuid primary key default gen_random_uuid(),
  variant_id    uuid not null references product_variants(id) on delete cascade,
  supplier_id   uuid references suppliers(id) on delete set null,
  ownership     stock_ownership not null default 'propio',
  qty           int not null check (qty > 0),
  unit_cost     numeric(14,2) not null,
  price_list_id uuid references price_lists(id),
  received_at   date not null default current_date,
  notes         text,
  created_at    timestamptz not null default now()
);
create index on stock_receipts (variant_id);

-- Ledger de stock: stock actual = sum(qty) por variante (y proveedor)
create table inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references product_variants(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  type        movement_type not null,
  qty         int not null,             -- +ingreso/devolución, −venta
  unit_cost   numeric(14,2),
  ref_table   text,                     -- 'stock_receipts' | 'order_items' | ...
  ref_id      uuid,
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);
create index on inventory_movements (variant_id);

create table fx_rates (               -- Dolar Blue (global, sin tenant)
  rate_date date primary key,
  buy       numeric(14,2),
  sell      numeric(14,2),
  avg       numeric(14,2)
);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trg_products_updated before update on products
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8) RLS
-- ---------------------------------------------------------------------------
alter table organizations     enable row level security;
alter table profiles          enable row level security;
alter table memberships       enable row level security;
alter table schools           enable row level security;
alter table sizes             enable row level security;
alter table products          enable row level security;
alter table product_variants  enable row level security;
alter table suppliers         enable row level security;
alter table supplier_payments enable row level security;
alter table price_lists       enable row level security;
alter table price_list_items  enable row level security;
alter table customers         enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table payments          enable row level security;
alter table expenses          enable row level security;
alter table stock_receipts    enable row level security;
alter table inventory_movements enable row level security;
alter table fx_rates          enable row level security;

-- Perfil propio
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Membership: cada uno ve las suyas
create policy memberships_self on memberships
  for select using (user_id = auth.uid());

-- Organización: miembros
create policy org_members on organizations
  for select using (id in (select public.user_org_ids()));

-- Tablas scopeadas por ORG
create policy suppliers_org on suppliers
  for all using (organization_id in (select public.user_org_ids()))
  with check (organization_id in (select public.user_org_ids()));
create policy expenses_org on expenses
  for all using (organization_id in (select public.user_org_ids()))
  with check (organization_id in (select public.user_org_ids()));

-- Tablas scopeadas por COLEGIO
create policy schools_scope on schools
  for select using (id in (select public.user_school_ids()));
create policy sizes_scope on sizes
  for all using (school_id in (select public.user_school_ids()))
  with check (school_id in (select public.user_school_ids()));
create policy products_scope on products
  for all using (school_id in (select public.user_school_ids()))
  with check (school_id in (select public.user_school_ids()));
create policy price_lists_scope on price_lists
  for all using (school_id in (select public.user_school_ids()))
  with check (school_id in (select public.user_school_ids()));
create policy customers_scope on customers
  for all using (school_id in (select public.user_school_ids()))
  with check (school_id in (select public.user_school_ids()));
create policy orders_scope on orders
  for all using (school_id in (select public.user_school_ids()))
  with check (school_id in (select public.user_school_ids()));

-- Tablas hijas (scope vía padre)
create policy supplier_payments_scope on supplier_payments
  for all using (exists (select 1 from suppliers s where s.id = supplier_id
    and s.organization_id in (select public.user_org_ids())))
  with check (exists (select 1 from suppliers s where s.id = supplier_id
    and s.organization_id in (select public.user_org_ids())));

create policy product_variants_scope on product_variants
  for all using (exists (select 1 from products p where p.id = product_id
    and p.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from products p where p.id = product_id
    and p.school_id in (select public.user_school_ids())));

create policy price_list_items_scope on price_list_items
  for all using (exists (select 1 from price_lists pl where pl.id = price_list_id
    and pl.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from price_lists pl where pl.id = price_list_id
    and pl.school_id in (select public.user_school_ids())));

create policy order_items_scope on order_items
  for all using (exists (select 1 from orders o where o.id = order_id
    and o.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from orders o where o.id = order_id
    and o.school_id in (select public.user_school_ids())));

create policy payments_scope on payments
  for all using (exists (select 1 from orders o where o.id = order_id
    and o.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from orders o where o.id = order_id
    and o.school_id in (select public.user_school_ids())));

create policy stock_receipts_scope on stock_receipts
  for all using (exists (select 1 from product_variants v join products p on p.id = v.product_id
    where v.id = variant_id and p.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from product_variants v join products p on p.id = v.product_id
    where v.id = variant_id and p.school_id in (select public.user_school_ids())));

create policy inventory_movements_scope on inventory_movements
  for all using (exists (select 1 from product_variants v join products p on p.id = v.product_id
    where v.id = variant_id and p.school_id in (select public.user_school_ids())))
  with check (exists (select 1 from product_variants v join products p on p.id = v.product_id
    where v.id = variant_id and p.school_id in (select public.user_school_ids())));

-- FX: lectura para cualquier usuario autenticado (referencia global)
create policy fx_read on fx_rates for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 9) VISTAS ÚTILES (security_invoker → respetan RLS del usuario que consulta)
-- ---------------------------------------------------------------------------
-- Stock actual por variante (+ proveedor) desde el ledger
create view v_stock_actual with (security_invoker = true) as
  select variant_id, supplier_id, sum(qty)::int as stock_actual
  from inventory_movements group by variant_id, supplier_id;

-- Saldo por pedido (cuenta por cobrar)
create view v_order_balance with (security_invoker = true) as
  select o.id as order_id, o.school_id,
         (select coalesce(sum(oi.qty*oi.unit_price_snapshot),0) from order_items oi where oi.order_id=o.id)
           + o.shipping_charge - o.discount            as total,
         coalesce((select sum(p.amount) from payments p where p.order_id=o.id),0) as pagado,
         (select coalesce(sum(oi.qty*oi.unit_price_snapshot),0) from order_items oi where oi.order_id=o.id)
           + o.shipping_charge - o.discount
           - coalesce((select sum(p.amount) from payments p where p.order_id=o.id),0) as saldo
  from orders o;

-- Deuda de consignación por proveedor (costo de items consignación vendidos − pagos)
create view v_supplier_balances with (security_invoker = true) as
  select s.id as supplier_id, s.organization_id, s.name,
         coalesce((select sum(oi.qty*oi.unit_cost_snapshot) from order_items oi
                   where oi.supplier_id=s.id and oi.ownership='consignacion'),0) as debe_consignacion,
         coalesce((select sum(sp.amount) from supplier_payments sp where sp.supplier_id=s.id),0) as pagado,
         coalesce((select sum(oi.qty*oi.unit_cost_snapshot) from order_items oi
                   where oi.supplier_id=s.id and oi.ownership='consignacion'),0)
         - coalesce((select sum(sp.amount) from supplier_payments sp where sp.supplier_id=s.id),0) as saldo
  from suppliers s;
