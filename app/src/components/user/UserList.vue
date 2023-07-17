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

const deleteSelected = async () => {
	await Promise.all(selection.value.map((item: User) => userDeleteStore.deleteItem(item)))
	sendRequest()
		.catch(() => userDeleteStore.setError(t('user.error.delete')))
		.finally(() => selection.value = [])
}

const toggleEnabled = async (enabled: boolean, item: User) => {
	await userUpdateStore.toggleEnabled(enabled, item)
}

onBeforeUnmount(() => userDeleteStore.$reset())
watchEffect(() => $utilsStore.setLoading(isLoading.value))
</script>

<template>
	<Toolbar :actions="selection.length > 0 ? ['add', 'delete'] : ['add']" :breadcrumb="breadcrumb" :is-loading="isLoading" @add="goToCreatePage" @delete="deleteSelected" />

	<v-container fluid>
		<v-alert v-if="error || updateError" type="error" class="mb-4" v-text="error || updateError" closable />

		<v-alert v-if="updated" type="success" class="mb-4" closable>
			{{ $t('itemUpdated', [updated['@type'], updated['username']]) }}
		</v-alert>

		<v-data-table-server
			v-model="selection"
			class="rounded"
			:headers="headers"
			:items="items"
			:items-length="totalItems"
			:loading="isLoading || updateIsLoading"
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
				{{ item.raw.roles.join(', ') }}
			</template>

			<template #item.events="{ item }">
				<v-menu transition="scale-transition">
					<template #activator="{ props }">
						<v-badge :content="item.raw.events.length" color="primary">
							<v-icon v-bind="props" icon="fa fa-user" />
						</v-badge>
					</template>

					<v-list>
						<v-list-item v-if="router.hasRoute('UserShow')" v-for="event, i in item.raw.events" :key="i"
							:title="event.title"
							:subtitle="event.type"
							@click="$router.hasRoute('UserShow') && $router.push({ name: 'UserShow', params: { id: event.id } })"
						/>

						<v-list-item v-else v-for="event, i in item.raw.events" :key="-i"
							:title="event.title"
							:subtitle="event.type"
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