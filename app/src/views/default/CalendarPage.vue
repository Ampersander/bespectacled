<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useScreens } from 'vue-screen-utils'
import { Calendar, DatePicker } from 'v-calendar'
import { AttributeConfig, PopoverConfig } from 'v-calendar/dist/types/src/utils/attribute'

import { Event } from '@/types/event'
import { Schedule } from '@/types/schedule'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useEventListStore, useScheduleListStore } from '@/store'

defineProps<{ scroll: number }>()

const router = useRouter()
const breadcrumb = useBreadcrumb()

const eventListStore = useEventListStore()
const { items: events, isLoading: eventIisLoading } = storeToRefs(eventListStore)

const scheduleListStore = useScheduleListStore()
const { items: schedule, isLoading: scheduleIsLoading } = storeToRefs(scheduleListStore)

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' });

const query = router.currentRoute.value.query

const tab = ref(1)
const page = ref('1')
const order = ref({})
const selectedDate = ref<undefined | string>()
const selectedEvent = ref<undefined | Event>()
const menus = ref<Record<number, (null | boolean)[]>>([])
const calendar = ref<null | ReturnType<typeof import('v-calendar')['createCalendar']>>(null)
const data = ref<(Partial<AttributeConfig> & { customData: { day: Schedule, event: Event } })[]>([])
const options = reactive({
	rows: 1,
	columns: 1,
	range: {
		start: query?.start && query?.end ? new Date(query.start as string) : null,
		end: query?.start && query?.end ? new Date(query.end as string) : null
	},
	masks: {
		// input: 'MMM D'
		input: 'YYYY-MM-DD',
	}
})

const attrs = computed(() => {
	return [
		{ key: 'today', highlight: true, dates: new Date() },
		options.range?.start && options.range?.end && {
			key: 'range',
			highlight: {
				start: { fillMode: 'outline' },
				base: { fillMode: 'light' },
				end: { fillMode: 'outline' }
			},
			dates: { start: options.range.start, end: options.range.end }
		},
		...data.value.filter(day => day?.customData?.event?.id === (selectedEvent.value?.id || day?.customData?.event?.id))
	] as any
})

const formats: Record<string, Intl.DateTimeFormatOptions> = {
	mixed: { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
}

const sendRequest = async () => {
	await Promise.all([
		eventListStore.getItems({ page: page.value, order: order.value }),
		scheduleListStore.getItems({ page: page.value, order: order.value })
	])
}

sendRequest()

const attr: (label?: PopoverConfig['label'], visibility?: PopoverConfig['visibility']) => { popover: PopoverConfig } = (label = '', visibility = 'hover') => ({
	popover: {
		label,
		visibility,
		placement: 'auto',
		hideIndicator: true,
		isInteractive: true
	}
})

const randomColor = (title: string = Math.random().toString(36).substring(2, 15)) => {
	const colors = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink']
	return colors[title.length % colors.length]
}

const onResize = () => {
	options.rows = mapCurrent({ xs: 1, sm: 1, md: 2, lg: 3 }).value
	options.columns = mapCurrent({ xs: 1, sm: 1, md: 2, lg: 3 }).value
}

watch(options, () => onResize)

watch([events, schedule], () => {
	if (events.value.length > 0 && schedule.value.length > 0) {
		// Create a menu for each day
		menus.value = Array.from({ length: schedule.value.length }).fill([]) as []

		data.value = schedule.value.map(day => {
			const event = events.value.find(e => e.id === day.event.id) as Event

			if (!menus.value[day.id]) menus.value[day.id] = Array.from<null>({ length: day.times.length }).fill(null)

			return {
				customData: { day, event },
				...attr(event?.title, 'focus'),
				dates: [day.date],
				dot: {
					color: randomColor(event?.title),
					class: ''
				}
			}
		})
	}

	if (schedule.value.length > 0 && query?.date) {
		selectedDate.value = query.date as string
		calendar.value?.focusDate(new Date(query.date as string))
	}

	if (events.value.length > 0 && query?.event) selectedEvent.value = events.value.find(e => e.id === Number(query.event as string))
})
</script>

<template>
	<Toolbar color="primary-darken-1" :breadcrumb="breadcrumb" :is-loading="eventIisLoading || scheduleIsLoading" main />

	<v-row v-resize="onResize">
		<v-col :style="'flex-grow: ' + $vuetify.display.sm ? '0' : '1'">
			<v-sheet rounded>
				<v-card-text style="min-width: 300px;">
					<!-- <div v-if="calendar" class="text-overline">{{ calendar.firstPage?.title }}</div> -->

					<div class="d-flex justify-space-between align-center mb-2">
						<v-btn variant="text" color="grey darken-2" icon="fa fa-chevron-left" @click="() => calendar?.movePrev()" />
						<v-btn variant="outlined" color="grey darken-2" @click="() => calendar?.focusDate(new Date())">Today</v-btn>
						<v-btn variant="text" color="grey darken-2" icon="fa fa-chevron-right" @click="() => calendar?.moveNext()" />
					</div>

					<v-row>
						<v-col v-for="dir, i in <const>[['rows', 'v'], ['columns', 'h']]" :key="i" cols="6">
							<v-text-field
								v-model.number="options[dir[0]]"
								:prepend-inner-icon="'fa fa-arrows-alt-' + dir[1]"
								:label="dir[0].charAt(0).toUpperCase() + dir[0].slice(1)"
								type="number"
								min="1"
								:max="i === 0 ? 3 : mapCurrent({ xs: 1, sm: 1, md: 2, lg: 3 }).value"
								clearable
								hide-details
							/>
						</v-col>

						<v-col cols="12">
							<v-combobox
								v-model="selectedEvent"
								prepend-inner-icon="fa fa-star"
								:items="events"
								label="Filter by event"
								chips
								clearable
								hide-details
								hide-selected
							/>

							<v-select
								v-model="selectedDate"
								prepend-inner-icon="fa fa-arrow-turn-right"
								:items="Array.from(new Set(schedule.filter(day => day.event.id === (selectedEvent?.id || day.event.id)).map(s => s.date)))"
								label="Jump to date"
								:item-title="(item: string) => new Date(item).toLocaleDateString($vuetify.locale.current, formats.mixed)"
								item-value="date"
								chips
								clearable
								hide-details
								hide-selected
								@update:model-value="val => calendar?.focusDate(val ? new Date(selectedDate as string) : new Date())"
							/>
						</v-col>

						<v-col style="height: auto !important" cols="12">
							<DatePicker
								v-model.range="options.range"
								class="bg-surface"
								mode="date"
								color="purple"
								:masks="options.masks"
								:drag-attribute="(attr() as AttributeConfig)"
								:select-attribute="(attr() as AttributeConfig)"
								:is-dark="$vuetify.theme.current.dark"
								@drag="options.range = $event"
							>
								<template v-if="options.range?.start && options.range?.end" #day-popover="{ format }">
									{{ format(options.range.start, 'MMM D') }} - {{ format(options.range.end, 'MMM D') }}
								</template>

								<template #="{ inputValue, inputEvents, isDragging, updateValue }">
										<template v-for="el, i in [['start', 'Min'], ['end', 'Max']]">
											<v-text-field
												v-model="inputValue[el[0]]"
												:prepend-inner-icon="isDragging ? 'fa fa-bullseye fa-fade text-primary' : 'fa fa-calendar-day'"
												:label="[el[1]] + 'imum Date'"
												readonly
												type="date"
												clearable
												hide-details
												@="inputEvents[el[0]]"
												@click:clear="updateValue(null)"
											/>
										</template>
								</template>
							</DatePicker>
						</v-col>
					</v-row>
				</v-card-text>
			</v-sheet>
		</v-col>

		<v-col style="height: auto !important;">
			<v-sheet rounded>
				<Calendar
					ref="calendar"
					color="purple"
					:attributes="attrs"
					:rows="options.rows"
					:columns="options.columns"
					:min-date="options.range?.start"
					:max-date="options.range?.end"
					:is-dark="$vuetify.theme.current.dark"
					nav-visibility="hover"
					expanded
					borderless
					transparent
				>
					<template #day-popover="{ day, format, attributes }">
						<div class="text-overline text-gray-300 font-semibold text-center">
							{{ format(day.date, 'WWWW, MMMM D, YYYY') }}
						</div>

						<v-tabs v-model="tab" color="primary" stacked show-arrows>
							<v-tab v-for="attr in attributes" :key="attr.key" :value="attr?.customData?.event?.id">
								<v-avatar start :image="attr?.customData?.event?.src" />
							</v-tab>
						</v-tabs>

						<v-window v-model="tab">
							<v-window-item v-for="attr in attributes" :key="attr.key" :value="attr?.customData?.event?.id">
								<v-card v-if="attr?.customData" :title="attr.customData.event.title" :subtitle="`Min. $${attr.customData.event.price} per seat`" :append-avatar="attr.customData.event.src" flat>
									<v-card-text v-if="attr.customData.day.times.length > 0">
										<div class="text-overline">Starting Time{{ attr.customData.day.times.length > 1 ? 's' : '' }}</div>

										<v-chip-group column>
											<v-menu
												v-for="(time, i) in attr.customData.day.times"
												:key="i"
												v-model="menus[attr.customData.day.id][i] as boolean"
												location="top start"
												origin="top start"
												transition="scale-transition"
												:disabled="Date.now() > new Date(attr.customData.day.date + 'T' + time).getTime()"
											>
												<template #activator="{ props }">
													<v-chip v-bind="props" pill link :text="time" :disabled="Date.now() > new Date(attr.customData.day.date + 'T' + time).getTime()" />
												</template>

												<v-card width="max-content">
													<v-list bg-color="black">
														<v-list-item :title="time" :subtitle="format(day.date, 'WWWW, MMMM D, YYYY')" prepend-icon="fa fa-clock">
															<template #append>
																<v-list-item-action>
																	<v-btn icon="fa fa-times-circle" variant="text" @click="menus[attr.customData.day.id][i] = false" />
																</v-list-item-action>
															</template>
														</v-list-item>
													</v-list>

													<v-list>
														<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="() => router.push({ name: 'ticketing', query: { event: attr.customData.event.id, time } })" />
													</v-list>
												</v-card>
											</v-menu>
										</v-chip-group>
									</v-card-text>

									<v-card-actions>
										<v-btn color="secondary" @click="() => router.push({ name: 'event', params: { id: attr.customData.event.id } })">View Event Details</v-btn>
										<v-spacer></v-spacer>
										<v-btn color="primary" @click="() => router.push({ name: 'ticketing', query: { event: attr.customData.event.id } })">Buy Tickets</v-btn>
									</v-card-actions>
								</v-card>
							</v-window-item>
						</v-window>
					</template>
				</Calendar>
			</v-sheet>
		</v-col>
	</v-row>
</template>

<style scoped>
.v-parallax {
	height: calc(50vh - (48px + 16px * 2)) !important;
	margin-bottom: 16px;
}

.v-parallax .v-btn {
	position: absolute;
	bottom: 16px;
}

.v-col:last-child {
	height: calc(50vh) !important
}
</style>