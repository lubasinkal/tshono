-- Featured placement, bought through Polar.
alter table employer_profiles add column if not exists featured_credits int not null default 0;
alter table jobs add column if not exists featured_until timestamptz;

-- Webhook idempotency: Polar may retry an order.paid delivery.
create table if not exists polar_orders (
  id text primary key,
  product_id text,
  credits int not null default 0,
  created_at timestamptz not null default now()
);
