<script setup lang="ts">
import List from '@/components/user/UserList.vue'
</script>

<template>
	<Suspense>
		<List />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>