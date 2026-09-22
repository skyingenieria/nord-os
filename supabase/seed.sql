-- ============================================================================
-- Seed de tenants (idempotente) — Su Uniformes + Nord
-- ============================================================================

-- Organizaciones
insert into organizations (name, slug) values
  ('Su Uniformes','su-uniformes'),
  ('Nord','nord')
on conflict (slug) do nothing;

-- Colegios de Su Uniformes
insert into schools (organization_id, name, slug)
select o.id, v.name, v.slug
from organizations o
join (values ('DVDS','dvds'),('Futuro','futuro'),('Toddlers','toddlers')) as v(name,slug) on true
where o.slug = 'su-uniformes'
on conflict (organization_id, slug) do nothing;

-- Colegio de Nord (placeholder; Nord se absorbe al multi-tenant más adelante)
insert into schools (organization_id, name, slug)
select o.id, 'Wellspring','wellspring'
from organizations o where o.slug = 'nord'
on conflict (organization_id, slug) do nothing;

-- Proveedores de Su Uniformes
insert into suppliers (organization_id, name)
select o.id, v.name
from organizations o
join (values ('Nora'),('Susana')) as v(name) on true
where o.slug = 'su-uniformes'
on conflict (organization_id, name) do nothing;
