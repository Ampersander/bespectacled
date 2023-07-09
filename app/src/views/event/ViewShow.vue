<script setup lang="ts">
import { useRoute } from 'vue-router'

import Page from '@/views/default/EventPage.vue'
import Show from '@/components/event/EventShow.vue'

defineProps<{ scroll: number }>()

const route = useRoute()
</script>

<template>
	<Suspense>
		<component :is="route.path.startsWith('/admin') ? Show : Page" />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>