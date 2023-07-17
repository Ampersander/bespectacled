<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useDate } from 'vuetify/labs/date'
import { useRoute, useRouter } from 'vue-router'

import type { Item } from '@/types/item'
import type { User } from '@/types/user'
import type { Event } from '@/types/event'
import type { Venue } from '@/types/venue'
import type { Schedule } from '@/types/schedule'
import ActionCell from '../common/ActionCell.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useMercureList } from '@/composables/mercureList'
import { useEventStore, useUtilsStore, useUserStore, useVenueStore, useScheduleStore } from '@/store'

const date = useDate()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()
const $utilsStore = useUtilsStore()

const { eventDeleteStore, eventShowStore, eventUpdateStore } = useEventStore()
const { retrieved: item, isLoading, error: eventError } = storeToRefs(eventShowStore)
const { deleted: eventDeleted, error: eventDeleteError } = storeToRefs(eventDeleteStore)

// const { venueShowStore, venueDeleteStore } = useVenueStore()
// const { error: venueError } = storeToRefs(venueShowStore)
// const { deleted: venueDeleted, error: venueDeleteError } = storeToRefs(venueDeleteStore)

const { userShowStore, userDeleteStore } = useUserStore()
const { error: userError } = storeToRefs(userShowStore)
const { deleted: userDeleted, error: userDeleteError } = storeToRefs(userDeleteStore)

const { scheduleShowStore, scheduleDeleteStore } = useScheduleStore()
const { error: scheduleError } = storeToRefs(scheduleShowStore)
const { deleted: scheduleDeleted, error: scheduleDeleteError } = storeToRefs(scheduleDeleteStore)

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const tab = ref(0)

const sendRequest = async () => await eventShowStore.retrieve(decodeURIComponent(route.params.id as string))

useMercureItem({ store: eventShowStore, deleteStore: eventDeleteStore, redirectRouteName: 'EventList' })
useMercureList({ store: scheduleShowStore, deleteStore: scheduleDeleteStore })
useMercureList({ store: userShowStore, deleteStore: userDeleteStore })

sendRequest()

const goToUpdatePage = (item: any) => router.push({ name: 'EventUpdate', params: { id: item.id } })

const deleteItem = async () => {
	if (!item?.value) return eventDeleteStore.setError(t('itemNotFound'))
	await eventDeleteStore.deleteItem(item.value)
	if (!eventDeleted?.value) return
	router.push({ name: 'EventList' })
}

const goToRelationShowPage = (model: 'User' | 'Schedule', relation: Item) => router.push({ name: 'ScheduleShow', params: { id: relation.id } })
const goToRelationCreatePage = (model: 'User' | 'Schedule') => router.push({ name: model + 'Create' })
const goToRelationUpdatePage = (model: 'User' | 'Schedule', relation: Item) => router.push({ name: model + 'Update', params: { id: relation.id } })

const detachRelation = async (model: 'User' | 'Schedule', relation: User | Schedule) => {
	if (!item) return

	if (model === 'User') {
		await eventUpdateStore.update({
			...item.value,
			venue: item.value?.venue?.['@id'],
			artists: item.value?.artists?.filter(_ => _.id !== relation.id).map(artist => artist['@id']),
			schedules: item.value?.schedules?.map(schedule => schedule['@id'])
		} as Event<false>)
	}

	if (model === 'Schedule') {
		await eventUpdateStore.update({
			...item.value,
			venue: item.value?.venue?.['@id'],
			artists: item.value?.artists?.map(artist => artist['@id']),
			schedules: item.value?.schedules?.filter(_ => _.id !== relation	.id).map(schedule => schedule['@id'])
		} as Event<false>)
	}

	sendRequest()
}

const deleteRelation = async (model: 'User' | 'Schedule', item: Item) => {
	if (!item) return
	if (model === 'User') await userDeleteStore.deleteItem(item as User)
	if (model === 'Schedule') await scheduleDeleteStore.deleteItem(item as Schedule)
	sendRequest()
}

onBeforeUnmount(() => eventShowStore.$reset())
watchEffect(() => $utilsStore.setLoading(isLoading.value))
</script>

<template>
	<Toolbar :actions="['edit', 'delete']" :breadcrumb="breadcrumb" :is-loading="isLoading" @edit="goToUpdatePage(item)" @delete="deleteItem" />

	<v-container fluid>
		<!-- TODO can't delete an artist (needs JWT token in the request), should unassign instead -->
		<!-- TODO venue and user deletion alerts don't show up -->
		<!-- TODO remove useless screen loader -->
		<v-alert v-if="eventError || eventDeleteError" type="error" class="mb-4" v-text="eventError || eventDeleteError" closable />
		<!-- <v-alert v-if="venueError || venueDeleteError" type="error" class="mb-4" v-text="venueError || venueDeleteError" closable />
		<v-alert v-if="userError || userDeleteError" type="error" class="mb-4" v-text="userError || userDeleteError" closable /> -->

		<v-tabs v-model="tab" color="primary" fixed-tabs>
			<v-tab value="0" :disabled="!item">General</v-tab>
			<v-tab value="1" :disabled="!item?.venue">Venue</v-tab>
			<v-tab value="2" :disabled="!item?.artists">Artists</v-tab>
			<v-tab value="3" :disabled="!item?.schedules">Schedules</v-tab>
		</v-tabs>

		<v-window v-model="tab">
			<v-window-item v-if="item" value="0">
				<v-table>
					<thead>
						<tr>
							<th>{{ $t('field') }}</th>
							<th>{{ $t('value') }}</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td>{{ $t('event.src') }}</td>

							<td>
								<v-tooltip :text="item.src">
									<template #activator="{ props }">
										<v-img :="props" :src="item.src" max-width="100" max-height="100" />
									</template>
								</v-tooltip>
							</td>
						</tr>

						<tr>
							<td>{{ $t('event.title') }}</td>
							<td>{{ item.title }}</td>
						</tr>

						<tr>
							<td>{{ $t('event.type') }}</td>
							<td>{{ item.type }}</td>
						</tr>

						<tr>
							<td>{{ $t('event.price') }}</td>
							<td>${{ item.price }}</td>
						</tr>

						<tr>
							<td>{{ $t('event.description') }}</td>
							<td>
								<v-card-text v-html="DOMPurify.sanitize(marked(item.description || '<i>Nothing here yet...</i>', { mangle: false, headerIds: false }))" />
							</td>
						</tr>
					</tbody>
				</v-table>
			</v-window-item>

			<v-window-item v-if="item?.venue" value="1">
				<v-table>
					<thead>
						<tr>
							<th>{{ $t('field') }}</th>
							<th>{{ $t('value') }}</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td>{{ $t('venue.src') }}</td>

							<td>
								<v-tooltip :text="item.src">
									<template #activator="{ props }">
										<v-img :src="item.venue.src" max-width="100" max-height="100" />
										<router-link v-if="router.hasRoute('VenueShow')" :="props" :to="{ name: 'VenueShow', params: { id: item.venue.id } }">
										</router-link>

										<v-img v-else :="props" :src="item.venue.src" max-width="100" max-height="100" />
									</template>
								</v-tooltip>
							</td>
						</tr>

						<tr>
							<td>{{ $t('venue.name') }}</td>

							<td>
								<template v-if="router.hasRoute('VenueShow')">
									<router-link :to="{ name: 'VenueShow', params: { id: item.venue.id } }" v-text="item.venue.name" />
								</template>

								<template v-else>{{ item.venue.name }}</template>
							</td>
						</tr>

						<tr>
							<td>{{ $t('venue.type') }}</td>
							<td>{{ item.venue.type }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.price') }}</td>
							<td>${{ item.venue.price }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.seats') }}</td>
							<td>{{ item.venue.seats }}</td>
						</tr>

						<tr>
							<td>{{ $t('venue.description') }}</td>
							<td>
								<v-card-text v-html="DOMPurify.sanitize(marked(item.venue.description || '<i>Nothing here yet...</i>', { mangle: false, headerIds: false }))" />
							</td>
						</tr>
					</tbody>
				</v-table>
			</v-window-item>

			<v-window-item value="2">
				<v-row>
					<v-col cols="12" sm="6">
						<v-btn class="w-100 h-100 d-flex justify-center align-center" :min-height="52 * 3" @click="goToRelationCreatePage('User')">
							<v-icon icon="fa fa-plus-circle" color="success" size="50" />
						</v-btn>
					</v-col>

					<v-hover v-for="artist, i in item?.artists" :key="i" #="{ isHovering, props }" close-delay="200">
						<v-col :="props" cols="12" sm="6">
							<v-table>
								<thead>
									<tr>
										<th>{{ artist?.['@type'] }} #{{ i + 1 }}</th>

										<th>
											<v-fade-transition>
												<v-row v-if="isHovering">
													<ActionCell :actions="['show', 'update', 'delete']" @show="goToRelationShowPage('User', artist)" @update="goToRelationUpdatePage('User', artist)" @delete="deleteRelation('User', artist)" />

													<v-spacer />

													<v-tooltip :text="$t('detach')">
														<template #activator="{ props }">
															<v-btn v-bind="props" icon="fa fa-minus" color="error" size="x-small" :rounded="false" @click="detachRelation('User', artist)" />
														</template>
													</v-tooltip>
												</v-row>
											</v-fade-transition>
										</th>
									</tr>
								</thead>

								<tbody>
									<tr>
										<td>{{ $t('user.username') }}</td>

										<td>
											<template v-if="router.hasRoute('UserShow')">
												<router-link :to="{ name: 'UserShow', params: { id: artist.id } }" v-text="artist.username" />
											</template>

											<template v-else>{{ artist.username }}</template>
										</td>
									</tr>

									<tr>
										<td>{{ $t('user.email') }}</td>
										<td>{{ artist.email }}</td>
									</tr>
								</tbody>
							</v-table>
						</v-col>
					</v-hover>
				</v-row>
			</v-window-item>

			<v-window-item value="3">
				<v-row>
					<v-col cols="12" sm="6" md="4">
						<v-btn class="w-100 h-100 d-flex justify-center align-center" :min-height="52 * 3" @click="goToRelationCreatePage('Schedule')">
							<v-icon icon="fa fa-plus-circle" color="success" size="50" />
						</v-btn>
					</v-col>

					<v-hover v-for="day, i in item?.schedules" :key="i" #="{ isHovering, props }" close-delay="2000">
						<v-col :="props" cols="12" sm="6" md="4">
							<v-table>
								<thead>
									<tr>
										<th>{{ day?.['@type'] }} #{{ i + 1 }}</th>

										<th>
											<v-fade-transition>
												<v-row v-if="isHovering">
													<ActionCell :actions="['show', 'update', 'delete']" @show="goToRelationShowPage('Schedule', day)" @update="goToRelationUpdatePage('Schedule', day)" @delete="deleteRelation('Schedule', day)" />

													<v-spacer />

													<v-tooltip :text="$t('detach')">
														<template #activator="{ props }">
															<v-btn v-bind="props" icon="fa fa-minus" color="error" size="x-small" :rounded="false" @click="detachRelation('Schedule', day)" />
														</template>
													</v-tooltip>
												</v-row>
											</v-fade-transition>
										</th>
									</tr>
								</thead>

								<tbody>
									<tr>
										<td>{{ $t('schedule.date') }}</td>

										<td>
											<template v-if="router.hasRoute('ScheduleShow')">
												<router-link :to="{ name: 'ScheduleShow', params: { id: day.id } }">
													{{ date.format(new Date(day.date), 'normalDateWithWeekday') }}
												</router-link>
											</template>

											<p v-bind="props" v-else>{{ date.format(new Date(day.date), 'normalDateWithWeekday') }}</p>
										</td>
									</tr>

									<tr>
										<td>{{ $t('schedule.times') }}</td>

										<td>
											<v-chip v-for="time in day.times" class="me-1" :text="time" />
										</td>
									</tr>
								</tbody>
							</v-table>
						</v-col>
					</v-hover>
				</v-row>
			</v-window-item>
		</v-window>
	</v-container>

	<Loading :visible="isLoading" />
</template>