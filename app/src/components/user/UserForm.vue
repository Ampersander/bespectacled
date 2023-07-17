<script setup lang="ts">
import { computed, ref, Ref, toRef, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { storeToRefs } from 'pinia'
import { VForm } from 'vuetify/components'

import type { Item } from '@/types/item'
import type { User } from '@/types/user'
import { useDate } from 'vuetify/labs/date'
import { formatDateInput } from '@/utils/date'
import type { SubmissionErrors } from '@/types/error'
import FormRepeater from '@/components/common/FormRepeater.vue'

const props = defineProps<{
	values?: User
	errors?: SubmissionErrors
}>()

const violations = toRef(props, 'errors')

const date = useDate()

const item: Ref<User> = ref({} as User)

if (props.values) {
	item.value = {
		...props.values,
		// events: props.values.events?.map((item: Item) => item['@id'] ?? '') ?? [],
		// tickets: props.values.tickets?.map((item: Item) => item['@id'] ?? '') ?? [],
		// bookings: props.values.bookings?.map((item: Item) => item['@id'] ?? '') ?? [],
		// publicationDate: formatDateInput(props.values.publicationDate)
	}
}

const emit = defineEmits<{ (e: 'submit', item: User): void }>()

const form: Ref<VForm | null> = ref(null)

function resetForm() {
	if (!form.value) return
	form.value.reset()
}
</script>

<template>
	<v-form ref="form" @submit.prevent="emit('submit', item)">
		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model="item.username"
					autofocus
					autocapitalize
					prepend-icon="fa fa-font text-primary"
					:label="$t('user.username')"
					:error="Boolean(violations?.username)"
					:error-messages="violations?.username"
					required
					clearable
				/>
			</v-col>

			<!-- <v-col cols="12" sm="6" md="6">
				<v-text-field
					v-model="item.email"
					autofocus
					autocapitalize
					prepend-icon="fa fa-envelope text-primary"
					:label="$t('user.email')"
					:error="Boolean(violations?.email)"
					:error-messages="violations?.email"
					required
					clearable
				/>
			</v-col> -->

			<v-col cols="12" sm="6" md="6">
				<!-- <FormRepeater :values="item.roles" :label="$t('user.roles')" @update="(values: any) => item.roles = values" /> -->

				<!-- TODO Remove "ROLE_" prefix -->
				<v-select
					v-model="item.roles"
					:items="['ROLE_USER', 'ROLE_ADMIN', 'ROLE_ARTIST', 'ASK_TO_BECOME_ARTIST']"
					:item-value="item => item"
					prepend-icon="fa fa-boxes-stacked text-orange"
					:label="$t('event.roles')"
					:error="Boolean(violations?.roles)"
					:error-messages="violations?.roles"
					chips
					multiple
					required
					clearable
					hide-no-data
					closable-chips
					auto-select-first
				/>
			</v-col>

			<!-- TODO item.enabled is false here when true in database -->
			<!-- <v-col cols="12" sm="6" md="6">
				<v-switch v-model="item.enabled" :prepend-icon="'fa fa-toggle-' + (item.enabled ? 'on' : 'off')" color="success" label="Enabled" />
			</v-col> -->
		</v-row>

		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-btn color="primary" type="submit">{{ $t("submit") }}</v-btn>

				<v-btn color="primary" variant="text" class="ml-2" @click="resetForm">
					{{ $t("reset") }}
				</v-btn>
			</v-col>
		</v-row>
	</v-form>
</template>