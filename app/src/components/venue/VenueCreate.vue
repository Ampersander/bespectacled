<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import type { Venue } from '@/types/venue'
import { useVenueCreateStore } from '@/store'
import Form from '@/components/venue/VenueForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'

const router = useRouter()
const breadcrumb = useBreadcrumb()
const venueCreateStore = useVenueCreateStore()
const { created, isLoading, violations, error } = storeToRefs(venueCreateStore)

async function create(item: Venue) {
	await venueCreateStore.create(item)
	if (!created?.value) return
	router.push({ name: 'VenueUpdate', params: { id: created?.value?.['@id'] } })
}

onBeforeUnmount(() => venueCreateStore.$reset())
</script>

<template>
	<Toolbar :breadcrumb="breadcrumb" :is-loading="isLoading" />

	<v-container fluid>
		<v-alert v-if="error" type="error" class="mb-4" closable v-text="error" />
		<Form :errors="violations" @submit="create" />
	</v-container>

	<Loading :visible="isLoading" />
</template>