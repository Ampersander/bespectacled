<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify/labs/date'

import BackToTop from '@/components/common/BackToTop.vue'
import { useAuthStore, useEventListStore, useScheduleListStore, useUserListStore, useUtilsStore, useVenueListStore } from '@/store'

const date = useDate()
const theme = useTheme()
const router = useRouter()
const utilsStore = useUtilsStore()

const store = useAuthStore()
const { user } = storeToRefs(store)

const userListStore = useUserListStore()
const { items: users, totalItems: totalUsers, error: userError, isLoading: userIsLoading } = storeToRefs(userListStore)

const eventListStore = useEventListStore()
const { items: events, totalItems: totalEvents, error: eventError, isLoading: eventIsLoading } = storeToRefs(eventListStore)

const venueListStore = useVenueListStore()
const { items: venues, totalItems: totalVenues, error: venueError, isLoading: venueIsLoading } = storeToRefs(venueListStore)

const scheduleListStore = useScheduleListStore()
const { items: schedules, totalItems: totalSchedules, error: scheduleError, isLoading: scheduleIsLoading } = storeToRefs(scheduleListStore)

const page = ref('1')
const order = ref({})
const search = ref('')
const dialog = ref(false)
const drawer = ref(false)
const tab = ref<number | undefined>(undefined)
const total = computed(() => ({ Users: totalUsers.value, Events: totalEvents.value, Venues: totalVenues.value, Schedules: totalSchedules.value } as const))

const categories = computed(() => [
	{ name: 'Users', icon: 'fa fa-user-tie', to: '/users', key: 'username', children: users.value as [] },
	{ name: 'Events', icon: 'fa fa-star', to: '/events', key: 'title', children: events.value as [] },
	{ name: 'Venues', icon: 'fa fa-location-dot', to: '/venues', key: 'name', children: venues.value as [] },
	{ name: 'Schedules', icon: 'fa fa-calendar-days', to: '/schedules', key: 'date', children: schedules.value as [] }
] as const)

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
	await userListStore.getItems({ page: page.value, order: order.value })
	await eventListStore.getItems({ page: page.value, order: order.value })
	await venueListStore.getItems({ page: page.value, order: order.value })
	await scheduleListStore.getItems({ page: page.value, order: order.value })
}

sendRequest()

const debounce = (func: () => void, delay = 500) => {
	const t = setTimeout(() => func(), delay)
	return () => clearTimeout(t)
}

const registerShortcuts = (e: KeyboardEvent) => {
	// @ts-ignore
	if (e.key === '/' && /[^input|textarea|select]/i.test(e.target.tagName)) dialog.value = true
	if (e.ctrlKey && /^k/i.test(e.key)) dialog.value = true
	if (e.ctrlKey && e.altKey && /^[d|t]/i.test(e.key)) toggle()
}

const toggle = () => {
	utilsStore.toggle()
	theme.global.name.value = utilsStore.dark ? 'dark' : 'light'
}

const logout = () => store.logout()

onBeforeMount(() => theme.global.name.value = utilsStore.dark ? 'dark' : 'light')

// Register shortcuts
onMounted(() => window.addEventListener('keydown', registerShortcuts))
onUnmounted(() => window.removeEventListener('keydown', registerShortcuts))

watchEffect(() => {
	let val = router.currentRoute.value.path
	if (val.startsWith('/admin/users')) tab.value = 0
	else if (val.startsWith('/admin/events')) tab.value = 1
	else if (val.startsWith('/admin/venues')) tab.value = 2
	else if (val.startsWith('/admin/schedules')) tab.value = 3
	else tab.value = undefined
})

// watch(() => search.value, val => { val && debounce(() => sendRequest()) })
</script>

<template>
	<v-app :dark="utilsStore.dark">
		<v-app-bar class="ps-4" color="pink-accent-4" density="compact" app flat>
			<v-progress-linear class="position-fixed" :active="utilsStore.isLoading" color="white" indeterminate />

			<template #prepend>
				<v-app-bar-nav-icon class="me-4" :icon="'fa ' + (drawer ? 'fa-times' : 'fa-bars fa-fade')" @click="drawer = !drawer" />
				<v-btn prepend-icon="fa fa-glasses" color="white" @click="router.push('/admin')">BeSpectacled Admin</v-btn>

				<v-dialog v-model="dialog" width="500" height="90%" scrollable>
					<template #activator="{ props }">
						<v-btn :="props" prepend-icon="fa fa-search">
							Search
							<div class="py-1 px-2 ms-2 border rounded text-disabled text-caption">Press /</div>
						</v-btn>
					</template>

					<template #="{ isActive }">
						<v-card>
							<v-toolbar color="pink-accent-4" title="Manage BeSpectacled">
								<template #prepend>
									<v-icon icon="fa fa-glasses ms-4" size="24" />
								</template>

								<v-btn icon="fa fa-times" @click="isActive.value = false" />
							</v-toolbar>

							<v-text-field
								v-model.trim="search"
								prepend-inner-icon="fa fa-search"
								:autofocus="isActive.value"
								name="search"
								label="Looking for..."
								density="comfortable"
								placeholder="users, events, venues, schedules..."
								hide-details
							/>

							<v-card-text>
								<v-list v-if="search" lines="one" density="compact">
									<template v-for="{ name, icon, to, key, children } in filteredCategories" :key="name">
										<p><router-link class="text-high-emphasis font-weight-black text-uppercase" :to="'/admin' + to">Manage {{ name }}</router-link></p>
										<v-list-item :prepend-icon="icon" v-for="child in children" :key="child" :title="child[key]" @click="router.push('/admin' + to + '/show/' + child?.id); isActive.value = false">
											<v-list-item-title v-if="name === 'Schedules'">{{ date.format(new Date(child[key]), 'normalDateWithWeekday') }} - {{ child?.event?.title }}</v-list-item-title>
											<v-list-item-title v-else>{{ child[key] }}</v-list-item-title>
										</v-list-item>
									</template>
								</v-list>

								<v-container v-else class="h-100 d-flex flex-column align-center justify-center">
									<v-icon class="mb-6 text-disabled" icon="fab fa-searchengin" size="150" />
									<v-list-subheader class="d-inline ">Your search results will appear here</v-list-subheader>
								</v-container>
							</v-card-text>
						</v-card>
					</template>
				</v-dialog>

				<v-menu v-if="$vuetify.display.smAndDown">
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" append-icon="fa fa-ellipsis-vertical" text="More" />
					</template>

					<v-sheet>
						<v-tabs v-model="tab" direction="vertical">
							<v-tab v-for="{ name, icon, to }, i in categories.slice(0, -1)" :key="i" :prepend-icon="icon" color="secondary" :value="name" @click="router.push('/admin' + to)">
								<v-badge color="pink" :content="total[name]" location="top left" floating>
									{{ name }}
								</v-badge>
							</v-tab>
						</v-tabs>
					</v-sheet>
				</v-menu>

				<v-tabs v-else v-model="tab">
					<v-tab v-for="{ name, icon, to }, i in categories.slice(0, -1)" :key="i" :prepend-icon="icon" color="secondary" :value="name" @click="router.push('/admin' + to)">
						<v-badge color="surface" :content="total[name]" location="top left" floating>
							{{ name }}
						</v-badge>
					</v-tab>
				</v-tabs>
			</template>

			<v-spacer></v-spacer>

			<v-btn v-if="user" prepend-icon="fa fa-arrow-right" variant="outlined" @click="router.push('/')">Return to Main Site</v-btn>
			<v-btn v-else prepend-icon="fa fa-right-to-bracket" @click="router.push('/login')">Login</v-btn>
			<v-btn :icon="theme.global.current.value.dark ? 'fa fa-sun' : 'fa fa-moon'" @click="toggle" />
		</v-app-bar>

		<v-navigation-drawer v-model="drawer" expand-on-hover rail>
			<v-list v-if="user">
				<v-list-item prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
					:title="user?.username || 'John Doe'"
					:subtitle="user?.email || 'john@doe.com'"
				>
					<template #append>
						<v-btn variant="text" icon="fa fa-pen" @click="router.push('/profile')" />
					</template>
				</v-list-item>

				<v-list-item prepend-icon="fa fa-id-card" title="Profile" @click="router.push('/profile')" />
				<v-list-item prepend-icon="fa fa-sign-out-alt" title="Logout" @click.prevent="logout" />
			</v-list>

			<v-list v-else>
				<v-list-item prepend-icon="fa fa-sign-in-alt" title="Login" @click="router.push('/login')" />
				<v-list-item prepend-icon="fa fa-user-plus" title="Register" @click="router.push('/register')" />
			</v-list>

			<v-divider />

			<v-list density="compact" nav>
				<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" append-icon="fa fa-list" :title="`Manage ${name}`" @click="router.push('/admin' + to)" />
			</v-list>

			<v-list density="compact" nav>
				<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" append-icon="fa fa-plus-circle" :title="`Create ${name.slice(0, -1)}`" @click="router.push('/admin' + to + '/create')" />
			</v-list>
		</v-navigation-drawer>

		<!-- Message Toast -->
		<v-snackbar :="utilsStore.toast" elevation="24" transition="slide-y-transition">
			{{ utilsStore.toast.text }}

			<template #actions>
				<v-btn icon="fa fa-times" color="white" @click="utilsStore.hideToast()" />
			</template>
		</v-snackbar>

		<BackToTop />

		<v-main style="--v-layout-top: 48px;">
			<v-container class="mb-7">
				<router-view v-slot="{ Component }">
					<keep-alive>
						<component :is="Component" :key="$route.fullPath"></component>
					</keep-alive>
				</router-view>
			</v-container>
		</v-main>
	</v-app>
</template>

<style>
.v-toolbar {
	transition: all .2s ease;
}

.v-toolbar__prepend {
	margin-inline-start: 0 !important;
}

.v-navigation-drawer .v-list-item:not(:hover) .v-icon {
	transition: opacity .4s ease;
	opacity: 1;
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