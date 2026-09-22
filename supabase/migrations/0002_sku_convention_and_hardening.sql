-- ============================================================================
-- 0002 · Convención de SKU (snake_case sin tildes) + hardening de advisors
-- ============================================================================

-- unaccent para normalizar tildes/ñ (se mueve a schema extensions en 0003)
create extension if not exists unaccent;

-- ---------------------------------------------------------------------------
-- A) SKU canónico: única fuente de verdad
--    make_sku('Chomba blanca','6')      -> 'chomba_blanca_T6'
--    make_sku('Chomba blanca','11/12')  -> 'chomba_blanca_T11_12'
--    make_sku('Buzo','XL')              -> 'buzo_TXL'
-- ---------------------------------------------------------------------------
create or replace function public.make_sku(p_name text, p_size text)
returns text language sql stable set search_path = public, extensions as $$
  select
    -- nombre: minúsculas, sin tildes, no-alfanumérico -> '_', sin '_' en extremos
    trim(both '_' from regexp_replace(lower(unaccent(coalesce(p_name,''))), '[^a-z0-9]+', '_', 'g'))
    || '_T' ||
    -- talle: conserva mayúsculas, sin tildes, no-alfanumérico -> '_'
    trim(both '_' from regexp_replace(unaccent(coalesce(p_size,'')), '[^A-Za-z0-9]+', '_', 'g'))
$$;

-- Autogenera el sku de la variante si viene vacío (nunca se tipea a mano)
create or replace function public.set_variant_sku()
returns trigger language plpgsql set search_path = public as $$
declare v_name text; v_size text;
begin
  if new.sku is null or btrim(new.sku) = '' then
    select name into v_name from products where id = new.product_id;
    select code into v_size from sizes   where id = new.size_id;
    new.sku := public.make_sku(v_name, v_size);
  end if;
  return new;
end $$;

create trigger trg_variant_sku before insert on product_variants
  for each row execute function public.set_variant_sku();

-- El sku pasa a ser opcional en el insert (lo pone el trigger)
alter table product_variants alter column sku drop not null;

-- ---------------------------------------------------------------------------
-- B) Hardening advisors: search_path fijo en los trigger functions
-- ---------------------------------------------------------------------------
alter function public.set_order_number() set search_path = public;
alter function public.set_updated_at()   set search_path = public;

-- ---------------------------------------------------------------------------
-- C) Helpers de RLS: sacar del alcance del rol anónimo (no deben ser RPC público)
--    authenticated conserva EXECUTE porque las policies los invocan.
-- ---------------------------------------------------------------------------
revoke execute on function public.user_org_ids()    from anon, public;
revoke execute on function public.user_school_ids() from anon, public;
grant  execute on function public.user_org_ids()    to authenticated;
grant  execute on function public.user_school_ids() to authenticated;
