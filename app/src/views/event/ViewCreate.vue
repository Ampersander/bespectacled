<script setup lang="ts">
import Create from '@/components/event/EventCreate.vue'
</script>

<template>
	<Suspense>
		<Create />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>