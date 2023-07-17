<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import type { Venue } from '@/types/venue'
import Form from '@/components/venue/VenueForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useVenueCreateStore, useVenueDeleteStore, useVenueUpdateStore } from '@/store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const venueCreateStore = useVenueCreateStore()
const { created } = storeToRefs(venueCreateStore)

const venueDeleteStore = useVenueDeleteStore()
const { isLoading: deleteLoading, error: deleteError } = storeToRefs(venueDeleteStore)

const venueUpdateStore = useVenueUpdateStore()
const { retrieved: item, updated, isLoading, error, violations, } = storeToRefs(venueUpdateStore)

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const selectedVenue = ref(null)

useMercureItem({ store: venueUpdateStore, deleteStore: venueDeleteStore, redirectRouteName: 'VenueList' })

await venueUpdateStore.retrieve(decodeURIComponent(route.params.id as string))

const update = async (item: Venue) => await venueUpdateStore.update(item)

const deleteItem = async () => {
	if (!item?.value) return venueUpdateStore.setError(t('itemNotFound'))
	await venueDeleteStore.deleteItem(item?.value)
	router.push({ name: 'VenueList' })
}

onBeforeUnmount(() => {
	venueUpdateStore.$reset()
	venueCreateStore.$reset()
	venueDeleteStore.$reset()
})
</script>

<template>
	<Toolbar :actions="['delete']" :breadcrumb="breadcrumb" :is-loading="isLoading" @delete="deleteItem" />

	<v-container fluid>
		<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

		<v-alert v-if="created || updated" type="success" class="mb-4" closable>
			<template v-if="created">
				{{ $t('itemCreated', [created['@id']]) }}
			</template>

			<template v-else-if="updated">
				{{ $t('itemUpdated', [updated['@id']]) }}
			</template>
		</v-alert>

		<Form v-if="item" :values="item" :errors="violations" @submit="update" />
	</v-container>

	<Loading :visible="isLoading || deleteLoading" />
</template>