<script setup lang="ts">
import { ref } from 'vue'

import ConfirmDelete from '@/components/common/ConfirmDelete.vue'

defineProps<{ actions?: ('show' | 'update' | 'delete')[] }>()

const emit = defineEmits<{
	(e: 'show'): void
	(e: 'update'): void
	(e: 'delete'): void
}>()

const confirm = ref(false)
</script>

<template>
	<v-tooltip :text="$t('show')">
		<template #activator="{ props }">
			<v-btn v-bind="props" v-if="actions?.includes('show')" class="rounded-e-0" icon="fa fa-eye" color="primary" size="x-small" :rounded="false" @click="emit('show')" />
		</template>
	</v-tooltip>

	<v-tooltip :text="$t('edit')">
		<template #activator="{ props }">
			<v-btn v-bind="props" v-if="actions?.includes('update')" class="rounded-0" icon="fa fa-pen-to-square" color="warning" size="x-small" :rounded="false" @click="emit('update')" />
		</template>
	</v-tooltip>

	<v-tooltip :text="$t('delete')">
		<template #activator="{ props }">
			<v-btn v-bind="props" v-if="actions?.includes('delete')" class="rounded-s-0" icon="fa fa-trash-can" color="danger" size="x-small" :rounded="false" @click="confirm = !confirm" />
		</template>
	</v-tooltip>

	<ConfirmDelete v-if="actions?.includes('delete')" :show="confirm" @delete="() => { confirm = !confirm;  emit('delete'); }" @cancel="confirm = !confirm" />
</template>