<script setup lang="ts">
import { ref, onBeforeUnmount, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify/labs/date'

import type { User } from '@/types/user'
import type { VuetifyOrder } from '@/types/list'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureList } from '@/composables/mercureList'
import ActionCell from '@/components/common/ActionCell.vue'
import { useUserDeleteStore, useUserListStore, useUserUpdateStore, useUtilsStore } from '@/store'

const date = useDate()
const { t } = useI18n()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const $utilsStore = useUtilsStore()

const userDeleteStore = useUserDeleteStore()
const { deleted, mercureDeleted } = storeToRefs(userDeleteStore)

const userListStore = useUserListStore()
const { items, totalItems, error, isLoading } = storeToRefs(userListStore)

const userUpdateStore = useUserUpdateStore()
const { retrieved, updated, isLoading: updateIsLoading, error: updateError, violations, } = storeToRefs(userUpdateStore)

const page = ref('1')
const order = ref({})
const selection = ref([])

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const sendRequest = async () => await userListStore.getItems({ page: page.value, order: order.value })

useMercureList({ store: userListStore, deleteStore: userDeleteStore })

sendRequest()

const headers = [
	{ title: t('actions'), key: 'actions', sortable: false },
	{ title: t('user.username'), key: 'username', sortable: true },
	{ title: t('user.email'), key: 'email', sortable: true },
	{ title: t('user.roles'), key: 'roles', sortable: true },
	{ title: t('user.events'), key: 'events', sortable: false },
	{ title: t('user.tickets'), key: 'tickets', sortable: false },
	{ title: t('user.bookings'), key: 'bookings', sortable: false },
	{ title: t('user.enabled'), key: 'enabled', sortable: true }
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

const goToShowPage = (item: User) => router.push({ name: 'UserShow', params: { id: item.id } })
const goToCreatePage = () => router.push({ name: 'UserCreate' })
const goToUpdatePage = (item: User) => router.push({ name: 'UserUpdate', params: { id: item.id } })

const deleteItem = async (item: User) => {
	await userDeleteStore.deleteItem(item)
	sendRequest()
}

const toggleEnabled = async (enabled: boolean, item: User) => {
	await userUpdateStore.toggleEnabled(enabled, item)
}

onBeforeUnmount(() => userDeleteStore.$reset())
watchEffect(() => $utilsStore.setLoading(isLoading.value))
</script>

<template>
	<Toolbar :actions="['add']" :breadcrumb="breadcrumb" :is-loading="isLoading" @add="goToCreatePage" />

	<v-container fluid>
		<v-alert v-if="error || updateError" type="error" class="mb-4" v-text="error || updateError" closable />

		<v-alert v-if="updated" type="success" class="mb-4" closable>
			{{ $t('itemUpdated', [updated['@type'], updated['username']]) }}
		</v-alert>

		<!-- TODO filter out users with ROLE_SUPER_ADMIN INSTEAD -->
		<v-data-table-server
			class="rounded"
			:headers="headers"
			:items-length="totalItems"
			:items-per-page="items.length"
			:loading="isLoading || updateIsLoading"
			:items="items.filter(_ => !_.roles.includes('ROLE_ADMIN'))"
			hover
			return-object
			@update:page="updatePage"
			@update:sortBy="updateOrder"
		>
			<template #item.actions="{ item }">
				<!-- TODO use rounded on the component not the buttons -->
				<ActionCell :actions="['show', 'update']" @show="goToShowPage(item.raw)" @update="goToUpdatePage(item.raw)" />
			</template>

			<template #item.username="{ item }">
				<v-tooltip :text="item.raw.username">
					<template #activator="{ props }">
						<router-link v-bind="props" :to="{ name: 'UserShow', params: { id: item.raw.id } }">
							{{ item.raw.username }}
						</router-link>
					</template>
				</v-tooltip>
			</template>

			<template #item.email="{ item }">
				<a :href="`mailto:${item.raw.email}`">{{ item.raw.email }}</a>
			</template>

			<template #item.roles="{ item }">
				<!-- TODO use checkboxes -->
				{{ item.raw.roles.join(' • ') }}
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

			<template #item.tickets="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.tickets.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-ticket" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('TicketShow')" v-for="ticket, i in item.raw.tickets" :key="i"
							:title="'#' + ticket.reference"
							:subtitle="'Status: ' + ticket.status + ' • Event: ' + ticket.event.title"
							@click="$router.hasRoute('TicketShow') && $router.push({ name: 'TicketShow', params: { id: ticket.id } })"
						/>

						<v-list-item v-else v-for="ticket, i in item.raw.tickets" :key="-i"
							:title="'#' + ticket.reference"
							:subtitle="'Status: ' + ticket.status + ' • Event: ' + ticket.event.title"
						/>
					</v-list>
				</v-menu>
			</template>

			<template #item.bookings="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.bookings.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-calendar-check" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('BookingShow')" v-for="booking, i in item.raw.bookings" :key="i"
							:title="date.format(new Date(booking.date), 'fullDateWithWeekday')"
							:subtitle="'Status: ' + booking.status + ' • Venue: ' + booking.venue.name"
							@click="$router.hasRoute('BookingShow') && $router.push({ name: 'BookingShow', params: { id: booking.id } })"
						/>

						<v-list-item v-else v-for="booking, i in item.raw.bookings" :key="-i"
							:title="date.format(new Date(booking.date), 'fullDateWithWeekday')"
							:subtitle="'Status: ' + booking.status + ' • Venue: ' + booking.venue.name"
						/>
					</v-list>
				</v-menu>
			</template>

			<template #item.enabled="{ item }">
				<v-switch :disabled="updateIsLoading" :loading="updateIsLoading && retrieved?.['@id'] === item.raw['@id']" v-model="item.raw.enabled" color="success" @update:model-value="toggleEnabled($event as unknown as boolean, item.raw)" />
			</template>
		</v-data-table-server>
	</v-container>
</template>