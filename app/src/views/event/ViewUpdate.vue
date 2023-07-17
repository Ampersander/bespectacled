<script setup lang="ts">
import Update from '@/components/event/EventUpdate.vue'
</script>

<template>
	<Suspense>
		<Update />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>