<script setup lang="ts">
import { ref, toRef } from 'vue'

import { Event } from '@/types/event'

const props = defineProps<{ event: Event }>()

// TODO transform to const
// let show = toRef(props, 'show')

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'book'): void
}>()

const icons: { [key: string]: string } = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const menus = ref<{ venue: boolean, days: boolean[], times: { [key: string]: boolean } }>({ venue: false, days: [], times: {} })

// const schedule = props.event.schedules[0]
const days = props.event.schedules.filter(s => Date.now() < new Date(s.date).getTime())

const options: { [key: string]: Intl.DateTimeFormatOptions } = {
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
	<!-- <v-dialog v-model="show" width="300"> -->
		<v-card class="mx-auto my-auto" width="350" rounded>
			<!-- <template v-slot:loader="{ isActive }">
				<v-progress-linear :active="isActive" color="deep-purple" height="4" indeterminate />
			</template> -->

			<!-- object-position -->
			<v-img :src="event.src" height="250" class="card-bg" cover>
				<v-img :src="event.src" height="250" />
				<!-- <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
					<template v-slot:prepend>
						<v-btn icon="fa fa-arrow-left" />
					</template>

					<template v-slot:append>
						<v-btn icon="fa fa-ellipsis-vertical" />
					</template>
				</v-toolbar> -->
			</v-img>

			<!-- <v-carousel height="250" cycle hide-delimiters progress="primary" show-arrows="hover">
				<v-carousel-item v-for="(slide, i) in slides" :key="i" :src="slide" cover />
			</v-carousel> -->

			<v-card-item>
				<v-card-title v-text="event.title" />

				<v-menu v-model="menus.venue" location="top start" origin="top start" transition="scale-transition">
					<template v-slot:activator="{ props }">
						<v-chip v-bind="props" pill link>
							<v-avatar start :image="event.venue.src" />
							{{ event.venue.name }}
							<v-avatar end :icon="icons[event.type]" />
						</v-chip>
					</template>

					<v-card width="max-content">
						<v-list bg-color="black">
							<v-list-item :title="event.venue.name" :subtitle="`Min. $${event.price} per seat`" :prepend-avatar="event.venue.src">							
								<template v-slot:append>
									<v-list-item-action>
										<v-btn icon variant="text" @click="menus.venue = false">
											<v-icon icon="fa fa-times-circle" />
										</v-btn>
									</v-list-item-action>
								</template>
							</v-list-item>
						</v-list>

						<v-list>
							<v-list-item link prepend-icon="fa fa-circle-info" title="View Venue Details" @click="() => $router.push({ name: 'venue', params: { id: event.venue.id } })" />
							<v-list-item link prepend-icon="fa fa-calendar-days" title="Check Available Times" @click="() => $router.push({ name: 'calendar', query: { venue: event.venue.id } })" />
							<v-list-item link prepend-icon="fa fa-ticket" title="Book Venue" @click="() => $router.push({ name: 'ticketing', query: { venue: event.venue.id } })" />
						</v-list>
					</v-card>
				</v-menu>
			</v-card-item>

			<!-- <v-card-text>
				<v-row align="center" class="mx-0">
					<v-rating :model-value="4.5" color="amber" density="compact" half-increments readonly size="small" />
					<div class="text-grey ms-4">4.5 (413)</div>
				</v-row>
			</v-card-text> -->

			<v-divider class="mx-6 mt-3 mb-0" />

			<!-- <div class="px-4">
				<v-chip-group>
					<v-chip>5:30PM</v-chip>
					<v-chip>7:30PM</v-chip>
					<v-chip>8:00PM</v-chip>
					<v-chip>9:00PM</v-chip>
				</v-chip-group>
			</div> -->

			<!-- <v-row justify="space-around">
				<v-col class="d-flex flex-column align-center">
					<v-icon :icon="icons[event.type]" />
					<span class="text-capitalize">{{ event.type }}</span>
				</v-col>

				<v-col class="d-flex flex-column align-center">
					<v-icon icon="fa fa-dollar" />
					<span>${{ event.price }} per seat</span>
				</v-col>
			</v-row>

			<v-divider class="mx-6 my-2" /> -->

			<v-card-item>
				<div class="text-overline">Happening on</div>

				<v-chip-group v-if="days.length > 0">
					<v-menu
						v-for="(day, i) in days"
						:key="i"
						v-model="menus.days[i]"
						location="top start"
						origin="top start"
						transition="scale-transition"
						:disabled="Date.now() > new Date(day.date).getTime()"
					>
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" pill link :text="new Date(day.date).toLocaleDateString(undefined, options.short)" :disabled="Date.now() > new Date(day.date).getTime()" />
						</template>

						<v-card width="max-content">
							<v-list bg-color="black">
								<v-list-item :title="(new Date(day.date)).toLocaleDateString(undefined, options.long)" :subtitle="day.times.length + (day.times.length === 1 ? ` time` : ' times') + ' available'" prepend-icon="fa fa-calendar">
									<template v-slot:append>
										<v-list-item-action>
											<v-btn icon="fa fa-times-circle" variant="text" @click="menus.days[i] = false" />
										</v-list-item-action>
									</template>
								</v-list-item>
							</v-list>

							<v-card-text>
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
										<template v-slot:activator="{ props }">
											<v-chip v-bind="props" pill link :text="time" :disabled="Date.now() > new Date(day.date + 'T' + time).getTime()" />
										</template>

										<v-card width="max-content">
											<v-list bg-color="black">
												<v-list-item :title="time" :subtitle="(new Date(day.date)).toLocaleDateString(undefined, options.long)" prepend-icon="fa fa-clock">
													<template v-slot:append>
														<v-list-item-action>
															<v-btn icon="fa fa-times-circle" variant="text" @click="menus.times[day.date + 'T' + time] = false" />
														</v-list-item-action>
													</template>
												</v-list-item>
											</v-list>

											<v-list>
												<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="() => $router.push({ name: 'ticketing', query: { event: event.id, date: day.date, time } })" />
											</v-list>
										</v-card>
									</v-menu>
								</v-chip-group>
							</v-card-text>

							<v-list>
								<v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="() => $router.push({ name: 'ticketing', query: { event: event.id, date: day.date } })" />
							</v-list>
						</v-card>
					</v-menu>
				</v-chip-group>

				<v-chip-group v-else column>
					<v-chip pill link text="No days available yet" disabled />
				</v-chip-group>
			</v-card-item>

			<!-- <v-divider class="mx-6 my-2" />

			<v-card-text>
				Experience the wonders of nature as you hike through the snow-capped mountains and fish in the nearby river.
				This newly built cabin is perched high in the mountains with beautiful views.
				It comfortably sleeps 4 people and includes a dining room, living room, sauna, and fully stocked kitchen.
			</v-card-text> -->

			<v-divider class="my-1" />

			<v-card-actions>
				<span class="d-flex align-center">
					<v-icon icon="fa fa-dollar" color="green" />
					<b class="text-h6">{{ event.price }}</b>&nbsp;
					<span class="text-overline">per seat</span>
				</span>
				<!-- <v-btn color="secondary" variant="outlined" v-text="'See Event'" @click="() => $router.push({ name: 'event', params: { id: event.id } })" /> -->
				<v-spacer />
				<v-btn :disabled="days.length < 1" :color="days.length < 1 ? 'gray' : 'primary'" variant="elevated" v-text="'Book Now'" @click="() => $router.push({ name: 'ticketing', query: { event: event.id } })" />
			</v-card-actions>
		</v-card>
	<!-- </v-dialog> -->
</template>

<style>
.card-bg > img {
	filter: brightness(0.5) blur(3px);
}
</style>