<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useAuthStore, useEventListStore, useScheduleListStore, useUserListStore, useUtilsStore, useVenueListStore } from '@/store'

const $theme = useTheme()
const $router = useRouter()
const $store = useAuthStore()
const $utilsStore = useUtilsStore()

const $userListStore = useUserListStore()
const { items: users, totalItems: totalUsers, error: userError, isLoading: userIsLoading } = storeToRefs($userListStore)

const $eventListStore = useEventListStore()
const { items: events, totalItems: totalEvents, error: eventError, isLoading: eventIsLoading } = storeToRefs($eventListStore)

const $venueListStore = useVenueListStore()
const { items: venues, totalItems: totalVenues, error: venueError, isLoading: venueIsLoading } = storeToRefs($venueListStore)

const $scheduleListStore = useScheduleListStore()
const { items: schedules, totalItems: totalSchedules, error: scheduleError, isLoading: scheduleIsLoading } = storeToRefs($scheduleListStore)

const page = ref('1')
const order = ref({})
const search = ref('')
const dialog = ref(false)
const drawer = ref(false)
const user = computed(() => $store.user)

const categories = computed(() => [
	{ name: 'Users', icon: 'fa fa-user-tie', to: '/users', key: 'username', children: users.value as [] },
	{ name: 'Events', icon: 'fa fa-star', to: '/events', key: 'title', children: events.value as [] },
	{ name: 'Venues', icon: 'fa fa-location-dot', to: '/venues', key: 'name', children: venues.value as [] },
	{ name: 'Schedules', icon: 'fa fa-calendar-days', to: '/schedule', key: 'date', children: schedules.value as [] }
])

const filteredCategories = computed(() => {
	const filtered = categories.value.filter(c => c.children.length > 0).map(c => {
		return { ...c, children: c.children.filter((child: any) => child[c.key].toLowerCase().includes(search.value.toLowerCase())) as any[] }
	})

	// Merge schedules with the same date
	const formatted = filtered.map(c => {
		if (c.name === 'Schedules') {
			const dates = c.children.map((child: any) => child[c.key])
			const uniqueDates = [...new Set(dates)]
			const children = uniqueDates.map((date: any) => {
				const schedules = c.children.filter((child: any) => child[c.key] === date)
				delete schedules[0]?.event
				delete schedules[0]?.['@id']
				return { ...schedules[0], schedules }
			})

			return { ...c, children }
		}

		return c
	})

	return formatted
})

const sendRequest = async () => {
	await $userListStore.getItems({ page: page.value, order: order.value })
	await $eventListStore.getItems({ page: page.value, order: order.value })
	await $venueListStore.getItems({ page: page.value, order: order.value })
	await $scheduleListStore.getItems({ page: page.value, order: order.value })
}

const debounce = (func: () => void, delay = 500) => {
	const t = setTimeout(() => func(), delay)
	return () => clearTimeout(t)
}

const registerShortcuts = (e: KeyboardEvent) => {
	if (e.key === '/') dialog.value = true
	if (e.ctrlKey && e.altKey && e.key === 't') toggle()
}

const toggle = () => {
	$utilsStore.toggle()
	// $theme.global.name.value = $store.state.theme.dark ? 'dark' : 'light'
	$theme.global.name.value = $utilsStore.dark ? 'dark' : 'light'
}

const logout = () => $store.logout()

const resendVerificationEmail = () => {
	// TODO $store.dispatch('auth/resendVerificationEmail')
	alert('This feature has not been implemented yet.')
}

onBeforeMount(() => $theme.global.name.value = $utilsStore.dark ? 'dark' : 'light')

// Register shortcuts
onMounted(() => window.addEventListener('keydown', registerShortcuts))
onUnmounted(() => window.removeEventListener('keydown', registerShortcuts))

watch(() => search.value, val => { val && debounce(() => sendRequest()) })
</script>

<template>
	<v-app :dark="$utilsStore.dark">
		<v-app-bar color="pink-accent-4" density="compact" app>
			<template #prepend>
				<v-app-bar-nav-icon @click.stop="drawer = !drawer" />
				<v-btn prepend-icon="fa fa-glasses" color="white" @click="$router.push('/admin')">BeSpectacled Admin</v-btn>

				<v-dialog v-model="dialog" scrollable>
					<template #activator="{ props }">
						<v-btn prepend-icon="fa fa-search" v-bind="props">Search</v-btn>
					</template>

					<template #default="{ isActive }">
						<v-card>
							<v-toolbar color="primary" title="Search BeSpectacled">
								<v-btn icon="fa fa-times" @click="isActive.value = false" />
							</v-toolbar>

							<v-text-field
								v-model.trim="search"
								prepend-inner-icon="fa fa-search"
								density="comfortable"
								label="Search for..."
								name="search"
								placeholder="e.g. artists, events, etc..."
								hide-details
								:autofocus="isActive.value"
							/>

							<v-card-text>
								<v-list v-if="search" lines="one" density="compact">
									<template v-for="{ name, icon, to, key, children } in filteredCategories" :key="name">
										<p><router-link class="text-high-emphasis font-weight-black text-uppercase" :to="'/admin' + to">Manage {{ name }}</router-link></p>
										<v-list-item :prepend-icon="icon" v-for="child in children" :key="child" :title="child[key]" @click="$router.push('/admin' + to + '/show/' + child?.id); isActive.value = false" />
									</template>
								</v-list>

								<v-container v-else class="text-center">
									<v-icon class="mb-6 text-disabled" icon="fab fa-searchengin" size="150" />
									<v-list-subheader class="d-inline ">Your search results will appear here</v-list-subheader>
								</v-container>
							</v-card-text>
						</v-card>
					</template>
				</v-dialog>
			</template>

			<v-spacer></v-spacer>

			<v-btn v-if="user" prepend-icon="fa fa-arrow-right" variant="outlined" @click="$router.push('/')">Return to Main Site</v-btn>
			<v-btn v-else prepend-icon="fa fa-right-to-bracket" @click="$router.push('/login')">Login</v-btn>
			<v-btn :icon="$theme.global.current.value.dark ? 'fa fa-sun' : 'fa fa-moon'" @click="toggle" />
		</v-app-bar>

		<v-navigation-drawer v-model="drawer" expand-on-hover rail>
			<v-list v-if="user">
				<v-list-item prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
					:title="user?.username || 'John Doe'"
					:subtitle="user?.email || 'john@doe.com'"
				>
					<template #append>
						<v-btn variant="text" icon="fa fa-pen" @click="$router.push('/profile')" />
					</template>
				</v-list-item>

				<v-list-item prepend-icon="fa fa-id-card" title="Profile" @click="$router.push('/profile')" />
				<v-list-item prepend-icon="fa fa-sign-out-alt" title="Logout" @click.prevent="logout" />
			</v-list>

			<v-list v-else>
				<v-list-item prepend-icon="fa fa-sign-in-alt" title="Login" @click="$router.push('/login')" />
				<v-list-item prepend-icon="fa fa-user-plus" title="Register" @click="$router.push('/register')" />
			</v-list>

			<v-divider />

			<v-list density="compact" nav>
				<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" append-icon="fa fa-list" :title="`Manage ${name}`" @click="$router.push('/admin' + to)" />
			</v-list>

			<v-list density="compact" nav>
				<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" append-icon="fa fa-plus-circle" :title="`Create ${name.slice(0, -1)}`" @click="$router.push('/admin' + to + 'create')" />
			</v-list>
		</v-navigation-drawer>

		<v-main>
			<v-banner v-if="user && user?.roles.includes('ROLE_UNVERIFIED')" class="align-center" lines="one" icon="$info" color="info" sticky>
				<v-banner-text>
					You need to verify your email address before you can continue.
				</v-banner-text>

				<template #actions>
					<v-btn @click="resendVerificationEmail">Resend verification email</v-btn>
				</template>
			</v-banner>

			<v-container>
				<router-view />
			</v-container>
		</v-main>
	</v-app>
</template>

<style>
.v-toolbar {
	transition: all .2s ease;
}

.v-banner {
	z-index: 2;
	top: 3.4em !important;
}

.v-overlay__content {
	max-width: 70vw !important;
}

.v-list-item + :not(.v-list-item) {
	margin-top: 1em;
}

.v-divider {
	opacity: 1 !important;
	width: 100%;
}
</style>