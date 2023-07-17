<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import type { Event } from '@/types/event'
import { useEventCreateStore } from '@/store'
import Form from '@/components/event/EventForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'

const router = useRouter()
const breadcrumb = useBreadcrumb()
const eventCreateStore = useEventCreateStore()
const { created, isLoading, violations, error } = storeToRefs(eventCreateStore)

async function create(item: Event) {
	await eventCreateStore.create({
		...item,
		venue: item.venue?.['@id'],
		artists: item.artists?.map(artist => artist['@id'] as string),
		schedules: item.schedules?.map(schedule => schedule['@id'] as string)
	})

	if (!created?.value) return
	router.push({ name: 'EventUpdate', params: { id: created?.value?.id } })
}

onBeforeUnmount(() => eventCreateStore.$reset())
</script>

<template>
	<Toolbar :breadcrumb="breadcrumb" :is-loading="isLoading" />

	<v-container fluid>
		<!-- <v-alert v-if="error" type="error" class="mb-4" closable v-text="error" /> -->
		<Form :errors="violations" @submit="create" />
	</v-container>

	<Loading :visible="isLoading" />
</template>