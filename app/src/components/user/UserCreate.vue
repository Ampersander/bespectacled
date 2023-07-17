<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import type { User } from '@/types/user'
import { useUserCreateStore } from '@/store'
import Form from '@/components/user/UserForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'

const router = useRouter()
const breadcrumb = useBreadcrumb()
const userCreateStore = useUserCreateStore()
const { created, isLoading, violations, error } = storeToRefs(userCreateStore)

async function create(item: User) {
	await userCreateStore.create(item)
	if (!created?.value) return
	router.push({ name: 'UserUpdate', params: { id: created?.value?.['@id'] } })
}

onBeforeUnmount(() => userCreateStore.$reset())
</script>

<template>
	<Toolbar :breadcrumb="breadcrumb" :is-loading="isLoading" />

	<v-container fluid>
		<v-alert v-if="error" type="error" class="mb-4" closable v-text="error" />
		<Form :errors="violations" @submit="create" />
	</v-container>

	<Loading :visible="isLoading" />
</template>