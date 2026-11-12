import { createPolarCore } from '@polar-sh/sdk/2026-10'
import { createCustomers, listCustomers, updateCustomers } from '@polar-sh/sdk/2026-10/services/customers'
import { createCheckouts } from '@polar-sh/sdk/2026-10/services/checkouts'
import { createCustomerSessions } from '@polar-sh/sdk/2026-10/services/customer_sessions'
import { pool } from './db'

export const polarClient = process.env.POLAR_ACCESS_TOKEN
  ? createPolarCore({ accessToken: process.env.POLAR_ACCESS_TOKEN })
  : null

// Product ids from the Polar org. Entitlements are decided here, never from
// checkout metadata.
export const PRODUCTS = [
  { productId: 'c22a5161-704b-48a9-96bc-f0a4fbaebf4d', slug: 'monthly' },
  { productId: '83bc42e2-02e8-4db8-b269-5d31a8501c07', slug: 'pass' },
  { productId: 'eeed8d42-4f28-4706-8555-56ce97dd1357', slug: 'annual' },
  { productId: '94f7a43f-ebce-4cb3-b7a3-b5af80cc3796', slug: 'featured' },
  { productId: '066165c6-9651-478c-8e3f-c1083d374ca6', slug: 'featured-10' },
]

// plan products extend plan_until; featured products only add credits.
const PLANS: Record<string, { days: number; credits: number; label: string }> = {
  'c22a5161-704b-48a9-96bc-f0a4fbaebf4d': { days: 30, credits: 10, label: 'monthly' },
  '83bc42e2-02e8-4db8-b269-5d31a8501c07': { days: 90, credits: 30, label: 'pass' },
  'eeed8d42-4f28-4706-8555-56ce97dd1357': { days: 365, credits: 120, label: 'annual' },
}
const FEATURED: Record<string, number> = {
  '94f7a43f-ebce-4cb3-b7a3-b5af80cc3796': 1,
  '066165c6-9651-478c-8e3f-c1083d374ca6': 10,
}

interface AccountUser {
  id: string
  email: string
  name: string
}

// Customers are created lazily at checkout, not at signup: a Polar outage must
// never block employer registration.
export async function ensurePolarCustomer(user: AccountUser): Promise<boolean> {
  if (!polarClient) return false
  const existing = await listCustomers(polarClient)({ email: user.email })
  const individual = existing.items.find((c: any) => c.type === 'individual') as any
  if (individual) {
    if (individual.external_id === user.id) return true
    if (individual.external_id === null) {
      await updateCustomers(polarClient)(individual.id, { external_id: user.id })
      return true
    }
    return false
  }
  await createCustomers(polarClient)({ email: user.email, name: user.name, external_id: user.id })
  return true
}

export async function startCheckout(
  user: AccountUser,
  slug: string,
  successUrl: string,
): Promise<string | null> {
  if (!polarClient) return null
  const product = PRODUCTS.find((p) => p.slug === slug)
  if (!product) return null
  if (!(await ensurePolarCustomer(user))) return null
  const checkout = await createCheckouts(polarClient)({
    products: [product.productId],
    external_customer_id: user.id,
    success_url: successUrl,
  })
  return checkout.url
}

export async function startBillingPortal(user: AccountUser): Promise<string | null> {
  if (!polarClient) return null
  if (!(await ensurePolarCustomer(user))) return null
  const session = await createCustomerSessions(polarClient)({ external_customer_id: user.id })
  return session.customer_portal_url
}

interface PolarOrder {
  id?: string
  product_id?: string
  customer?: { external_id?: string | null; email?: string | null }
}

async function orgForOrder(client: any, order: PolarOrder): Promise<string | null> {
  const externalId = order.customer?.external_id
  if (externalId) {
    const r = await client.query(
      'select "organizationId" from member where "userId" = $1 order by "createdAt" asc limit 1',
      [externalId],
    )
    if (r.rows[0]) return r.rows[0].organizationId
  }
  const email = order.customer?.email
  if (email) {
    const r = await client.query(
      `select m."organizationId" from member m join "user" u on u.id = m."userId"
        where lower(u.email) = lower($1) order by m."createdAt" asc limit 1`,
      [email],
    )
    if (r.rows[0]) return r.rows[0].organizationId
  }
  return null
}

// onOrderPaid: idempotent by order id. Plan products extend the paid period;
// featured products only add credits.
export async function grantOrder(payload: { data?: PolarOrder }): Promise<void> {
  const order = payload?.data
  const productId = order?.product_id ? String(order.product_id) : ''
  const plan = PLANS[productId]
  const credits = FEATURED[productId] ?? 0
  if (!order?.id || (!plan && !credits)) {
    console.error('polar order ignored', productId || 'unknown product')
    return
  }

  const client = await pool.connect()
  try {
    await client.query('begin')
    const fresh = await client.query(
      `insert into polar_orders (id, product_id, credits) values ($1,$2,$3)
       on conflict (id) do nothing returning id`,
      [order.id, productId, plan?.credits ?? credits],
    )
    if (!fresh.rowCount) {
      await client.query('rollback')
      return
    }
    const orgId = await orgForOrder(client, order)
    if (!orgId) {
      await client.query('rollback')
      console.error('polar order has no employer organization', order.id)
      return
    }

    if (plan) {
      await client.query(
        `insert into employer_profiles (organization_id, plan, plan_until, featured_credits)
         values ($1, $2, now() + make_interval(days => $3), $4)
         on conflict (organization_id) do update set
           plan = $2,
           plan_until = greatest(now(), coalesce(employer_profiles.plan_until, now()))
                        + make_interval(days => $3),
           featured_credits = employer_profiles.featured_credits + $4`,
        [orgId, plan.label, plan.days, plan.credits],
      )
    } else {
      await client.query(
        `insert into employer_profiles (organization_id, featured_credits) values ($1,$2)
         on conflict (organization_id) do update set
           featured_credits = employer_profiles.featured_credits + $2`,
        [orgId, credits],
      )
    }
    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
}
