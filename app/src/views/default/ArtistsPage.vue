<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import UserCard from '@/components/custom/UserCard.vue'
import { useMercureList } from '@/composables/mercureList'
import DataIterator from '@/components/custom/DataIterator.vue'
import { useUserDeleteStore, useUserListStore, useUtilsStore } from '@/store'

defineProps<{ scroll: number }>()

const utilsStore = useUtilsStore()
const deleteStore = useUserDeleteStore()

const store = useUserListStore()
const { items, isLoading } = storeToRefs(store)

const page = ref('1')
const order = ref({})
const keys = ['username', 'events']

const sendRequest = () => {
	store.getArtists({ page: page.value, order: order.value }).then(() => {
		// Sort artists by how many events they star in
		items.value.sort((a, b) => b.events.length - a.events.length)
	})
}

useMercureList({ store, deleteStore })

sendRequest()

onBeforeUnmount(() => deleteStore.$reset())
watchEffect(() => utilsStore.setLoading(isLoading.value))
</script>

<template>
	<DataIterator
		#="props"
		class="mt-n4"
		for="artists"
		:keys="keys"
		:items="items"
		:scroll="scroll"
		sortKey="events"
		sortOrder="desc"
		:itemsPerPage="12"
		:isLoading="isLoading"
		:availability="_ => _.events.length > 0"
		@refresh="sendRequest"
	>
		<v-col v-if="!isLoading" v-for="_ in props.items" :key="_.raw.id" class="text-center snap" v-intersect="props.onIntersect">
			<UserCard :user="_.raw" />
		</v-col>
	</DataIterator>
</template>