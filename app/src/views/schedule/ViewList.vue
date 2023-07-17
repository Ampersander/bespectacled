<script setup lang="ts">
import List from '@/components/schedule/ScheduleList.vue'
</script>

<template>
	<Suspense>
		<List />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>