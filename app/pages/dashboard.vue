<script setup lang="ts">
// Single post-auth landing point so sign-in does not have to guess the account
// type: employers go to their jobs, jobseekers to their dashboard, and an
// account with neither is not a tshono account: send it back to sign-in.
const { data } = await useFetch<{ role: string }>('/api/me')
const role = data.value?.role
await navigateTo(
  !role
    ? '/login'
    : role === 'employer'
      ? '/employers'
      : role === 'jobseeker'
        ? '/jobseekers'
        : '/login',
  { replace: true },
)
</script>
