<script setup lang="ts">
import { ref } from 'vue'

import type { BreadcrumbValue } from '@/types/breadcrumb'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDelete from '@/components/common/ConfirmDelete.vue'

defineProps<{
	main?: boolean
	color?: string
	partnered?: any
	isLoading: boolean
	breadcrumb: BreadcrumbValue[]
	nav?: { prev: any, next: any }
	actions?: ('submit' | 'reset' | 'add' | 'edit' | 'delete' | 'detach' | 'partnered')[]
}>()

const emit = defineEmits<{
	(e: 'submit'): void
	(e: 'reset'): void
	(e: 'add'): void
	(e: 'edit'): void
	(e: 'delete'): void
	(e: 'detach'): void
	(e: 'partner'): void
	(e: 'cancelPartner'): void
	(e: 'nav', id: string): void
}>()

const confirm = ref(false)
</script>

<template>
	<v-toolbar class="mb-4 sticky-top sticky-nav" :color="color ?? 'pink-accent-4'" elevation="12" dark rounded>
		<Breadcrumb :main="main" :breadcrumb="breadcrumb" />

		<v-spacer />

		<div v-if="nav" class="mx-4">
			<v-btn :disabled="!nav?.prev" class="me-4 float-start" size="small" variant="tonal" icon="fa fa-chevron-left" @click="emit('nav', nav.prev.id as string)" />
			<v-btn :disabled="!nav?.next" class="float-end" size="small" variant="tonal" icon="fa fa-chevron-right" @click="emit('nav', nav.next.id as string)" />
		</div>

		<template v-if="!partnered?.roles.includes('ROLE_ARTIST')">
			<v-btn v-if="actions?.includes('partnered') && partnered?.roles.includes('ASK_TO_BECOME_ARTIST')" class="fill-height m-0 bg-dark rounded-0" prepend-icon="fa fa-cancel" :text="$t('cancelPartner')" @click="emit('cancelPartner')" />
			<v-btn v-if="actions?.includes('partnered') && !partnered?.roles.includes('ASK_TO_BECOME_ARTIST')" class="fill-height m-0 bg-dark rounded-0" prepend-icon="fa fa-user-tie" :text="$t('partner')" @click="emit('partner')" />
		</template>

		<v-btn v-if="actions?.includes('add')" class="fill-height m-0 bg-success rounded-0" prepend-icon="fa fa-plus-circle" :text="$t('add')" @click="emit('add')" />
		<v-btn v-if="actions?.includes('edit')" class="fill-height m-0 bg-warning rounded-0" prepend-icon="fa fa-pen-to-square" :text="$t('edit')" @click="emit('edit')" />
		<v-btn v-if="actions?.includes('delete')" class="fill-height m-0 bg-danger rounded-0" prepend-icon="fa fa-trash-can" :text="$t('delete')" @click="confirm = !confirm" />

		<ConfirmDelete v-if="actions?.includes('delete')" :show="confirm" @delete="() => { confirm = !confirm; emit('delete') }" @cancel="confirm = !confirm" />
	</v-toolbar>
</template>