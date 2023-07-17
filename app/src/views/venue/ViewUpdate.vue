<script setup lang="ts">
import Update from '@/components/venue/VenueUpdate.vue'
</script>

<template>
	<Suspense>
		<Update />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>