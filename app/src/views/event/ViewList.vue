<script setup lang="ts">
import List from '@/components/event/EventList.vue'
</script>

<template>
	<Suspense>
		<List />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>