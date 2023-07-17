<script setup lang="ts">
import { ref } from 'vue'

import type { User } from '@/types/user'

defineProps<{ user: User }>()

const menus = ref<{ events: boolean[] }>({ events: [] })
</script>

<template>
	<v-card class="mx-auto my-auto" width="350" elevation="8" rounded>
		<template #loader="{ isActive }">
			<v-progress-linear :active="isActive" color="primary" indeterminate />
		</template>

		<!-- <v-img v-if="typeof user.src === 'string'" class="card-bg" :src="user.src" height="250" cover> -->
			<!-- <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
				<template #prepend>
					<v-btn icon="fa fa-arrow-left" />
				</template>

				<template #append>
					<v-btn icon="fa fa-ellipsis-vertical" />
				</template>
			</v-toolbar> -->
		<!-- </v-img> -->

		<v-card-item>
			<v-card-title v-text="user.username" />

			<v-card-subtitle>
				<span class="me-1">Starring in {{ user.events.length }} event{{ user.events.length === 1 ? '' : 's' }}</span>
			</v-card-subtitle>

			<v-chip-group v-if="user.events.length > 0" mandatory>
				<v-menu v-for="(event, i) in user.events" :key="i" v-model="menus.events[i]" location="top start" origin="top start" transition="scale-transition">
					<template #activator="{ props }">
						<v-chip v-bind="props" link pill>
							<v-avatar start :image="event.src" icon="fa fa-star" />
							{{ event.title }}
						</v-chip>
					</template>

					<v-card width="max-content">
						<v-list bg-color="black">
							<v-list-item :title="event.title" :subtitle="`Min. $${event.price} per seat`" :prepend-avatar="event.src">
								<template #append>
									<v-list-item-action>
										<v-btn icon variant="text" @click="menus.events[i] = false">
											<v-icon icon="fa fa-times-circle" />
										</v-btn>
									</v-list-item-action>
								</template>
							</v-list-item>
						</v-list>

						<v-list>
							<v-list-item link prepend-icon="fa fa-circle-info" title="View Event Details" @click="() => $router.push({ name: 'event', params: { id: event.id } })" />
							<v-list-item link prepend-icon="fa fa-calendar-days" title="Check Available Times" @click="() => $router.push({ name: 'calendar', query: { event: event.id } })" />
							<!-- <v-list-item link prepend-icon="fa fa-ticket" title="Book Event" @click="() => $router.push({ name: 'ticketing', query: { event: event.id } })" /> -->
						</v-list>
					</v-card>
				</v-menu>
			</v-chip-group>

			<v-chip v-else link pill disabled>
				<v-avatar icon="fa fa-location-dot" start />
				No events specified
			</v-chip>
		</v-card-item>

		<!-- <v-divider class="mx-6 my-2" /> -->

		<!-- <v-card-text class="m-3 p-0 clamp" v-text="user.description" /> -->

		<v-divider class="my-1" />

		<v-card-actions>
			<!-- <v-icon icon="fa fa-dollar" color="yellow" />

			<div class="text-h6">
				<b>{{ user.price }}</b>
				<small class="text-overline"> per day</small>
			</div> -->

			<v-spacer />

			<v-btn color="primary" variant="elevated" v-text="'See More'" @click="() => $router.push({ name: 'artist', params: { id: user.id } })" />
		</v-card-actions>
	</v-card>
</template>