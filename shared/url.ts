// URL shapes live here so a link can never be built two ways. Public URLs use
// readable slugs; the durable id stays in the path, so a rename only changes
// the cosmetic part.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function jobPath(job: { id: string; title: string }): string {
  const slug = slugify(job.title)
  return `/jobs/${encodeURIComponent(job.id)}${slug ? `/${slug}` : ''}`
}

export function companyPath(name: string): string {
  return `/companies/${slugify(name)}`
}

export function sectorPath(name: string): string {
  return `/sectors/${slugify(name)}`
}
