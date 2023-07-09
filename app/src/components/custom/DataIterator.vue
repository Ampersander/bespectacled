<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'

import { VuetifyOrder } from '@/types/list'

const props = defineProps<{
	items: any[]
	page?: number
	keys: string[]
	scroll: number
	sortKey?: VuetifyOrder['key']
	isLoading: boolean
	sortOrder?: VuetifyOrder['order']
	itemsPerPage?: number
	availability?: (item: any) => boolean
}>()

const { items, scroll } = toRefs(props)

const search = ref('')
const page = ref(props.page ?? 1)
const itemsPerPage = ref(props.itemsPerPage ?? 6)

const showAvailableOnly = ref(false)
const itemsPerPageArray = [6, 12, 18, 24, 30]
const availability = props.availability ?? (() => true)
const numberOfPages = computed(() => Math.ceil(items.value.length / itemsPerPage.value))
const sortBy = ref<VuetifyOrder[]>([{ key: props.sortKey || props.keys[0], order: props.sortOrder || 'asc' }])
const filteredItems = computed(() => showAvailableOnly.value ? items.value.filter(availability) : items.value)
const scrolled = computed(() => scroll.value < document.body.offsetHeight - window.innerHeight - 100)

const onIntersect = {
	handler: (b: any, e: any) => {
		e[0].target.style.transition = 'opacity .3s ease'
		e[0].target.style.opacity = e[0].intersectionRatio * 2
	},
	options: { threshold: [0, .25, .5, .75, 1] }
}

// const updatePage = (newPage: string) => {
// 	page.value = newPage
// 	sendRequest()
// }

// const updateOrder = (newOrders: VuetifyOrder[]) => {
// 	const newOrder = newOrders[0]
// 	order.value = { [newOrder.key]: newOrder.order }
// 	sendRequest()
// }
</script>

<template>
	<v-data-iterator
		v-model:items-per-page="itemsPerPage"
		v-model:page="page"
		:items="filteredItems"
		:search="search"
		:sort-by="sortBy"
	>
		<template #header>
			<v-toolbar class="px-2 mb-4 sticky-top sticky-nav backdrop" dark rounded>
				<v-text-field v-model="search" clearable hide-details prepend-inner-icon="fa fa-magnifying-glass" placeholder="Search" variant="solo" density="comfortable" />

				<v-spacer />

				<v-checkbox v-model="showAvailableOnly" class="m-0" label="Show available only" density="comfortable" hide-details />
				<v-select v-model="sortBy[0].key" prepend-inner-icon="fa fa-sort" :items="keys" :item-title="item => item.charAt(0).toUpperCase() + item.slice(1)" label="Sort by" density="comfortable" hide-details />

				<v-spacer />

				<v-btn-toggle v-model="sortBy[0].order" mandatory>
					<v-btn icon="fa fa-sort-alpha-asc" color="secondary" value="asc" />
					<v-btn icon="fa fa-sort-alpha-desc" color="secondary" value="desc" />
				</v-btn-toggle>
			</v-toolbar>
		</template>

		<template #no-data>
			<v-row v-if="isLoading" class="mb-6" justify="space-around">
				<v-col v-for="n in 6" :key="n" class="snap" v-intersect="onIntersect">
					<slot name="skeleton">
						<v-skeleton-loader class="mx-auto align-content-start" width="350" height="492" elevation="8" type="image,image,heading,chip@3,divider,actions" />
					</slot>
				</v-col>
			</v-row>

			<v-alert v-if="!isLoading" type="warning" text="No results found" />
		</template>

		<template #default="props">
			<v-row justify="space-around">
				<slot :="props" :onIntersect="onIntersect"></slot>
			</v-row>
		</template>

		<template #footer="{ prevPage, nextPage }">
			<v-bottom-sheet :model-value="scrolled" :scrim="false" :retain-focus="false" scroll-strategy="reposition" inset persistent no-click-animation>
				<v-sheet class="d-flex align-center justify-space-around pa-4 rounded backdrop snap">
					<span class="grey--text">Showing {{ items.length }} item{{ items.length !== 1 && 's'}} with</span>

					<v-menu>
						<template #activator="{ props }">
							<v-btn v-bind="props" class="mx-2" color="secondary" variant="text" :append-icon="'fa fa-sort-amount-' + sortBy[0].order">
								{{ itemsPerPage }}
							</v-btn>
						</template>

						<v-list>
							<v-list-item
								v-for="(number, index) in itemsPerPageArray"
								:key="index"
								:title="number"
								@click="itemsPerPage = number"
							/>
						</v-list>
					</v-menu>

					<span class="grey--text">items per page</span>

					<v-spacer />

					<span class="mr-4 grey--text">Page {{ numberOfPages < 1 ? 0 : page }} of {{ numberOfPages }}</span>
					<v-btn icon="fa fa-chevron-left" size="small" @click="prevPage" />
					<v-btn icon="fa fa-chevron-right" class="ml-2" size="small" @click="nextPage" />
				</v-sheet>
			</v-bottom-sheet>

			<v-sheet class="d-flex align-center justify-space-around pa-4 snap" color="background">
				<span class="grey--text">Showing {{ items.length }} item{{ items.length !== 1 && 's'}} with</span>

				<v-menu>
					<template #activator="{ props }">
						<v-btn v-bind="props" class="mx-2" color="primary" variant="text" append-icon="fa fa-arrow-down">
							{{ itemsPerPage }}
						</v-btn>
					</template>

					<v-list>
						<v-list-item
							v-for="(number, index) in itemsPerPageArray"
							:key="index"
							:title="number"
							@click="itemsPerPage = number"
						/>
					</v-list>
				</v-menu>

				<span class="grey--text">items per page</span>

				<v-spacer />

				<span class="mr-4 grey--text">Page {{ numberOfPages < 1 ? 0 : page }} of {{ numberOfPages }}</span>
				<v-btn icon="fa fa-chevron-left" size="small" @click="prevPage" />
				<v-btn icon="fa fa-chevron-right" class="ml-2" size="small" @click="nextPage" />
			</v-sheet>
		</template>
	</v-data-iterator>
</template>