import { slugify } from '~~/shared/url'

// Company names are not stable (employers can rename), so public URLs use a
// slug that resolves to whatever the name is today. The index facet is the
// list of names; no schema change is needed.
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  if (!slug) return { name: null }

  const c = useRuntimeConfig().public as Record<string, string>
  if (!c.searchKey || !c.searchHost) return { name: null }

  const base = `${c.searchProtocol || 'https'}://${c.searchHost}/collections/${c.searchCollection || 'jobs'}/documents/search`
  const url = new URL(base)
  url.searchParams.set('q', '')
  url.searchParams.set('query_by', 'title')
  url.searchParams.set('facet_by', 'company')
  url.searchParams.set('max_facet_values', '300')
  url.searchParams.set('per_page', '0')

  try {
    const res = await $fetch<{
      facet_counts?: Array<{ field_name: string; counts: Array<{ value: string }> }>
    }>(url.toString(), { headers: { 'X-TYPESENSE-API-KEY': c.searchKey }, timeout: 8000 })
    const names = res.facet_counts?.find((f) => f.field_name === 'company')?.counts.map((x) => x.value) ?? []
    return { name: names.find((n) => slugify(n) === slug) ?? null }
  } catch (e) {
    console.error('company slug lookup failed', (e as Error).message)
    return { name: null }
  }
})
