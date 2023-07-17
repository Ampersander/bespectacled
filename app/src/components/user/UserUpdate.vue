<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import type { User } from '@/types/user'
import Form from '@/components/user/UserForm.vue'
import Loading from '@/components/common/Loading.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import { useUserStore, useUtilsStore } from '@/store'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()
const utilsStore = useUtilsStore()

const { userCreateStore, userUpdateStore, userDeleteStore } = useUserStore()

const { created } = storeToRefs(userCreateStore)

const { isLoading: deleteLoading, error: deleteError } = storeToRefs(userDeleteStore)

const { retrieved: item, updated, isLoading, error, violations, } = storeToRefs(userUpdateStore)

useMercureItem({ store: userUpdateStore, deleteStore: userDeleteStore, redirectRouteName: 'UserList' })

await userUpdateStore.retrieve(decodeURIComponent(route.params.id as string))

// ApiPlatform wants IRIs for relations
async function update(item: User) {
	await userUpdateStore.update(item)
	utilsStore.showToast('User updated!')
}

onBeforeUnmount(() => {
	userUpdateStore.$reset()
	userCreateStore.$reset()
	userDeleteStore.$reset()
})
</script>

<template>
	<Toolbar :breadcrumb="breadcrumb" :is-loading="isLoading" />

	<v-container fluid>
		<v-alert v-if="error || deleteError" type="error" class="mb-4" v-text="error || deleteError" closable />

		<v-alert v-if="created || updated" type="success" class="mb-4" closable>
			<template v-if="created">
				{{ $t('itemCreated', [created['@type'], created['username']]) }}
			</template>

			<template v-else-if="updated">
				{{ $t('itemUpdated', [updated['@type'], updated['username']]) }}
			</template>
		</v-alert>

		<Form v-if="item" :values="item" :errors="violations" @submit="update" />
	</v-container>

	<Loading :visible="isLoading || deleteLoading" />
</template>