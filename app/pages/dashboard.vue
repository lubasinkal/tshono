<script setup lang="ts">
// Single post-auth landing point so sign-in does not have to guess the account
// type: employers go to their jobs, jobseekers to their dashboard.
const { data } = await useFetch<{ role: string }>('/api/me')
await navigateTo(
  data.value?.role === 'employer'
    ? '/employers/dashboard'
    : data.value?.role === 'jobseeker'
      ? '/jobseekers'
      : '/login',
  { replace: true },
)
</script>
