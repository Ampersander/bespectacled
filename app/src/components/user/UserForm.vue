<script setup lang="ts">
import { ref, Ref, toRef } from "vue";
import { VForm } from "vuetify/components";
import { formatDateInput } from "@/utils/date";
import FormRepeater from "@/components/common/FormRepeater.vue";
import type { Item } from "@/types/item";
import type { User } from "@/types/user";
import type { SubmissionErrors } from "@/types/error";

const props = defineProps<{
	values?: User;
	errors?: SubmissionErrors;
}>();

const violations = toRef(props, "errors");

const item: Ref<User> = ref({} as User);

if (props.values) {
	item.value = {
		...props.values,
		events: props.values.events?.map((item: Item) => item["@id"] ?? "") ?? [],
		tickets: props.values.tickets?.map((item: Item) => item["@id"] ?? "") ?? [],
		bookings: props.values.bookings?.map((item: Item) => item["@id"] ?? "") ?? [],
		publicationDate: formatDateInput(props.values.publicationDate),
		publicationDate: formatDateInput(props.values.publicationDate),
		publicationDate: formatDateInput(props.values.publicationDate),
	};
}

const emit = defineEmits<{
	(e: "submit", item: User): void;
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
				<v-text-field v-model="item.username" :error="Boolean(violations?.username)"
					:error-messages="violations?.username" :label="$t('user.username')" required>
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.username = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<v-text-field v-model="item.email" :error="Boolean(violations?.email)" :error-messages="violations?.email"
					:label="$t('user.email')" required>
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.email = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<v-text-field v-model="item.password" :error="Boolean(violations?.password)"
					:error-messages="violations?.password" type="password" :label="$t('user.password')">
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.password = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<FormRepeater :values="item.roles" :label="$t('user.roles')" @update="(values: any) => item.roles = values" />
				<!-- <v-text-field v-model="item.roles" :error="Boolean(violations?.roles)" :error-messages="violations?.roles"
					:label="$t('user.roles')">
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.roles = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field> -->
			</v-col>
			<v-col cols="12" sm="6" md="6">
				<v-text-field v-model="item.enabled" :error="Boolean(violations?.enabled)"
					:error-messages="violations?.enabled" :label="$t('user.enabled')">
					<template #append-inner>
						<v-icon style="cursor: pointer" @click.prevent.stop="item.enabled = undefined">
							mdi-close
						</v-icon>
					</template>
				</v-text-field>
			</v-col>
			<v-col cols="12">
				<FormRepeater :values="item.events" :label="$t('user.events')" @update="(values: any) => (item.events = values)" />
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