<script setup lang="ts">
// Single post-auth landing point so sign-in does not have to guess the account
// type: employers go to their jobs, jobseekers to their dashboard, and an
// account with neither goes to the form that creates a profile.
const { data } = await useFetch<{ role: string }>('/api/me')
const role = data.value?.role
await navigateTo(
  !role
    ? '/login'
    : role === 'employer'
      ? '/employers'
      : role === 'jobseeker'
        ? '/jobseekers'
        : '/jobseekers/profile',
  { replace: true },
)
</script>
