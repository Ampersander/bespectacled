<script setup lang="ts">
import { ref, Ref, toRef } from "vue";
import { VForm } from "vuetify/components";

import type { Schedule } from "@/types/schedule";
import type { SubmissionErrors } from "@/types/error";
import FormRepeater from '@/components/common/FormRepeater.vue';

const props = defineProps<{
	values?: Schedule;
	errors?: SubmissionErrors;
}>();

const violations = toRef(props, "errors");

const item: Ref<Schedule> = ref({} as Schedule);

if (props.values) {
	item.value = {
		...props.values,
		event: props.values.event["@id"],
	};
}

const emit = defineEmits<{
	(e: "submit", item: Schedule): void;
}>();

function emitSubmit() {
	emit("submit", item.value);
}

const form: Ref<VForm | null> = ref(null);

function resetForm() {
	if (!form.value) return;

	form.value.reset();
}
</script>

<template>
	<v-form ref="form" @submit.prevent="emitSubmit">
		<v-row>
			<v-col cols="12" sm="6" md="6">
				<v-text-field v-model="item.date" :error="Boolean(violations?.date)" :error-messages="violations?.date"
					:label="$t('schedule.date')">
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.date = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<FormRepeater :values="item.times" :label="$t('schedule.times')" @update="(values: any) => item.times = values" />

				<!-- <v-text-field v-model="item.times" :error="Boolean(violations?.times)" :error-messages="violations?.times"
					:label="$t('schedule.times')" required>
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.times = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field> -->
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<v-text-field v-model="item.event" :error="Boolean(violations?.event)" :error-messages="violations?.event"
					:label="$t('schedule.event')">
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.event = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
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