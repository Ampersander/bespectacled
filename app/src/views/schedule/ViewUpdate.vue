<script setup lang="ts">
import Update from '@/components/schedule/ScheduleUpdate.vue'
</script>

<template>
	<Suspense>
		<Update />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>