<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { Venue } from '@/types/venue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useVenueDeleteStore, useVenueListStore, useVenueShowStore } from '@/store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const deleteStore = useVenueDeleteStore()
const { error: deleteError } = storeToRefs(deleteStore)

const venueListStore = useVenueListStore()
const { items } = storeToRefs(venueListStore)

const store = useVenueShowStore()
const { retrieved: item, isLoading, error } = storeToRefs(store)

const tab = ref(0)

const nav = computed(() => {
	const index = items.value.findIndex((i: Venue) => i['@id'] === item?.value?.['@id'])

	return {
		prev: index > 0 ? items.value[index - 1] : null,
		next: index < items.value.length - 1 ? items.value[index + 1] : null
	}
})

const general: (keyof Venue)[] = ['name', 'type', 'price', 'seats', 'location']
const tabs = [
	{ text: 'events', 'prepend-icon': 'fa fa-star' }
]

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

useMercureItem({ store, deleteStore, redirectRouteName: 'venues' })

await store.retrieve(decodeURIComponent(route.params.id as string))

const silentPush = async (id: string) => {
	await store.retrieve(id) // if we don't do this, the navigation won't work as intended
	router.push({ name: 'event', params: { id } })

	// if we use this, it will be smoother but won't update the last breadcrumb
	// history.pushState(null, '', route.path.replace(route.params.id as string, id))
}

onBeforeUnmount(() => store.$reset())
</script>

<template>
	<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

	<v-row v-if="item" class="mb-n10">
		<v-col cols="12" sm="3" order-sm="1">
			<v-card class="sticky-top sticky-nav overflow-x-hidden overflow-y-auto font-title text-center" rounded="lg" min-height="268" data-simplebar>
				<v-card-title class="my-2" v-text="item?.name" />

				<v-img v-if="typeof item?.src === 'string'" class="card-bg" :src="item.src" cover />

				<v-card-title v-text="'Information'" />

				<v-table class="bg-surface-darken-1" fixed-header>
					<tbody>
						<tr v-for="field, i in general" :key="i">
							<td>{{ t('venue.' + field) }}</td>
							<td>{{ field === 'price' ? '$' : '' }}{{ item?.[field] }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card>
		</v-col>

		<v-col cols="12" sm="9">
			<v-sheet rounded="lg">
				<Toolbar color="primary-darken-1" :breadcrumb="[...breadcrumb, { title: item?.name ?? '', to: { name: 'venues' }}]" :is-loading="isLoading" :nav="nav" main @nav="silentPush" />

				<v-card-text class="text-pre-wrap">{{ item?.description }}</v-card-text>

				<v-tabs v-model="tab" color="primary" fixed-tabs>
					<v-tab v-for="tab, i in tabs" :="tab" :value="i" />
				</v-tabs>

				<v-window v-model="tab" class="bg-surface-darken-1">
					<v-window-item value="0">
						<v-row v-for="event, i in item?.events" :key="i" class="bg-surface-darken-1" style="min-height: 11em;">
							<v-col cols="12" sm="10" order-sm="1">
								<v-card-title class="font-title">
									<router-link v-if="item?.id" :to="{ name: 'venue', params: { id: event.id }}">
										{{ event.title }}
									</router-link>

									<span class="float-end text-overline text-muted">
										{{ event.type }}
										<v-icon :icon="icons[event.type]" size="md" />
									</span>
								</v-card-title>

								<v-card-text class="mb-4 pb-0 text-pre-wrap clamp-fade clamp-sm" v-text="event.description" />
							</v-col>

							<v-col cols="12" sm="2">
								<v-img :src="event.src" :alt="event.title" />
							</v-col>
						</v-row>
					</v-window-item>
				</v-window>
			</v-sheet>
		</v-col>
	</v-row>
</template>