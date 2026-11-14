// Both workspaces are private and role-specific. The session check alone let an
// employer account read and write the jobseeker area; this gate runs before the
// page does, so no page has to remember the rule.
export default defineNuxtRouteMiddleware(async (to) => {
  const isJobseekerArea = to.path === '/jobseekers' || to.path.startsWith('/jobseekers/')
  const isEmployerArea = to.path === '/employers' || to.path.startsWith('/employers/')
  if (!isJobseekerArea && !isEmployerArea) return

  const { data } = await useFetch<{ role: string }>('/api/me')
  const role = data.value?.role ?? 'none'
  if (role === 'none') return navigateTo('/login')
  // /dashboard resolves to the account's own home, so this never loops.
  if (isJobseekerArea && role !== 'jobseeker') return navigateTo('/dashboard')
  if (isEmployerArea && role !== 'employer') return navigateTo('/dashboard')
})
