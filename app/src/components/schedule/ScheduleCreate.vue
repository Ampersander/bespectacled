<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import type { Schedule } from '@/types/schedule'
import { useScheduleCreateStore } from '@/store'
import Form from '@/components/schedule/ScheduleForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'

const router = useRouter()
const breadcrumb = useBreadcrumb()
const scheduleCreateStore = useScheduleCreateStore()
const { created, isLoading, violations, error } = storeToRefs(scheduleCreateStore)

async function create(item: Schedule) {
	await scheduleCreateStore.create(item)
	if (!created?.value) return
	router.push({ name: 'ScheduleUpdate', params: { id: created?.value?.['@id'] } })
}

onBeforeUnmount(() => scheduleCreateStore.$reset())
</script>

<template>
	<Toolbar :breadcrumb="breadcrumb" :is-loading="isLoading" />

	<v-container fluid>
		<v-alert v-if="error" type="error" class="mb-4" closable v-text="error" />
		<Form :errors="violations" @submit="create" />
	</v-container>

	<Loading :visible="isLoading" />
</template>