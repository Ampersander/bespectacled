<script setup lang="ts">
import { ref } from 'vue'

import type { Event } from '@/types/event'
import StripeElementPayment from '../common/StripeElementPayment.vue';
import StripeCheckout from '../common/StripeCheckout.vue';

defineProps<{ event: Event }>()

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const menus = ref<{ venue: boolean, days: boolean[], times: Record<string, boolean> }>({ venue: false, days: [], times: {} })

const formats: Record<string, Intl.DateTimeFormatOptions> = {
	short: { month: 'short', day: 'numeric' },
	long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
}

// const slides = [
// 	new URL('@/assets/maestro.jpeg', import.meta.url).href,
// 	new URL('@/assets/carnival.jpeg', import.meta.url).href,
// 	new URL('@/assets/concert.jpeg', import.meta.url).href,
// 	new URL('@/assets/neon-lights.jpeg', import.meta.url).href,
// 	new URL('@/assets/theatre.jpeg', import.meta.url).href
// ]
</script>

<template>
	<v-card class="mx-auto my-auto" width="350" elevation="8" rounded>
		<template #loader="{ isActive }">
			<v-progress-linear :active="isActive" color="primary" indeterminate />
		</template>

		<v-img v-if="typeof event.src === 'string'" class="card-bg" :src="event.src" height="250" cover>
			<v-img :src="event.src" height="250" />
		</v-img>

		<!-- <v-carousel v-else-if="typeof event.src === 'object'" height="250" cycle hide-delimiters progress="primary" show-arrows="hover">
			<v-carousel-item v-for="(slide, i) in slides" :key="i" :src="slide" cover />
		</v-carousel> -->

		<v-card-item>
			<v-card-title v-text="event.title" />

			<v-menu v-if="event.venue" v-model="menus.venue" location="top start" origin="top start"
				transition="scale-transition">
				<template #activator="{ props }">
					<v-chip v-bind="props" link pill>
						<v-avatar :image="event.venue.src" icon="fa fa-location-dot" start />
						{{ event.venue.name }}
						<v-avatar end :icon="icons[event.venue.type]" />
					</v-chip>
				</template>

				<v-card width="max-content">
					<v-list bg-color="black">
						<v-list-item :title="event.venue?.name" :subtitle="`Rentable for $${event.venue.price} per day`"
							:prepend-avatar="event.venue.src">
							<template #append>
								<v-list-item-action>
									<v-btn variant="text" icon @click="menus.venue = false">
										<v-icon icon="fa fa-times-circle" />
									</v-btn>
								</v-list-item-action>
							</template>
						</v-list-item>
					</v-list>

					<v-list>
						<v-list-item link prepend-icon="fa fa-circle-info" title="View Venue Details"
							@click="() => $router.push({ name: 'venue', params: { id: event.venue?.id } })" />
						<v-list-item link prepend-icon="fa fa-calendar-days" title="Check Available Times"
							@click="() => $router.push({ name: 'calendar', query: { venue: event.venue?.id } })" />
						<v-list-item link prepend-icon="fa fa-ticket" title="Book Venue"
							@click="() => $router.push({ name: 'ticketing', query: { venue: event.venue?.id } })" />
					</v-list>
				</v-card>
			</v-menu>

			<v-chip v-else link pill disabled>
				<v-avatar icon="fa fa-location-dot" start />
				No venue specified
			</v-chip>
		</v-card-item>

		<!-- <v-card-text>
			<v-row align="center" class="mx-0">
				<v-rating :model-value="4.5" color="amber" density="compact" half-increments readonly size="small" />
				<div class="text-grey ms-4">4.5 (413)</div>
			</v-row>
		</v-card-text>

		<v-divider class="mx-6 mt-3 mb-0" /> -->

		<!-- <v-row justify="space-around">
			<v-col class="d-flex flex-column align-center">
				<v-icon :icon="icons[event.type]" />
				<span class="text-capitalize">{{ event.type }}</span>
			</v-col>

			<v-col class="d-flex flex-column align-center">
				<v-icon icon="fa fa-dollar" />
				<span>${{ event.price }} per seat</span>
			</v-col>
		</v-row> -->

		<v-divider class="mx-6 my-2" />

		<v-card-item>
			<div class="text-overline">Happening on</div>

			<v-chip-group v-if="event.schedules.length > 0" model-value="0" mandatory>
				<v-menu v-for="(day, i) in event.schedules" :key="i" v-model="menus.days[i]" location="top start"
					origin="top start" transition="scale-transition" :disabled="Date.now() > new Date(day.date).getTime()">
					<template #activator="{ props }">
						<v-chip v-bind="props" :disabled="Date.now() > new Date(day.date).getTime()"
							:text="new Date(day.date).toLocaleDateString($vuetify.locale.current, formats.short)" link
							pill />
					</template>

					<v-card width="max-content">
						<v-list bg-color="black">
							<v-list-item
								:title="(new Date(day.date)).toLocaleDateString($vuetify.locale.current, formats.long)"
								:subtitle="day.times.length + (day.times.length === 1 ? ` time` : ' times') + ' available'"
								prepend-icon="fa fa-calendar">
								<template #append>
									<v-list-item-action>
										<v-btn icon="fa fa-times-circle" variant="text" @click="menus.days[i] = false" />
									</v-list-item-action>
								</template>
							</v-list-item>
						</v-list>

						<v-card-text>
							<v-chip-group>
								<v-menu v-for="(time, i) in day.times" :key="i" v-model="menus.times[day.date + 'T' + time]"
									location="top start" origin="top start" transition="scale-transition"
									:disabled="Date.now() > new Date(day.date + 'T' + time).getTime()">
									<template #activator="{ props }">
										<v-chip v-bind="props" pill link :text="time"
											:disabled="Date.now() > new Date(day.date + 'T' + time).getTime()" />
									</template>

									<v-card width="max-content">
										<v-list bg-color="black">
											<v-list-item :title="time"
												:subtitle="(new Date(day.date)).toLocaleDateString($vuetify.locale.current, formats.long)"
												prepend-icon="fa fa-clock">
												<template #append>
													<v-list-item-action>
														<v-btn icon="fa fa-times-circle" variant="text"
															@click="menus.times[day.date + 'T' + time] = false" />
													</v-list-item-action>
												</template>
											</v-list-item>
										</v-list>

										<v-list>
											<StripeElementPayment :event="event" :date="day.date" :time="time" />
											<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets">
												
											</v-list-item>
										</v-list>

									</v-card>
								</v-menu>
							</v-chip-group>
						</v-card-text>

						<!--<v-list>
							<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="() => $router.push({ name: 'ticketing', query: { event: event.id, date: day.date } })" />
						</v-list>-->
					</v-card>
				</v-menu>
			</v-chip-group>

			<v-chip-group v-else column>
				<v-chip text="No days available yet" link pill disabled />
			</v-chip-group>
		</v-card-item>

		<!-- <v-divider class="mx-6 my-2" />

		<v-card-text>Description</v-card-text> -->

		<v-divider class="my-1" />

		<v-card-actions>
			<v-icon icon="fa fa-dollar" color="yellow" />

			<div class="text-h6">
				<b>{{ event.price }}</b>
				<small class="text-overline"> per seat</small>
			</div>

			<v-spacer />

			<!-- <v-btn :disabled="days.length < 1" :color="days.length < 1 ? 'gray' : 'secondary'" variant="outlined" v-text="'Book Now'" @click="() => $router.push({ name: 'ticketing', query: { event: event.id } })" /> -->
			<!--<v-btn color="primary" variant="elevated" v-text="'See More'" @click="() => $router.push({ name: 'event', params: { id: event.id } })" />-->
		</v-card-actions>
	</v-card>
</template>

<style>
.card-bg>img {
	filter: brightness(0.5) blur(3px);
}
</style>