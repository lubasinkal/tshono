<script setup lang="ts">
// A single employer job has one view: the edit form.
const route = useRoute()
await navigateTo(`/employers/jobs/${route.params.id}/edit`, { redirectCode: 302 })
</script>
