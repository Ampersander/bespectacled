<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { useRoute, useRouter } from 'vue-router'
import { email, maxLength, minLength, required } from '@vuelidate/validators'

import { User } from '@/types/user'
import Toolbar from '@/components/common/Toolbar.vue'
import { useBreadcrumb } from '@/composables/breadcrumb'
import { useMercureItem } from '@/composables/mercureItem'
import { useAuthStore, useUserDeleteStore, useUserListStore, useUserShowStore, useUtilsStore } from '@/store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const breadcrumb = useBreadcrumb()
const utilsStore = useUtilsStore()

const auth = useAuthStore()
const { user, isLoading: authIsLoading, error: authError, violations } = storeToRefs(auth)

const deleteStore = useUserDeleteStore()
const { error: deleteError } = storeToRefs(deleteStore)

const userListStore = useUserListStore()
const { items } = storeToRefs(userListStore)

const store = useUserShowStore()
const { retrieved: item, isLoading, error } = storeToRefs(store)

const valid = ref(true)
const showPassword = ref(false)
const tab = ref(route.name === 'profile' ? 0 : 1)
const form = ref<null | typeof import('vuetify/components')['VForm']>(null)
// const output = computed(() => DOMPurify.sanitize(marked(item?.value?.description || '<i class="text-muted">Nothing here yet...</i>', { mangle: false, headerIds: false })))

const nav = computed(() => {
	const index = items.value.findIndex((i: User) => i['@id'] === item?.value?.['@id'])

	return {
		prev: index > 0 ? items.value[index - 1] : null,
		next: index < items.value.length - 1 ? items.value[index + 1] : null
	}
})

const inputs = reactive({
	username: '',
	email: '',
	// password: '',
	// confirmPassword: '',
	// ...user?.value
})

const rules = {
	username: { required, minLength: minLength(3), maxLength: maxLength(20) },
	email: { required, email, maxLength: maxLength(50) }
}

const tabs = [
	{ text: 'general', 'prepend-icon': 'fa fa-info', if: route.name === 'profile' },
	// { text: 'events', 'prepend-icon': 'fa fa-star', if: true },
	{ text: 'events', 'prepend-icon': 'fa fa-star', if: true },
	// { text: 'tickets', 'prepend-icon': 'fa fa-ticket', if: true },
	{ text: 'tickets', 'prepend-icon': 'fa fa-ticket', if: route.name === 'profile' }
]

const formats: Record<string, Intl.DateTimeFormatOptions> = {
	weekday: { weekday: 'long' },
	short: { month: 'short', day: 'numeric' },
	long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
}

// if (route.name !== 'profile') tabs.shift()

const icons: Record<string, string> = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const v$ = useVuelidate(rules, inputs)

useMercureItem({ store, deleteStore, redirectRouteName: 'artists' })

if (router.currentRoute.value.name === 'profile') {
	store.setRetrieved(user?.value as User)
	await store.getProfile()
	inputs.username = user?.value?.username ?? ''
	inputs.email = user?.value?.email ?? ''
} else if (router.currentRoute.value.name === 'artist' && route.params.id) {
	await store.retrieve(decodeURIComponent(String(route.params.id)))
	// if item doesn't have ROLE_ARTIST role, redirect to 404
	if (!item?.value?.roles?.includes('ROLE_ARTIST')) router.replace({ name: 'not-found' })
	// if item is the same as the logged in user, redirect to profile
	if (item?.value?.id === user?.value?.id) router.replace({ name: 'profile' })
}

const silentPush = async (id: string) => {
	await store.retrieve(id) // if we don't do this, the navigation won't work as intended
	router.push({ name: 'event', params: { id } })

	// if we use this, it will be smoother but won't update the last breadcrumb
	// history.pushState(null, '', route.path.replace(route.params.id as string, id))
}

const handleEditProfile = async (payload: any) => {
	if (!valid.value) return

	utilsStore.setLoading(true)

	try {
		await auth.editProfile(payload)
		await store.getProfile()
		if (!item?.value) return
		utilsStore.showToast('Profile updated!')
	} catch (err: any) {
		utilsStore.showToast('Failed to update profile!', 'danger')
	} finally {
		utilsStore.setLoading(false)
	}
}

// Send request to become a partnered artist
const partner = async (payload: any) => {
	utilsStore.setLoading(true)

	try {
		await auth.editProfile({ ...payload, roles: [...new Set([...item?.value?.roles || [], 'ASK_TO_BECOME_ARTIST'])] })
		await store.getProfile()
		if (!item?.value) return
		utilsStore.showToast('Thanks for partnering!')
	} catch (err: any) {
		utilsStore.showToast('Failed to partner!', 'danger')
	} finally {
		utilsStore.setLoading(false)
	}
}

// Cancel partnership request
const cancelPartner = async (payload: any) => {
	utilsStore.setLoading(true)

	try {
		await auth.editProfile({ ...payload, roles: [...new Set(item?.value?.roles.filter((r: string) => r !== 'ASK_TO_BECOME_ARTIST'))] })
		await store.getProfile()
		if (!item?.value) return
		utilsStore.showToast('Partnership cancelled!')
	} catch (err: any) {
		utilsStore.showToast('Failed to cancel partnership!', 'danger')
	} finally {
		utilsStore.setLoading(false)
	}
}

onBeforeMount(() => !item?.value && route.name === 'profile' && router.push('/login'))
onBeforeUnmount(() => store.$reset())
</script>

<template>
	<v-alert v-if="error || authError" type="error" class="mb-4" v-text="error || authError" closable />

	<Toolbar v-if="$route.name === 'profile'" color="primary-darken-1" :actions="['partnered']" :breadcrumb="breadcrumb" :is-loading="authIsLoading" main :partnered="item?.roles.includes('ASK_TO_BECOME_ARTIST')" @partner="partner(inputs)" @cancel-partner="cancelPartner(inputs)" />
	<Toolbar v-else color="primary-darken-1" :breadcrumb="[...breadcrumb, { title: item?.username ?? '', to: { name: 'artists' }}]" :is-loading="isLoading || authIsLoading" :nav="nav" main @nav="silentPush" />

	<v-tabs v-model="tab" color="primary" fixed-tabs>
		<template v-for="tab, i in tabs">
			<v-tab v-if="tab.if" :="tab" :value="i" />
		</template>
	</v-tabs>

	<v-window v-if="item" v-model="tab" class="bg-surface-darken-1">
		<v-window-item value="0">
			<v-card v-if="tabs[0].if" :disabled="utilsStore.isLoading || !inputs">
				<v-form ref="form" v-model="valid" @submit.prevent="handleEditProfile(inputs)">
					<v-card-text>
						<v-row>
							<v-col cols="12" sm="6">
								<v-text-field
									v-model="inputs.username"
									:error="Boolean(violations?.username)"
									:error-messages="violations?.username || v$.username?.$errors.map((e: any) => e.$message)"
									:counter="20"
									label="Username*"
									required
									clearable
									@input="v$.username.$touch"
									@blur="v$.username.$touch"
								/>
							</v-col>

							<v-col cols="12" sm="6">
								<v-text-field
									v-model="inputs.email"
									:error="Boolean(violations?.email)"
									:error-messages="violations?.email || v$.email?.$errors.map((e: any) => e.$message)"
									:counter="50"
									label="Email*"
									type="email"
									required
									clearable
									@input="v$.email.$touch"
									@blur="v$.email.$touch"
								/>
							</v-col>
						</v-row>
					</v-card-text>

					<v-card-actions>
						<v-spacer />

						<v-btn :disabled="!v$.$anyDirty" color="primary" @click="form?.reset()" type="reset">Reset</v-btn>
						<v-btn :loading="utilsStore.isLoading" color="primary" variant="elevated" type="submit" @click="v$.$validate">Edit Profile</v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-window-item>

		<v-window-item value="1">
			<v-row v-if="tabs[1].if" v-for="event, i in item.events" :key="i" class="bg-surface-darken-1" style="min-height: 11em;">
				<v-col cols="12" sm="10" order-sm="1">
					<v-card-title class="font-title">
						<router-link v-if="item.id" :to="{ name: 'event', params: { id: event.id }}">
							{{ event.title }}
						</router-link>

						<span class="float-end text-overline text-muted">
							{{ event.type }}
							<v-icon :icon="icons[event.type]" size="md" />
						</span>
					</v-card-title>

					<v-card-text class="mb-4 pb-0 clamp-fade clamp-sm" v-html="DOMPurify.sanitize(marked(event.description, { mangle: false, headerIds: false }))" />
				</v-col>

				<v-col cols="12" sm="2">
					<v-img :src="event.src" :alt="event.title" />
				</v-col>
			</v-row>
		</v-window-item>

		<v-window-item value="2">
			<v-row v-if="tabs[2].if" v-for="ticket, i in item.tickets.filter(_ => _.status === 1)" :key="i" class="bg-surface-darken-1" style="min-height: 11em;">
				<v-col cols="12" sm="10" order-sm="1">
					<v-card-title class="font-title">
						<v-badge color="primary" content="1">
							<v-icon icon="fa fa-ticket" size="md" />
						</v-badge>

						&nbsp;for&nbsp;

						<router-link v-if="ticket.id" :to="{ name: 'event', params: { id: ticket.event.id }}">
							{{ ticket.event.title }}
						</router-link>

						<span class="float-end text-overline text-muted">
							<!-- {{ new Date(ticket.day + 'T' + ticket.hour).toLocaleDateString() }} -->
							{{ (new Date(ticket.day)).toLocaleDateString($vuetify.locale.current, formats.long) }} at {{ ticket.hour }}
						</span>
					</v-card-title>

					<v-card-subtitle v-text="'Reference: ' + ticket.reference" />

					<v-card-text class="mb-4 pb-0 clamp-fade clamp-sm" v-html="DOMPurify.sanitize(marked(ticket.event.description, { mangle: false, headerIds: false }))" />
				</v-col>

				<v-col cols="12" sm="2">
					<v-img :src="ticket.event.src || 'https://fakeimg.pl/260/7750f8/FFF/?text=No%20Image&font=lobster&font_size=50'" :alt="ticket.event.title" />
				</v-col>
			</v-row>
		</v-window-item>
	</v-window>
</template>