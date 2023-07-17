<script setup lang="ts">
import { toRef } from 'vue'

import { useUtilsStore } from '@/store'

const props = defineProps<{ show: boolean }>()

const show = toRef(props, 'show')
const $utilsStore = useUtilsStore()

const emit = defineEmits<{
	(e: 'cancel'): void
	(e: 'delete'): void
}>()
</script>

<template>
	<v-dialog v-model="show" persistent width="300">
		<v-card>
			<v-card-text v-text="$t('confirmDelete')" />

			<v-card-actions>
				<v-spacer />
				<v-btn color="error darken-1" :loading="$utilsStore.isLoading" v-text="$t('delete')" @click="emit('delete')" />
				<v-btn color="secondary darken-1" :disabled="$utilsStore.isLoading" v-text="$t('cancel')" @click.stop="emit('cancel')" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>