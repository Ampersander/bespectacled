<script setup lang="ts">
import { useRoute } from 'vue-router'

import Show from '@/components/user/UserShow.vue'
import Page from '@/views/default/ProfilePage.vue'

defineProps<{ scroll: number }>()

const route = useRoute()
</script>

<template>
	<Suspense>
		<component :is="route.path.startsWith('/admin') ? Show : Page" />
		<template #fallback>{{ $t('loading') }}</template>
	</Suspense>
</template>