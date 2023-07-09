<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import VenueCard from '@/components/custom/VenueCard.vue'
import { useMercureList } from '@/composables/mercureList'
import DataIterator from '@/components/custom/DataIterator.vue'
import { useVenueDeleteStore, useVenueListStore, useUtilsStore } from '@/store'

defineProps<{ scroll: number }>()

const utilsStore = useUtilsStore()
const deleteStore = useVenueDeleteStore()

const store = useVenueListStore()
const { items, isLoading } = storeToRefs(store)

const page = ref('1')
const order = ref({})
const keys = ['name', 'type', 'price', 'seats', 'events']

const sendRequest = async () => await store.getItems({ page: page.value, order: order.value })

useMercureList({ store, deleteStore })

sendRequest().then(() => {
	// Sort by length of events
	items.value.sort((a, b) => b.events.length - a.events.length)
})

onBeforeUnmount(() => deleteStore.$reset())
watchEffect(() => utilsStore.setLoading(isLoading.value))
</script>

<template>
	<DataIterator #="props" class="mt-n4" :items="items" :keys="keys" :isLoading="isLoading" :availability="_ => _.events.length > 0" :scroll="scroll" sortKey="events" sortOrder="desc">
		<v-col v-if="!isLoading" v-for="_ in props.items" :key="_.raw.id" class="text-center snap" v-intersect="props.onIntersect">
			<VenueCard :venue="_.raw" />
		</v-col>
	</DataIterator>
</template>