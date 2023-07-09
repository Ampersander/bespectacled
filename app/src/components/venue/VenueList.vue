<script setup lang="ts">
import { ref, onBeforeUnmount, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify/labs/date'

import type { User } from '@/types/user'
import type { Venue } from '@/types/venue'
import type { VuetifyOrder } from '@/types/list'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureList } from '@/composables/mercureList'
import ActionCell from '@/components/common/ActionCell.vue'
import { useVenueDeleteStore, useVenueListStore, useUtilsStore } from '@/store'

const date = useDate()
const { t } = useI18n()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const $utilsStore = useUtilsStore()

const venueDeleteStore = useVenueDeleteStore()
const { deleted, mercureDeleted } = storeToRefs(venueDeleteStore)

const venueListStore = useVenueListStore()
const { items, totalItems, error, isLoading } = storeToRefs(venueListStore)

const page = ref('1')
const order = ref({})
const selection = ref([])

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const sendRequest = async () => await venueListStore.getItems({ page: page.value, order: order.value })

useMercureList({ store: venueListStore, deleteStore: venueDeleteStore })

sendRequest()

const headers = [
	{ title: t('actions'), key: 'actions', sortable: false },
	{ title: t('venue.name'), key: 'name', sortable: true },
	{ title: t('venue.type'), key: 'type', sortable: true },
	{ title: t('venue.price'), key: 'price', sortable: true },
	{ title: t('venue.seats'), key: 'seats', sortable: true },
	{ title: t('venue.location'), key: 'location', sortable: true },
	{ title: t('venue.events'), key: 'events', sortable: false }
]

const updatePage = (newPage: number) => {
	page.value = newPage.toString()
	sendRequest()
}

const updateOrder = (newOrders: VuetifyOrder[]) => {
	const newOrder = newOrders[0]
	order.value = { [newOrder.key]: newOrder.order }
	sendRequest()
}

const goToShowPage = (item: Venue) => router.push({ name: 'VenueShow', params: { id: item.id } })
const goToCreatePage = () => router.push({ name: 'VenueCreate' })
const goToUpdatePage = (item: Venue) => router.push({ name: 'VenueUpdate', params: { id: item.id } })

const deleteItem = async (item: Venue) => {
	await venueDeleteStore.deleteItem(item)
	sendRequest()
}

const deleteSelected = async () => {
	await Promise.all(selection.value.map((item: Venue) => venueDeleteStore.deleteItem(item)))
	sendRequest()
		.catch(() => venueDeleteStore.setError(t('venue.error.delete')))
		.finally(() => selection.value = [])
}

onBeforeUnmount(() => venueDeleteStore.$reset())
watchEffect(() => $utilsStore.setLoading(isLoading.value))
</script>

<template>
	<Toolbar :actions="selection.length > 0 ? ['add', 'delete'] : ['add']" :breadcrumb="breadcrumb" :is-loading="isLoading" @add="goToCreatePage" @delete="deleteSelected" />

	<v-container fluid>
		<v-alert v-if="deleted" type="success" class="mb-4" v-text="$t('itemDeleted', [deleted['type'].charAt(0).toUpperCase() + deleted['type'].slice(1), deleted['name']])" closable />
		<v-alert v-if="mercureDeleted" type="success" class="mb-4" v-text="$t('itemDeletedByAnotherUser', [mercureDeleted['type'].charAt(0).toUpperCase() + mercureDeleted['type'].slice(1), mercureDeleted['name']])" closable />
		<v-alert v-if="error" type="error" class="mb-4" v-text="error" closable />

		<v-data-table-server
			v-model="selection"
			class="rounded"
			:headers="headers"
			:items="items"
			:items-length="totalItems"
			:loading="isLoading"
			:items-per-page="items.length"
			hover
			show-select
			return-object
			@update:page="updatePage"
			@update:sortBy="updateOrder"
		>
			<template #item.actions="{ item }">
				<ActionCell :actions="['show', 'update', 'delete']" @show="goToShowPage(item.raw)" @update="goToUpdatePage(item.raw)" @delete="deleteItem(item.raw)" />
			</template>

			<template #item.name="{ item }">
				<v-tooltip :text="item.raw.name">
					<template #activator="{ props }">
						<router-link v-bind="props" :to="{ name: 'EventShow', params: { id: item.raw.id } }">
							<v-avatar :image="item.raw.src" />
						</router-link>
					</template>
				</v-tooltip>
			</template>

			<template #item.type="{ item }">
				<v-tooltip :text="item.raw.type">
					<template #activator="{ props }">
						<v-icon v-bind="props" :icon="icons[item.raw.type]" />
					</template>
				</v-tooltip>
			</template>

			<template #item.price="{ item }">
				${{ item.raw.price }}
			</template>

			<template #item.seats="{ item }">
				${{ item.raw.seats }}
			</template>

			<template #item.location="{ item }">
				${{ item.raw.location }}
			</template>

			<template #item.events="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.events.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-star" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('EventShow')" v-for="event, i in item.raw.events" :key="i"
							:title="event.title"
							:subtitle="event.type"
							@click="$router.hasRoute('EventShow') && $router.push({ name: 'EventShow', params: { id: event.id } })"
						/>

						<v-list-item v-else v-for="event, i in item.raw.events" :key="-i"
							:title="event.title"
							:subtitle="event.type"
						/>
					</v-list>
				</v-menu>
			</template>
		</v-data-table-server>
	</v-container>
</template>