<script setup lang="ts">
import { computed, onBeforeUnmount, ref, reactive } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { DatePicker } from 'v-calendar'
import { useRoute, useRouter } from 'vue-router'
import { AttributeConfig, PopoverConfig } from 'v-calendar/dist/types/src/utils/attribute'

import { Venue } from '@/types/venue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useVenueDeleteStore, useVenueListStore, useVenueShowStore } from '@/store'
import StripeElementPaymentBooking from '@/components/common/StripeElementPaymentBooking.vue'

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

// Disable dates before today and today
const disabledDates = ref([{ start: null, end: new Date() }])
const options = reactive({
	rows: 1,
	columns: 1,
	date: undefined,
	masks: {
		// input: 'MMM D'
		input: 'YYYY-MM-DD',
	}
})

const attr: (label?: PopoverConfig['label'], visibility?: PopoverConfig['visibility']) => { popover: PopoverConfig } = (label = '', visibility = 'click') => ({
	popover: {
		label,
		visibility,
		placement: 'top-end',
		hideIndicator: true,
		isInteractive: true
	}
})

const tab = ref(0)
const output = computed(() => DOMPurify.sanitize(marked(item?.value?.description || '<i class="text-muted">Nothing here yet...</i>', { mangle: false, headerIds: false })))

const nav = computed(() => {
	const index = items.value.findIndex((i: Venue) => i['@id'] === item?.value?.['@id'])

	return {
		prev: index > 0 ? items.value[index - 1] : null,
		next: index < items.value.length - 1 ? items.value[index + 1] : null
	}
})

const general: (keyof Venue)[] = ['name', 'type', 'price', 'seats', 'location']
const tabs = [
	{ text: 'events', 'prepend-icon': 'fa fa-star' },
	{ text: 'booking', 'prepend-icon': 'fa fa-calendar-alt' }
]

const formats: Record<string, Intl.DateTimeFormatOptions> = {
	weekday: { weekday: 'long' },
	short: { month: 'short', day: 'numeric' },
	long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
}

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

const submit = ref(false)

const submitForm = () => {
	// Handle form submission here
	console.log('Submitted:', options.date)
	// Reset form fields
	// options.date = undefined
	console.log(options.date)
	submit.value = true
}
</script>

<template>
	<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

	<v-row v-if="item" class="mb-n10">
		<v-col cols="12" sm="3" order-sm="1">
			<v-card class="sticky-top sticky-nav overflow-x-hidden overflow-y-auto font-title text-center" rounded="lg"
				min-height="268" data-simplebar>
				<v-card-title class="my-2" v-text="item.name" />

				<v-img class="card-bg" :src="item.src || 'https://fakeimg.pl/260/7750f8/FFF/?text=No%20Image&font=lobster&font_size=50'" cover />

				<v-card-title v-text="'Information'" />

				<v-table class="bg-surface-darken-1" fixed-header>
					<tbody>
						<tr v-for="field, i in general" :key="i">
							<td>{{ t('venue.' + field) }}</td>
							<td>{{ field === 'price' ? '$' : '' }}{{ item[field] }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card>
		</v-col>

		<v-col cols="12" sm="9">
			<v-sheet rounded="lg">
				<Toolbar color="primary-darken-1" :breadcrumb="[...breadcrumb, { title: item.name ?? '', to: { name: 'venues' } }]" :is-loading="isLoading" :nav="nav" main @nav="silentPush" />

				<v-card-text v-html="output" />

				<v-tabs v-model="tab" color="primary" fixed-tabs>
					<v-tab v-for="tab, i in tabs" :="tab" :value="i" />
				</v-tabs>

				<v-window v-model="tab" class="bg-surface-darken-1">
					<v-window-item value="0">
						<v-row v-for="event, i in item.events" :key="i" class="bg-surface-darken-1" style="min-height: 11em;">
							<v-col cols="12" sm="10" order-sm="1">
								<v-card-title class="font-title">
									<router-link v-if="item.id" :to="{ name: 'event', params: { id: event.id } }">
										{{ event.title }}
									</router-link>

									<span class="float-end text-overline text-muted">
										{{ event.type }}
										<v-icon :icon="icons[event.type]" size="md" />
									</span>
								</v-card-title>

								<v-card-text class="mb-4 pb-0 clamp-fade clamp-sm" v-html="DOMPurify.sanitize(marked(event.description || '<i>Nothing here yet...</i>', { mangle: false, headerIds: false }))" />
							</v-col>

							<v-col cols="12" sm="2">
								<v-img :src="event.src || 'https://fakeimg.pl/260/7750f8/FFF/?text=No%20Image&font=lobster&font_size=50'" :alt="event.title" />
							</v-col>
						</v-row>
					</v-window-item>

					<v-window-item value="1">
						<v-row class="bg-surface-darken-1" style="min-height: 11em;">
							<v-col cols="12">
								<v-card-title class="font-title">
									Book this venue now

									<span v-if="options.date" class="float-end text-overline text-muted">
										<!-- format -->
										{{ (new Date(options.date)).toLocaleDateString($vuetify.locale.current, formats.long) }}
										<v-icon icon="fa fa-calendar-day" size="md" />
									</span>
								</v-card-title>

								<v-card-subtitle>
									<v-icon icon="fa fa-map-marker-alt" size="md" />
									{{ item.location }}
								</v-card-subtitle>

								<v-card-text v-if="!submit" class="mb-4 pb-0">
									<v-form @submit.prevent="submitForm" v-if="!submit">
										<DatePicker
											v-model="options.date"
											class="bg-surface"
											mode="date"
											color="purple"
											:masks="options.masks"
											:popover="attr().popover"
											:disabled-dates="disabledDates"
											:is-dark="$vuetify.theme.current.dark"
											:select-attribute="(attr() as AttributeConfig)"
											is-required
											@drag="options.date = $event"
										>
											<template v-if="options.date" #day-popover="{ format }">
												{{ format(options.date, 'MMM D') }} }}
											</template>

											<template #="{ inputValue, inputEvents, updateValue }">
												<v-text-field
													:value="inputValue"
													prepend-inner-icon="fa fa-calendar-day"
													label="Date"
													readonly
													type="date"
													clearable
													hide-details
													@="inputEvents"
													@click:clear="updateValue(undefined)"
												/>
											</template>
										</DatePicker>

										<!-- <vc-date-picker v-model="options.date" label="Date" required></vc-date-picker> -->

										<v-card-actions>
											<v-btn :disabled="!options.date" type="submit" color="primary" :text="submit ? 'Confirm' : 'Book the venue'" />
										</v-card-actions>
									</v-form>
								</v-card-text>
							</v-col>

							<v-col v-if="submit" cols="12">
								<v-sheet theme="light">
									<v-card-text>
										<StripeElementPaymentBooking v-if="submit" :venueId="item.id" :date="options.date" :price="item.price" />
									</v-card-text>
								</v-sheet>
							</v-col>
						</v-row>
					</v-window-item>
				</v-window>
			</v-sheet>
		</v-col>
	</v-row>
</template>

<style>
.vc-popover-content-wrapper.is-interactive {
	position: fixed !important;
}
</style>