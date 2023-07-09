<script setup lang="ts">
import { ref, Ref, toRef } from 'vue'
import { VForm } from 'vuetify/components'

import type { Item } from '@/types/item'
import type { Venue } from '@/types/venue'
import type { SubmissionErrors } from '@/types/error'
import FormRepeater from '@/components/common/FormRepeater.vue'

const props = defineProps<{
	values?: Venue
	errors?: SubmissionErrors
}>()

const violations = toRef(props, 'errors')

const events = ref(null)
const item: Ref<Venue> = ref({} as Venue)

if (props.values) item.value = { ...props.values }

const emit = defineEmits<{ (e: 'submit', item: Venue): void }>()

// TODO example to use for ref declarations
const form: Ref<VForm | null> = ref(null)

const resetForm = () => {
	if (!form.value) return
	form.value.reset()
}

// TODO use vue-validate and use assertions in Entities
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

			<v-col cols="12">
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