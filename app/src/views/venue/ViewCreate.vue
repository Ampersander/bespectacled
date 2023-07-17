<script setup lang="ts">
import Create from '@/components/venue/VenueCreate.vue'
</script>

<template>
	<Suspense>
		<Create />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>