<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import type { Event } from '@/types/event'
import Form from '@/components/event/EventForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useEventStore, useUtilsStore } from '@/store'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()
const utilsStore = useUtilsStore()

const { eventCreateStore, eventUpdateStore, eventDeleteStore } = useEventStore()

// const eventCreateStore = useEventCreateStore()
const { created } = storeToRefs(eventCreateStore)

// const eventDeleteStore = useEventDeleteStore()
const { isLoading: deleteLoading, error: deleteError } = storeToRefs(eventDeleteStore)

// const eventUpdateStore = useEventUpdateStore()
const { retrieved: item, updated, isLoading, error, violations, } = storeToRefs(eventUpdateStore)

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const selectedEvent = ref(null)

useMercureItem({ store: eventUpdateStore, deleteStore: eventDeleteStore, redirectRouteName: 'EventList' })

await eventUpdateStore.retrieve(decodeURIComponent(route.params.id as string))

// ApiPlatform wants IRIs for relations
const update = async (item: Event) => {
	await eventUpdateStore.update({
		...item,
		venue: item.venue?.['@id'],
		artists: item.artists?.map(artist => artist['@id'] as string),
		schedules: item.schedules?.map(schedule => schedule['@id'] as string)
	})

	utilsStore.showToast('lol')
}

const deleteItem = async () => {
	if (!item?.value) return eventUpdateStore.setError(t('itemNotFound'))
	await eventDeleteStore.deleteItem(item?.value)
	router.push({ name: 'EventList' })
}

onBeforeUnmount(() => {
	eventUpdateStore.$reset()
	eventCreateStore.$reset()
	eventDeleteStore.$reset()
})
</script>

<template>
	<Toolbar :actions="['delete']" :breadcrumb="breadcrumb" :is-loading="isLoading" @delete="deleteItem" />

	<v-container fluid>
		<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

		<v-alert v-if="created || updated" type="success" class="mb-4" closable>
			<template v-if="created">
				{{ $t('itemCreated', [created['@type'], created['title']]) }}
			</template>

			<template v-else-if="updated">
				{{ $t('itemUpdated', [updated['@type'], updated['title']]) }}
			</template>
		</v-alert>

		<Form v-if="item" :values="item" :errors="violations" @submit="update" />
	</v-container>

	<Loading :visible="isLoading || deleteLoading" />
</template>