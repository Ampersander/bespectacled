<script setup lang="ts">
import List from '@/components/venue/VenueList.vue'
</script>

<template>
	<Suspense>
		<List />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>