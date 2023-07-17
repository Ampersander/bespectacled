<script setup lang="ts">
import { ref, type Ref } from 'vue'

const props = defineProps<{
	type?: string
	values?: string[]
	label: string
}>()

const emit = defineEmits<{
	(e: 'update', values: string[]): void
}>()

// TODO transform to const
let fields: Ref<string[]> = ref([])

if (props.values) fields.value.push(...props.values)

const addField = () => fields.value.push('')

const updateField = (index: number, value: string) => {
	fields.value.splice(index, 1, value.trim())
	emitUpdate()
}

const removeField = (index: number) => {
	fields.value.splice(index, 1)
	emitUpdate()
}

const emitUpdate = () => emit('update', fields.value.filter((review) => review.length))
</script>

<template>
	<div>
		<div class="text-body-1">
			<span class="mr-2">{{ label }}</span>
			<v-btn color="secondary" v-text="$t('add')" @click="addField" />
		</div>

		<div class="my-4">
			<v-text-field
				v-for="(field, i) in fields"
				:key="i"
				v-model="fields[i]"
				:type="type"
				@update:model-value="(value: string) => updateField(i, value)"
				append-inner-icon="fa fa-trash"
				@click:append-inner="removeField(i)"
			/>
		</div>
	</div>
</template>