<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useDate } from 'vuetify/labs/date'

import Carousel from '@/components/custom/Carousel.vue'
import NotFound from '@/components/custom/NotFound.vue'
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
const scroll = ref(0)
const search = ref('')
const dialog = ref(false)
const drawer = ref(false)
const tab = ref<number | undefined>(-1)
const scrolled = computed(() => scroll.value > 50)

const icons = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

// const backgroundImage = {
// 	events: 'src/assets/stadium.jpeg'
// }[$router.currentRoute.value.name]

const categories = computed(() => [
	{ name: 'Artists', icon: 'fa fa-user-tie', to: '/artists', key: 'username', children: users.value as [] },
	{ name: 'Events', icon: 'fa fa-star', to: '/events', key: 'title', children: events.value as [] },
	{ name: 'Venues', icon: 'fa fa-location-dot', to: '/venues', key: 'name', children: venues.value as [] },
	{ name: 'Calendar', icon: 'fa fa-calendar-days', to: '/calendar', key: 'date', children: schedules.value as [] }
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
	await Promise.all([
		useUserListStore().getArtists({ page: page.value, order: order.value, username: search.value }),
		useEventListStore().getItems({ page: page.value, order: order.value }),
		useVenueListStore().getItems({ page: page.value, order: order.value, name: search.value }),
		useScheduleListStore().getItems({ page: page.value, order: order.value, 'event.value': search.value })
	])
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

const resendVerificationEmail = () => {
	// TODO $store.dispatch('auth/resendVerificationEmail')
	alert('This feature has not been implemented yet.')
}

onBeforeMount(() => theme.global.name.value = utilsStore.dark ? 'dark' : 'light')

// Register shortcuts
onMounted(() => window.addEventListener('keydown', registerShortcuts))
onUnmounted(() => window.removeEventListener('keydown', registerShortcuts))

watchEffect(() => {
	let val = router.currentRoute.value.path
	if (val.startsWith('/artists')) tab.value = 0
	else if (val.startsWith('/events')) tab.value = 1
	else if (val.startsWith('/venues')) tab.value = 2
	else if (val.startsWith('/schedules')) tab.value = 3
	else tab.value = undefined
})

// watch(() => search.value, val => { val && debounce(() => sendRequest()) })
</script>

<template>
	<v-app :dark="utilsStore.dark">
		<!-- <v-parallax style="background-size: cover;" :src="backgroundImage"> -->
			<v-app-bar class="ps-4" :height="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 100"  :color="scrolled ? 'primary' : 'transparent'" :elevation="scrolled ? 4 : 0" density="compact" v-scroll="(e: any) => scroll = e.target.scrollingElement.scrollTop" app flat>
				<v-progress-linear class="position-fixed" :active="utilsStore.isLoading" color="white" indeterminate />

				<template #prepend>
					<v-app-bar-nav-icon class="me-4" :icon="'fa ' + (drawer ? 'fa-times' : 'fa-bars fa-fade')" @click="drawer = !drawer" />
					<v-btn prepend-icon="fa fa-glasses" :color="scrolled ? 'white' : 'primary'" :size="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" @click="router.push({ name: 'home' })">BeSpectacled</v-btn>

					<v-dialog v-model="dialog" width="500" height="90%" scrollable>
						<template #activator="{ props }">
							<v-btn :="props" prepend-icon="fa fa-search" :size="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 'x-large'">
								Search
								<div class="py-1 px-2 ms-2 border rounded text-disabled text-caption">Press /</div>
							</v-btn>					
						</template>		

						<template #="{ isActive }">
							<v-card>
								<v-toolbar color="primary" title="Browse BeSpectacled">
									<template #prepend>
										<v-icon icon="fa fa-glasses ms-4" size="24" />
									</template>

									<v-btn icon="fa fa-times" @click="isActive.value = false" />
								</v-toolbar>

								<v-text-field
									v-model.trim="search"
									class="flex-grow-0"
									prepend-inner-icon="fa fa-search"
									:autofocus="isActive.value"
									name="search"
									label="Looking for..."
									density="comfortable"
									placeholder="artists, events, venues, schedules..."
									hide-details
								/>

								<v-card-text>
									<v-list v-if="search" lines="one" density="compact">
										<template v-for="{ name, icon, to, key, children } in filteredCategories" :key="name">
											<p><router-link class="text-high-emphasis font-weight-black text-uppercase" :to="to">{{ name }}</router-link></p>
											<v-list-item v-for="child in children" :key="child" :prepend-icon="icon" @click="router.push(to + '/' + child.id); isActive.value = false">
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
							<v-btn v-bind="props" append-icon="fa fa-ellipsis-vertical" :size="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" text="More" />
						</template>

						<v-sheet>
							<v-tabs v-model="tab" direction="vertical">
								<v-tab v-for="{ name, icon, to }, i in categories.slice(0, -1)" :key="i" :prepend-icon="icon" color="secondary" :value="name" @click="router.push(to)">
									{{ name }}
								</v-tab>
							</v-tabs>
						</v-sheet>
					</v-menu>

					<v-tabs v-else v-model="tab">
						<v-tab v-for="{ name, icon, to }, i in categories.slice(0, -1)" :key="i" :prepend-icon="icon" color="secondary" :value="name" @click="router.push(to)">
							{{ name }}
						</v-tab>
					</v-tabs>
					
				</template>

				<template #append>
					<v-btn v-if="user?.token" prepend-icon="fa fa-id-card" :color="scrolled ? 'white' : 'primary'" :size="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" variant="outlined" @click="router.push('/profile')">Profile</v-btn>
					<v-btn v-else prepend-icon="fa fa-right-to-bracket" :color="scrolled ? 'white' : 'primary'" :size="scrolled || router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" @click="router.push('/login')">Login</v-btn>
					<v-btn :icon="theme.global.current.value.dark ? 'fa fa-sun' : 'fa fa-moon'" @click="toggle" />
				</template>
			</v-app-bar>

			<v-navigation-drawer v-model="drawer" class="ps-3" :color="scrolled ? 'default' : 'primary'" rail-width="80" expand-on-hover rail data-simplebar>
				<template v-if="user">
					<v-list>
						<v-list-item prepend-icon="fa fa-user-circle" :title="user?.username" :subtitle="user?.email">
							<template #append>
								<v-btn variant="text" icon="fa fa-pen" @click="router.push('/profile')" />
							</template>

							<v-progress-linear v-if="!user?.username" color="primary" rounded indeterminate />
						</v-list-item>
					</v-list>

					<v-divider />

					<v-list density="default" nav>
						<v-list-item prepend-icon="fa fa-id-card" title="Profile" @click="router.push('/profile')" />
						<v-list-item v-if="user.roles?.includes('ROLE_ADMIN')" prepend-icon="fa fa-gauge" title="Admin Panel" @click="router.push('/admin')" />
						<v-list-item prepend-icon="fa fa-sign-out-alt" title="Logout" @click.prevent="logout" />
					</v-list>
				</template>

				<v-list v-else>
					<v-list-item prepend-icon="fa fa-sign-in-alt" title="Login" @click="router.push('/login')" />
					<v-list-item prepend-icon="fa fa-user-plus" title="Register" @click="router.push('/register')" />
				</v-list>

				<v-divider />

				<v-list density="default" nav>
					<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" :title="name" @click="router.push(to)" />
				</v-list>

				<!-- <template #append>
					<div class="pa-4">
						<v-btn block @click="logout">Logout</v-btn>
					</div>
				</template> -->
			</v-navigation-drawer>

			<!-- Message Toast -->
			<v-snackbar :="utilsStore.toast" elevation="24" transition="slide-y-transition">
				{{ utilsStore.toast.text }}

				<template #actions>
					<v-btn icon="fa fa-times" color="white" @click="utilsStore.hideToast()" />
				</template>
			</v-snackbar>

			<v-main style="--v-layout-top: 48px;">
				<v-banner v-if="user && user?.roles?.includes('ROLE_UNVERIFIED')" class="align-center" icon="$info" color="info" lines="one" sticky>
					<v-banner-text>
						You need to verify your email address before you can continue.
					</v-banner-text>

					<template #actions>
						<v-btn @click="resendVerificationEmail">Resend verification email</v-btn>
					</template>
				</v-banner>

				<Carousel class="mt-n12" v-if="$route.name === 'home'" />
				<NotFound class="mt-n12" v-if="$route.name === 'not-found'" />

				<v-container class="mb-7">
					<router-view v-slot="{ Component }">
						<keep-alive>
							<component :is="Component" :key="$route.fullPath" :scroll="scroll"></component>
						</keep-alive>
					</router-view>
				</v-container>
			</v-main>
		<!-- </v-parallax> -->
	</v-app>
</template>

<style>
.v-banner {
	z-index: 2;
	top: 3.4em !important;
}

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