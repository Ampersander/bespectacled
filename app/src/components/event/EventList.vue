<script setup lang="ts">
import { ref, onBeforeUnmount, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify/labs/date'

import type { Event } from '@/types/event'
import type { VuetifyOrder } from '@/types/list'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureList } from '@/composables/mercureList'
import ActionCell from '@/components/common/ActionCell.vue'
import { useEventDeleteStore, useEventListStore, useEventUpdateStore, useUtilsStore } from '@/store'

const date = useDate()
const { t } = useI18n()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const $utilsStore = useUtilsStore()

const eventDeleteStore = useEventDeleteStore()
const { deleted, mercureDeleted } = storeToRefs(eventDeleteStore)

const eventListStore = useEventListStore()
const { items, totalItems, error, isLoading } = storeToRefs(eventListStore)

const eventUpdateStore = useEventUpdateStore()
const { retrieved, updated, isLoading: updateIsLoading, error: updateError, violations, } = storeToRefs(eventUpdateStore)

const page = ref('1')
const order = ref({})
const selection = ref([])

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const sendRequest = async () => await eventListStore.getItems({ page: page.value, order: order.value })

useMercureList({ store: eventListStore, deleteStore: eventDeleteStore })

sendRequest()

const headers = [
	{ title: t('actions'), key: 'actions', sortable: false },
	{ title: t('event.title'), key: 'title', sortable: true },
	{ title: t('event.type'), key: 'type', sortable: true },
	{ title: t('event.price'), key: 'price', sortable: true },
	{ title: t('event.venue'), key: 'venue.name', sortable: true },
	{ title: t('event.artists'), key: 'artists', sortable: false },
	{ title: t('event.schedules'), key: 'schedules', sortable: false }
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

const goToShowPage = (item: Event) => router.push({ name: 'EventShow', params: { id: item.id } })
const goToCreatePage = () => router.push({ name: 'EventCreate' })
const goToUpdatePage = (item: Event) => router.push({ name: 'EventUpdate', params: { id: item.id } })

const deleteItem = async (item: Event) => {
	await eventDeleteStore.deleteItem(item)
	sendRequest()
}

const deleteSelected = async () => {
	await Promise.all(selection.value.map((item: Event) => eventDeleteStore.deleteItem(item)))
	sendRequest()
		.catch(() => eventDeleteStore.setError(t('event.error.delete')))
		.finally(() => selection.value = [])
}

onBeforeUnmount(() => eventDeleteStore.$reset())
watchEffect(() => $utilsStore.setLoading(isLoading.value))
</script>

<template>
	<Toolbar :actions="selection.length > 0 ? ['add', 'delete'] : ['add']" :breadcrumb="breadcrumb" :is-loading="isLoading" @add="goToCreatePage" @delete="deleteSelected" />

	<v-container fluid>
		<v-alert v-if="deleted" type="success" class="mb-4" v-text="$t('itemDeleted', [deleted['@type'], deleted['title']])" closable />
		<v-alert v-if="mercureDeleted" type="success" class="mb-4" v-text="$t('itemDeletedByAnotherUser', [mercureDeleted['@type'], mercureDeleted['title']])" closable />
		<v-alert v-if="error" type="error" class="mb-4" v-text="error" closable />

		<v-data-table-server
			v-model="selection"
			class="rounded"
			:items="items"
			:headers="headers"
			:loading="isLoading"
			:items-length="totalItems"
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

			<template #item.title="{ item }">
				<v-tooltip :text="item.raw.title">
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

			<template #item.venue.name="{ item }">
				<v-tooltip :text="item.raw.venue.name">
					<template #activator="{ props }">
						<router-link v-bind="props" v-if="router.hasRoute('VenueShow')" :to="{ name: 'VenueShow', params: { id: item.raw.venue.id } }">
							<v-avatar :image="item.raw.venue.src" />
						</router-link>

						<p v-bind="props" v-else>
							<v-avatar :image="item.raw.venue.src" />
						</p>
					</template>
				</v-tooltip>
			</template>

			<template #item.artists="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.artists.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-user" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('UserShow')" v-for="artist, i in item.raw.artists" :key="i"
							:title="artist.username"
							:subtitle="artist.email"
							@click="artist.id && $router.push({ name: 'UserShow', params: { id: artist.id } })"
						/>

						<v-list-item v-else v-for="artist, i in item.raw.artists" :key="-i"
							:title="artist.username"
							:subtitle="artist.email"
						/>
					</v-list>
				</v-menu>
			</template>

			<template #item.schedules="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.schedules.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-clock" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('ScheduleShow')" v-for="day, i in item.raw.schedules" :key="i"
							:title="date.format(new Date(day.date), 'normalDateWithWeekday')"
							:subtitle="day.times.join(' • ')"
							@click="day.id && $router.push({ name: 'ScheduleShow', params: { id: day.id } })"
						/>

						<v-list-item v-else v-for="day, i in item.raw.schedules" :key="-i"
							:title="date.format(new Date(day.date), 'normalDateWithWeekday')"
							:subtitle="day.times.join(' • ')"
						/>
					</v-list>
				</v-menu>
			</template>
		</v-data-table-server>
	</v-container>
</template>