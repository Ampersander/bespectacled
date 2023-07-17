<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import type { Venue } from '@/types/venue'
import Toolbar from '@/components/common/Toolbar.vue'
import Loading from '@/components/common/Loading.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useVenueDeleteStore, useVenueShowStore } from '@/store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const venueShowStore = useVenueShowStore()
const { retrieved: item, isLoading, error } = storeToRefs(venueShowStore)

const venueDeleteStore = useVenueDeleteStore()
const { deleted, error: deleteError } = storeToRefs(venueDeleteStore)

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const tab = ref(1)

useMercureItem({ store: venueShowStore, deleteStore: venueDeleteStore, redirectRouteName: 'VenueList' })

await venueShowStore.retrieve(decodeURIComponent(route.params.id as string))

const goToUpdatePage = (item: any) => router.push({ name: 'VenueUpdate', params: { id: item.id } })

const deleteItem = async () => {
	if (!item?.value) return venueDeleteStore.setError(t('itemNotFound'))
	await venueDeleteStore.deleteItem(item.value)
	if (!deleted?.value) return
	router.push({ name: 'VenueList' })
}

onBeforeUnmount(() => venueShowStore.$reset())
</script>

<template>
	<Toolbar :actions="['edit', 'delete']" :breadcrumb="breadcrumb" :is-loading="isLoading" @edit="goToUpdatePage(item)" @delete="deleteItem" />

	<v-container fluid>
		<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

		<v-tabs v-model="tab" color="primary" fixed-tabs>
			<v-tab value="1">General</v-tab>
			<v-tab value="2">Events</v-tab>
		</v-tabs>

		<v-window v-model="tab">
			<v-window-item value="1">
				<!-- TODO replace html tags? -->
				<v-table v-if="item">
					<thead>
						<tr>
							<th>{{ $t('field') }}</th>
							<th>{{ $t('value') }}</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td>{{ $t('venue.src') }}</td>
							<td><v-img :src="item.src" max-width="100" max-height="100" /></td>
							<!-- <td>{{ item.src }}</td> -->
						</tr>

						<tr>
							<td>{{ $t('venue.name') }}</td>
							<td>{{ item.name }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.type') }}</td>
							<td>{{ item.type }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.seats') }}</td>
							<td>{{ item.seats }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.price') }}</td>
							<td>{{ item.price }}</td>
						</tr>

						<tr>
							<td>
								{{ $t('venue.events') }}
							</td>

							<td>
								<template v-if="router.hasRoute('EventShow')">
									<router-link v-for="event, i in item.events" :key="i" :to="{ name: 'EventShow', params: { id: event.id } }">
										<v-chip color="primary" v-text="event.title" />
										<br />
									</router-link>
								</template>

								<template v-else>
									<v-chip v-for="event in item.events" :key="event.id" color="primary" v-text="event.title" />
								</template>
							</td>
						</tr>
					</tbody>
				</v-table>
			</v-window-item>

			<v-window-item value="2">
				<thead>
					<tr>
						<th>{{ $t('field') }}</th>
						<th>{{ $t('value') }}</th>
					</tr>
				</thead>

				<tbody>
				</tbody>
			</v-window-item>
		</v-window>
	</v-container>

	<Loading :visible="isLoading" />
</template>