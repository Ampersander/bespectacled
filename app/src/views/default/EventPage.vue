<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { Event } from '@/types/event'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useEventDeleteStore, useEventListStore, useEventShowStore } from '@/store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()

const deleteStore = useEventDeleteStore()
const { error: deleteError } = storeToRefs(deleteStore)

const eventListStore = useEventListStore()
const { items } = storeToRefs(eventListStore)

const store = useEventShowStore()
const { retrieved: item, isLoading, error } = storeToRefs(store)

const tab = ref(2)
const menus = ref<{ venue: boolean, days: boolean[], times: Record<string, boolean> }>({ venue: false, days: [], times: {} })
const output = computed(() => DOMPurify.sanitize(marked(item?.value?.description || '<i class="text-muted">Nothing here yet...</i>', { mangle: false, headerIds: false })))

const nav = computed(() => {
	const index = items.value.findIndex((i: Event) => i['@id'] === item?.value?.['@id'])

	return {
		prev: index > 0 ? items.value[index - 1] : null,
		next: index < items.value.length - 1 ? items.value[index + 1] : null
	}
})

const general: (keyof Event)[] = ['title', 'type', 'price']
const tabs = [
	{ text: 'venue', 'prepend-icon': 'fa fa-location-dot' },
	{ text: 'artists', 'prepend-icon': 'fa fa-users' },
	{ text: 'schedules', 'prepend-icon': 'fa fa-calendar-alt' }
]

const formats: Record<string, Intl.DateTimeFormatOptions> = {
	weekday: { weekday: 'long' },
	short: { month: 'short', day: 'numeric' },
	long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
}

useMercureItem({ store, deleteStore, redirectRouteName: 'events' })

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
				<v-card-title class="my-2" v-text="item.title" />

				<v-img class="card-bg" :src="item.src || 'https://fakeimg.pl/260/7750f8/FFF/?text=No%20Image&font=lobster&font_size=50'" cover />

				<v-table>
					<tbody>
						<tr v-for="field, i in general" :key="i">
							<td>{{ t('event.' + field) }}</td>
							<td>{{ field === 'price' ? '$' : '' }}{{ item[field] }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card>
		</v-col>

		<v-col cols="12" sm="9">
			<v-sheet rounded="lg">
				<Toolbar color="primary-darken-1" :breadcrumb="[...breadcrumb, { title: item.title ?? '', to: { name: 'events' }}]" :is-loading="isLoading" :nav="nav" main @nav="silentPush" />

				<v-card-text v-html="output" />

				<v-tabs v-model="tab" color="primary" :direction="$vuetify.display.xs ? 'vertical' : 'horizontal'" :fixed-tabs="$vuetify.display.smAndUp">
					<v-tab v-for="tab, i in tabs" :="tab" :value="i" />
				</v-tabs>

				<v-window v-model="tab" class="bg-surface-darken-1">
					<v-window-item v-if="item.venue" value="0">
						<v-row class="bg-surface-darken-1" style="min-height: 11em;">
							<v-col cols="12" sm="8" order-sm="1">
								<v-card-title class="font-title">
									<router-link v-if="item.id" :to="{ name: 'venue', params: { id: item.venue.id }}">
										{{ item.venue.name }}
									</router-link>
								</v-card-title>

								<v-card-subtitle>
									<v-icon icon="fa fa-map-marker-alt" size="md" />
									{{ item.venue.location }}
								</v-card-subtitle>

								<v-card-text :class="['mb-4 pb-0 clamp-fade', `clamp-${$vuetify.display.name}`]" v-html="DOMPurify.sanitize(marked(item.venue.description || '<i>Nothing here yet...</i>', { mangle: false, headerIds: false }))" />
							</v-col>

							<v-col cols="12" sm="4">
								<v-img :src="item.venue.src" :alt="item.venue.name" />
							</v-col>
						</v-row>
					</v-window-item>

					<v-window-item value="1">
						<v-list class="bg-surface-darken-1" :items="item.artists" item-title="username" item-value="id" @click:select="val => $router.push({ name: 'artist', params: { id: val.id as string } })" />
					</v-window-item>

					<v-window-item value="2">
						<v-table class="bg-surface-darken-1">
							<tbody>
								<template v-for="(day, i) in item.schedules" :key="i">
									<tr>
										<td class="w-0 text-center">
											<div class="mb-n2 text-overline">{{ (new Date(day.date)).toLocaleDateString($vuetify.locale.current, formats.weekday) }}</div>
											<div class="text-h6 font-weight-bold">{{ (new Date(day.date)).toLocaleDateString($vuetify.locale.current, formats.short) }}</div>
											</td>

											<td>
												<v-list-item
													:value="day.date"
													color="primary"
													rounded="shaped"
												>
													<v-chip-group>
														<v-menu
															v-for="(time, i) in day.times"
															:key="i"
															v-model="menus.times[day.date + 'T' + time]"
															location="top start"
															origin="top start"
															transition="scale-transition"
															:disabled="Date.now() > new Date(day.date + 'T' + time).getTime()"
														>
															<template #activator="{ props }">
																<v-chip v-bind="props" class="text-h6" :text="time" :disabled="Date.now() > new Date(day.date + 'T' + time).getTime()" size="large" link pill />
															</template>

															<v-card width="max-content">
																<v-list bg-color="black">
																	<v-list-item :title="time" :subtitle="(new Date(day.date)).toLocaleDateString($vuetify.locale.current, formats.long)" prepend-icon="fa fa-clock">
																		<template #append>
																			<v-list-item-action>
																				<v-btn icon="fa fa-times-circle" variant="text" @click="menus.times[day.date + 'T' + time] = false" />
																			</v-list-item-action>
																		</template>
																	</v-list-item>
																</v-list>

																<v-list>
																	<!--<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="() => $router.push({ name: 'ticketing', query: { event: item?.id, date: day.date, time } })" />-->
																</v-list>
															</v-card>
														</v-menu>
													</v-chip-group>
												</v-list-item>
											</td>
										</tr>
								</template>
							</tbody>
						</v-table>
					</v-window-item>
				</v-window>
			</v-sheet>
		</v-col>
	</v-row>
</template>