<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { BreadcrumbValue } from '@/types/breadcrumb'

const { t } = useI18n()
const props = defineProps<{ main?: boolean, breadcrumb: BreadcrumbValue[] }>()
const items = [{ title: t(props.main ? 'home' : 'admin'), href: props.main ? '/' : '/admin' }, ...props.breadcrumb]
</script>

<template>
	<v-breadcrumbs class="m-0" :items="items" active-color="disabled">
		<template #divider>
			<v-icon icon="fa fa-arrow-right" />
		</template>
	</v-breadcrumbs>
</template>

<style>
.v-breadcrumbs-item--active {
	font-size: 20px;
	font-weight: bold;
	opacity: 1 !important;
}
</style>