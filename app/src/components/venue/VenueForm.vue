<script setup lang="ts">
import { computed, ref, Ref, toRef, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
// import { debounce } from 'lodash-es'
import { VForm } from 'vuetify/components'

import { useEventStore } from '@/store'
import type { Item } from '@/types/item'
import type { Venue } from '@/types/venue'
import type { SubmissionErrors } from '@/types/error'
import { useMercureList } from '@/composables/mercureList'
import FormRepeater from '@/components/common/FormRepeater.vue'

const props = defineProps<{
	values?: Venue
	errors?: SubmissionErrors
}>()

const violations = toRef(props, 'errors')

const { eventDeleteStore, eventListStore } = useEventStore()
const { items: events, totalItems: totalEvents, error: eventError, isLoading: eventIsLoading } = storeToRefs(eventListStore)

const page = ref('1')
const order = ref({})
const search = ref({ event: '' })
const item: Ref<Venue> = ref({} as Venue)
const output = computed(() => DOMPurify.sanitize(marked(item.value.description || '<i class="text-muted">Preview your description here...</i>', { mangle: false, headerIds: false })))

if (props.values) item.value = { ...props.values }

const emit = defineEmits<{ (e: 'submit', item: Venue): void }>()

// TODO example to use for ref declarations
const form: Ref<VForm | null> = ref(null)

const sendRequest = async () => await eventListStore.getItems({ page: page.value, order: order.value })

useMercureList({ store: eventListStore, deleteStore: eventDeleteStore })

const debounce = (func: () => void, delay = 500) => {
	const t = setTimeout(() => func(), delay)
	return () => clearTimeout(t)
}

const resetForm = () => {
	if (!form.value) return
	form.value.reset()
}

watch(search, val => {
	if (val.event) {
		page.value = '1'
		order.value = {}
	}
})

watch(() => search.value.event, val => { val && !item.value.events?.some(_ => _.title === val) && debounce(() => sendRequest()) })
</script>

<template>
	<v-form ref="form" @submit.prvenue="emit('submit', item)">
		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model="item.name"
					:error="Boolean(violations?.name)"
					:error-messages="violations?.name"
					:label="$t('venue.name')"
					required
					prepend-icon="fa fa-font text-primary"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.name = ''"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<!-- TODO use v-select instead -->
				<v-text-field
					v-model="item.type"
					:error="Boolean(violations?.type)"
					:error-messages="violations?.type"
					:label="$t('venue.type')"
					required
					prepend-icon="fa fa-folder text-orange"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.type = ''"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<!-- TODO use modifiers like here when possible -->
				<v-text-field
					v-model.number="item.price"
					:error="Boolean(violations?.price)"
					:error-messages="violations?.price"
					:label="$t('venue.price')"
					required
					prepend-icon="fa fa-dollar-sign text-yellow"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.price = 0"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<!-- TODO use modifiers like here when possible -->
				<v-text-field
					v-model.number="item.seats"
					:error="Boolean(violations?.seats)"
					:error-messages="violations?.seats"
					:label="$t('venue.seats')"
					required
					prepend-icon="fa fa-hashtag text-yellow"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.seats = 0"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model="item.location"
					:error="Boolean(violations?.location)"
					:error-messages="violations?.location"
					:label="$t('venue.location')"
					required
					prepend-icon="fa fa-font text-primary"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.location = ''"
				/>
			</v-col>

			<v-col cols="12" sm="6" md="6">
				<!-- TODO use v-file-input instead -->
				<v-text-field
					v-model="item.src"
					:error="Boolean(violations?.src)"
					:error-messages="violations?.src"
					:label="$t('venue.src')"
					required
					prepend-icon="fa fa-image text-blue"
					append-inner-icon="fa fa-trash text-red"
					@click:append-inner="item.src = undefined"
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

			<!-- TODO add :items="events" -->
			<v-col cols="12">
				<v-autocomplete
					v-model="item.events"
					:error="Boolean(violations?.events)"
					:error-messages="violations?.events"
					:label="$t('venue.events')"
					:items="item.events"
					required
					multiple
					chips
					clearable
					item-title="username"
					item-value="@id"
					prepend-icon="fa fa-star text-warning"
					append-icon="fa fa-plus-circle text-success"
					@click:append="$router.push({ name: 'VenueCreate' })"
				/>
			</v-col>

			<!-- <v-col cols="12">
				<FormRepeater :values="item.events" :label="$t('venue.events')" @update="(values: any) => item.events = values" />
			</v-col> -->
		</v-row>

		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-btn color="primary" type="submit">{{ $t("submit") }}</v-btn>
				<v-btn color="primary" variant="text" class="ml-2" v-text="$t('reset')" @click="form?.reset()" />
			</v-col>
		</v-row>
	</v-form>
</template>