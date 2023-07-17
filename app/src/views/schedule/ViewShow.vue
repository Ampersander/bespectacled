<script setup lang="ts">
import Show from '@/components/schedule/ScheduleShow.vue'
</script>

<template>
	<Suspense>
		<Show />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>