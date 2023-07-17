<script setup lang="ts">
const emit = defineEmits<{
	(e: 'filter'): void
	(e: 'reset'): void
}>()
</script>

<template>
	<v-expansion-panels>
		<v-expansion-panel>
			<v-expansion-panel-title>
				{{ $t('filters') }}

				<template #actions>
					<v-icon icon="fa fa-filter fa-lg" />
				</template>
			</v-expansion-panel-title>

			<v-expansion-panel-text>
				<slot name="filter" />
				<v-btn color="primary" v-text="$t('filter')" @click="emit('filter')" />
				<v-btn color="primary" v-text="$t('reset')" class="ml-2" variant="text" @click="emit('reset')" />
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>