<script setup lang="ts">
import Update from '@/components/user/UserUpdate.vue'
</script>

<template>
	<Suspense>
		<Update />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>