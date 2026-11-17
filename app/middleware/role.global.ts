// Both workspaces are private and role-specific. The session check alone let an
// employer account read and write the jobseeker area; this gate runs before the
// page does, so no page has to remember the rule.
export default defineNuxtRouteMiddleware(async (to) => {
  const isJobseekerArea = to.path === '/jobseekers' || to.path.startsWith('/jobseekers/')
  const isEmployerArea = to.path === '/employers' || to.path.startsWith('/employers/')
  if (!isJobseekerArea && !isEmployerArea) return

  const { data } = await useFetch<{ role: string }>('/api/me')
  // 401 here means no session at all.
  if (!data.value) return navigateTo('/login')
  const role = data.value.role
  // An account with no company or no profile still needs the form that creates
  // one: deleting either must not lock the account out of rebuilding it.
  if (role === 'none' && (to.path === '/jobseekers/profile' || to.path === '/employers/company')) return
  if (role === 'none') return navigateTo('/login')
  // /dashboard resolves to the account's own home, so this never loops.
  if (isJobseekerArea && role !== 'jobseeker') return navigateTo('/dashboard')
  if (isEmployerArea && role !== 'employer') return navigateTo('/dashboard')
})
