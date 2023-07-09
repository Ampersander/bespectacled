<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import EventCard from '@/components/custom/EventCard.vue'
import { useMercureList } from '@/composables/mercureList'
import DataIterator from '@/components/custom/DataIterator.vue'
import { useEventDeleteStore, useEventListStore, useUtilsStore } from '@/store'

defineProps<{ scroll: number }>()

const utilsStore = useUtilsStore()
const deleteStore = useEventDeleteStore()

const store = useEventListStore()
const { items, isLoading } = storeToRefs(store)

const page = ref('1')
const order = ref({})
const keys = ['title', 'type', 'price', 'artists', 'schedules']

const sendRequest = async () => await store.getItems({ page: page.value, order: order.value })

useMercureList({ store, deleteStore })

sendRequest().then(() => {
	// Sort by schedules in the future
	items.value.map(event => {
		event.schedules = event.schedules
			.filter(s => Date.now() < new Date(s.date).getTime())
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	})

	const eventsWithSchedules = items.value.filter(event => event.schedules.length > 0)
	const eventsWithoutSchedules = items.value.filter(event => event.schedules.length === 0)

	items.value = [...eventsWithSchedules, ...eventsWithoutSchedules]
})

onBeforeUnmount(() => deleteStore.$reset())
watchEffect(() => utilsStore.setLoading(isLoading.value))
</script>

<template>
	<DataIterator #="props" class="mt-n4" :items="items" :keys="keys" :isLoading="isLoading" :availability="_ => _.schedules.length > 0" :scroll="scroll" sortKey="schedules" sortOrder="desc">
		<v-col v-if="!isLoading" v-for="_ in props.items" :key="_.raw.id" class="text-center snap" v-intersect="props.onIntersect">
			<EventCard :event="_.raw" />
		</v-col>
	</DataIterator>
</template>