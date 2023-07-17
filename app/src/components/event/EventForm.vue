<script setup lang="ts">
import { computed, ref, Ref, toRef, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
import { VForm } from 'vuetify/components'

import type { Event } from '@/types/event'
import { useDate } from 'vuetify/labs/date'
import type { SubmissionErrors } from '@/types/error'
import { useMercureList } from '@/composables/mercureList'
import { useScheduleStore, useUserStore, useVenueStore } from '@/store'

const props = defineProps<{
	values?: Event
	errors?: SubmissionErrors
}>()

const violations = toRef(props, 'errors')

const date = useDate()

const { venueDeleteStore, venueListStore } = useVenueStore()
const { items: venues, totalItems: totalVenues, error: venueError, isLoading: venueIsLoading } = storeToRefs(venueListStore)

const { userDeleteStore, userListStore } = useUserStore()
const { items: users, totalItems: totalUsers, error: userError, isLoading: userIsLoading } = storeToRefs(userListStore)

const { scheduleDeleteStore, scheduleListStore } = useScheduleStore()
const { items: schedules, totalItems: totalSchedules, error: scheduleError, isLoading: scheduleIsLoading } = storeToRefs(scheduleListStore)

const page = ref('1')
const order = ref({})
const item: Ref<Event> = ref({} as Event)
const search = ref({ user: '', venue: '', schedule: '' })
// TODO Doc says to use DOMPurify but maybe use marked's native sanitize option instead
const output = computed(() => marked(item.value.description || '<i class="text-muted">Preview your description here...</i>', { mangle: false, headerIds: false }))

if (props.values) item.value = { ...props.values }

const emit = defineEmits<{ (e: 'submit', item: Event): void }>()

const form: Ref<VForm | null> = ref(null)

const sendRequest = async (model: 'User' | 'Venue' | 'Schedule') => {
	if (model === 'User') await userListStore.getArtists({ page: page.value, order: order.value })
	if (model === 'Venue') await venueListStore.getItems({ page: page.value, order: order.value })
	if (model === 'Schedule') await scheduleListStore.getItems({ page: page.value, order: order.value })
}

useMercureList({ store: userListStore, deleteStore: userDeleteStore })
useMercureList({ store: venueListStore, deleteStore: venueDeleteStore })
useMercureList({ store: scheduleListStore, deleteStore: scheduleDeleteStore })

const debounce = (func: () => void, delay = 500) => {
	const t = setTimeout(() => func(), delay)
	return () => clearTimeout(t)
}

const resetForm = () => {
	if (!form.value) return
	form.value.reset()
}

watch(search, val => {
	if (val.user) {
		page.value = '1'
		order.value = {}
	}
})

// watch item and replace venue, artists ands schedules by their ids
watch(() => search.value.venue, val => { val && val !== item.value.venue?.name && debounce(() => sendRequest('Venue')) })
watch(() => search.value.user, val => { val && !item.value.artists?.some(_ => _.username === val) && debounce(() => sendRequest('User')) })
watch(() => search.value.schedule, val => { val && !item.value.schedules?.some(_ => date.format(new Date(_.date), 'Y-m-d') === val) && debounce(() => sendRequest('Schedule')) })
// TODO use vue-validate and use assertions in Entities
</script>

<template>
	<v-form ref="form" @submit.prevent="emit('submit', item)">
		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model="item.title"
					autofocus
					autocapitalize
					prepend-icon="fa fa-font text-primary"
					:label="$t('event.title')"
					:error="Boolean(violations?.title)"
					:error-messages="violations?.title"
					required
					clearable
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<v-select
					v-model="item.type"
					:items="['broadway', 'concert', 'other']"
					:item-value="item => item.toLowerCase()"
					prepend-icon="fa fa-folder text-orange"
					:label="$t('event.type')"
					:error="Boolean(violations?.type)"
					:error-messages="violations?.type"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model.number="item.price"
					prepend-icon="fa fa-dollar-sign text-yellow"
					:label="$t('event.price')"
					:error="Boolean(violations?.price)"
					:error-messages="violations?.price"
					required
					clearable
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<!-- TODO use v-file-input instead -->
				<v-text-field
					v-model="item.src"
					prepend-icon="fa fa-image text-blue"
					:label="$t('event.src')"
					:error="Boolean(violations?.src)"
					:error-messages="violations?.src"
					required
					clearable
				/>
			</v-col>

			<!-- Automatically created, admin will edit later if needed -->
			<!-- <v-col cols="12">
				<v-text-field
					v-model="item.slug"
					autofocus
					autocapitalize
					prepend-icon="fa fa-link text-secondary"
					:label="$t('event.slug')"
					:error="Boolean(violations?.slug)"
					:error-messages="violations?.slug"
					required
					clearable
				/>
			</v-col> -->

			<v-col cols="12">
				<v-row>
					<v-col class="pe-0" cols="12" sm="6">
						<v-textarea
							v-model="item.description"
							class="input"
							:="{ ['prepend-' + ($vuetify.display.smAndUp ? '' : 'inner-') + 'icon']: 'fa fa-text-width text-white'}"
							:label="$t('event.description')"
							:error="Boolean(violations?.description)"
							:error-messages="violations?.description"
							@update:model-value="item.description = DOMPurify.sanitize($event)"
						/>
					</v-col>

					<v-col class="mb-5 pe-0" cols="12" sm="6">
						<v-card class="fill-height">
							<v-card-text v-html="output" />
						</v-card>
					</v-col>
				</v-row>
			</v-col>

			<v-col cols="12">
				<v-autocomplete
					v-model="item.venue"
					v-model:search="search.venue"
					prepend-icon="fa fa-location-dot text-green"
					append-icon="fa fa-plus-circle text-success"
					:items="venues"
					item-title="name"
					item-value="@id"
					:error="Boolean(violations?.venue)"
					:error-messages="violations?.venue"
					:label="$t('event.venue')"
					:hint="`${item.venue?.name}, ${item.venue?.type}`"
					:loading="venueIsLoading"
					required
					clearable
					hide-no-data
					return-object
					auto-select-first
					@click:append="$router.push({ name: 'VenueCreate' })"
				/>
			</v-col>

			<!-- <v-col cols="12">
				<FormRepeater :values="item.artists" :label="$t('event.artists')" @update="(values: any) => item.artists = values" />
			</v-col> -->

			<v-col cols="12">
				<v-autocomplete
					v-model="item.artists"
					v-model:search="search.user"
					prepend-icon="fa fa-users text-pink"
					append-icon="fa fa-plus-circle text-success"
					:items="users"
					item-title="username"
					item-value="@id"
					:error="Boolean(violations?.artists)"
					:error-messages="violations?.artists"
					:label="$t('event.artists')"
					:loading="userIsLoading"
					chips
					multiple
					required
					clearable
					hide-no-data
					return-object
					closable-chips
					auto-select-first
					@click:append="$router.push({ name: 'UserCreate' })"
				/>
			</v-col>

			<v-col cols="12">
				<v-autocomplete
					v-model="item.schedules"
					v-model:search="search.schedule"
					prepend-icon="fa fa-clock"
					append-icon="fa fa-plus-circle text-success"
					:items="schedules.filter(s => s.event === undefined)"
					item-title="date"
					item-value="@id"
					:error="Boolean(violations?.schedules)"
					:error-messages="violations?.schedules"
					:label="$t('event.schedules')"
					:loading="scheduleIsLoading"
					chips
					multiple
					clearable
					hide-no-data
					return-object
					closable-chips
					auto-select-first
					@click:append="$router.push({ name: 'ScheduleCreate' })"
				>
					<template v-slot:item="{ props, item }">
						<v-list-item
							v-bind="props"
							:title="item?.raw?.date"
							:subtitle="item?.raw?.times.join(' • ')"
						></v-list-item>
					</template>
				</v-autocomplete>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-btn color="primary" type="submit">{{ $t("submit") }}</v-btn>
				<v-btn color="primary" variant="text" class="ml-2" v-text="$t('reset')" @click="form?.reset()" />
			</v-col>
		</v-row>
	</v-form>
</template>