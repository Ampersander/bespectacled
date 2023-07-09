<script setup lang="ts">
import { useRoute } from 'vue-router'

import Page from '@/views/default/VenuePage.vue'
import Show from '@/components/venue/VenueShow.vue'

defineProps<{ scroll: number }>()

const route = useRoute()
</script>

<template>
	<Suspense>
		<component :is="route.path.startsWith('/admin') ? Show : Page" />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>