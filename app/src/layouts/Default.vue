<script setup>
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'

import { useAuthStore, useUtilsStore } from '@/store'
import Carousel from '@/components/custom/Carousel.vue'

import UserService from '@/services/user.service'
import EventService from '@/services/event.service'
import VenueService from '@/services/venue.service'
import { storeToRefs } from 'pinia'

const $theme = useTheme()
const $router = useRouter()
const $store = useAuthStore()
const $utilsStore = useUtilsStore()

const { user, error } = storeToRefs($store)

const tab = ref(null)
const search = ref('')
const dialog = ref(false)
const drawer = ref(false)
const scrolled = ref(false)

user.value = JSON.parse(localStorage.getItem('user') || 'null')

const icons = {
	broadway: 'fa fa-mask',
	concert: 'fa fa-microphone',
	other: 'fa fa-question'
}

const backgroundImage = {
	events: 'src/assets/stadium.jpeg'
}[$router.currentRoute.value.name]

const categories = ref([
	{ name: 'Artists', icon: 'fa fa-user', to: '/artists', key: 'username', children: [] },
	{ name: 'Events', icon: 'fa fa-star', to: '/events', key: 'title', children: [] },
	{ name: 'Venues', icon: 'fa fa-location-dot', to: '/venues', key: 'name', children: [] },
	{ name: 'Calendar', icon: 'fa fa-calendar-days', to: '/calendar' },
	{ name: 'Ticketing', icon: 'fa fa-ticket', to: '/ticketing' }
])

const filteredCategories = computed(() => {
	return categories.value.filter(c => c?.children?.length > 0).map(c => {
		return { ...c, children: c.children.filter(child => child[c.key].toLowerCase().includes(search.value.toLowerCase())) }
	})
})

const sendRequest = async () => {
	await useEventListStore().getItems({ page: page.value, order: order.value })

	// Make a promise all to get all the data when it's available
	const [artists, events, venues] = await Promise.all([
		useUserListStore().getItems({ page: page.value, order: order.value }),
		useEventListStore().getItems({ page: page.value, order: order.value }),
		useVenueListStore().getItems({ page: page.value, order: order.value })
	])
}

const registerShortcuts = e => {
	if (e.key === '/') dialog.value = true
	if (e.ctrlKey && e.altKey && e.key === 't') toggle()
}

const toggle = () => {
	$utilsStore.toggle()
	$theme.global.name.value = $utilsStore.dark ? 'dark' : 'light'
}

const logout = () => $store.logout()

const resendVerificationEmail = () => {
	// TODO $store.dispatch('auth/resendVerificationEmail')
	alert('This feature has not been implemented yet.')
}

onBeforeMount(() => $theme.global.name.value = $utilsStore.dark ? 'dark' : 'light')

onMounted(async () => {
	// Register shortcuts
	window.addEventListener('keydown', registerShortcuts)

	// Load data for the search bar
	const { data: artists } = await UserService.artists()
	categories.value.find(c => c.name === 'Artists').children = artists

	const { data: events } = await EventService.all()
	categories.value.find(c => c.name === 'Events').children = events

	const { data: venues } = await VenueService.all()
	categories.value.find(c => c.name === 'Venues').children = venues
})

onUnmounted(() => window.removeEventListener('keydown', registerShortcuts))
</script>

<template>
	<v-app :dark="$utilsStore.dark">
		<!-- <v-parallax style="background-size: cover;" :src="backgroundImage"> -->
			<v-app-bar class="ps-4" :height="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 100" :elevation="scrolled ? 4 : 0"  :color="scrolled ? 'primary' : 'transparent'" density="compact" v-scroll="e => scrolled = e.target.scrollingElement.scrollTop > 50" app flat>
				<v-progress-linear class="position-fixed" :active="$utilsStore.isLoading" color="white" indeterminate />

				<template #prepend>
					<v-app-bar-nav-icon class="me-4" :icon="'fa ' + (drawer ? 'fa-times' : 'fa-bars fa-fade')" @click="drawer = !drawer" />
					<v-btn prepend-icon="fa fa-glasses" :color="scrolled ? 'white' : 'primary'" :size="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" @click="$router.push({ name: 'home' })">BeSpectacled</v-btn>

					<v-dialog v-model="dialog" width="500" height="90%" scrollable>
						<template #activator="{ props }">
							<v-btn v-bind="props" prepend-icon="fa fa-search" :size="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 'x-large'">
								Search
								<div class="py-1 px-2 ms-2 border rounded text-disabled text-caption">Press /</div>
							</v-btn>
						</template>

						<template #default="{ isActive }">
							<v-card>
								<v-toolbar color="primary" title="Search BeSpectacled">
									<template #prepend>
										<v-icon icon="fa fa-glasses ms-4" size="24" />
									</template>

									<v-btn icon="fa fa-times" @click="isActive.value = false" />
								</v-toolbar>

								<v-text-field
									v-model.trim="search"
									:autofocus="isActive.value"
									class="flex-grow-0"
									prepend-inner-icon="fa fa-search"
									name="search"
									label="Looking for..."
									density="comfortable"
									placeholder="artists, events, etc..."
									hide-details
								/>

								<v-card-text>
									<v-list v-if="search" lines="one" density="compact">
										<template v-for="{ name, icon, to, key, children } in filteredCategories" :key="name">
											<div class="text-high-emphasis font-weight-black text-uppercase" @click="$router.push(to)">{{ name }}</div>
											<v-list-item v-for="child in children" :key="child" :prepend-icon="icon" :title="child[key]" @click="$router.push(to + '/' + child.id); isActive.value = false" />
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
							<v-btn v-bind="props" append-icon="fa fa-ellipsis-vertical" :size="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" text="More" />
						</template>

						<v-sheet>
							<v-tabs v-model="tab" direction="vertical">
								<v-tab v-for="(icon, type, i) in icons" :key="i" :prepend-icon="icon" color="primary" :value="type" @click="$router.push({ name: 'events', query: { type } })">
									{{ type.charAt(0).toUpperCase() + type.slice(1) }}
								</v-tab>
							</v-tabs>
						</v-sheet>
					</v-menu>

					<v-tabs v-else v-model="tab">
						<v-tab v-for="(icon, type, i) in icons" :key="i" :prepend-icon="icon" :color="scrolled ? undefined : 'primary'" :value="type" @click="$router.push({ name: 'events', query: { type } })">
							{{ type.charAt(0).toUpperCase() + type.slice(1) }}
						</v-tab>
					</v-tabs>
				</template>

				<template #append>
					<v-btn v-if="user?.token" prepend-icon="fa fa-id-card" :color="scrolled ? 'white' : 'primary'" :size="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" variant="outlined" @click="$router.push('/profile')">Profile</v-btn>
					<v-btn v-else prepend-icon="fa fa-right-to-bracket" :color="scrolled ? 'white' : 'primary'" :size="scrolled || $router.currentRoute.value.name !== 'home' ? undefined : 'x-large'" @click="$router.push('/login')">Login</v-btn>
					<v-btn :icon="$theme.global.current.value.dark ? 'fa fa-sun' : 'fa fa-moon'" @click="toggle" />
				</template>
			</v-app-bar>

			<v-navigation-drawer v-model="drawer" class="ps-3" :color="scrolled ? 'default' : 'primary'" rail-width="80" expand-on-hover rail data-simplebar>
				<template v-if="user">
					<v-list>
						<v-list-item prepend-icon="fa fa-user-circle" :title="user?.username" :subtitle="user?.email">
							<template #append>
								<v-btn variant="text" icon="fa fa-pen" @click="$router.push('/profile')" />
							</template>

							<v-progress-linear v-if="!user?.username" color="primary" rounded indeterminate />
						</v-list-item>
					</v-list>

					<v-divider />

					<v-list density="default" nav>
						<v-list-item prepend-icon="fa fa-id-card" title="Profile" @click="$router.push('/profile')" />
						<v-list-item v-if="user.roles?.includes('ROLE_ADMIN')" prepend-icon="fa fa-gauge" title="Admin Panel" @click="$router.push('/admin')" />
						<v-list-item prepend-icon="fa fa-sign-out-alt" title="Logout" @click.prevent="logout" />
					</v-list>
				</template>

				<v-list v-else>
					<v-list-item prepend-icon="fa fa-sign-in-alt" title="Login" @click="$router.push('/login')" />
					<v-list-item prepend-icon="fa fa-user-plus" title="Register" @click="$router.push('/register')" />
				</v-list>

				<v-divider />

				<v-list density="default" nav>
					<v-list-item v-for="{ name, icon, to } in categories" :key="name" :prepend-icon="icon" :title="name" @click="$router.push(to)" />
				</v-list>

				<!-- <template #append>
					<div class="pa-4">
						<v-btn block @click="logout">Logout</v-btn>
					</div>
				</template> -->
			</v-navigation-drawer>

			<!-- Message Toast -->
			<v-snackbar :="$utilsStore.toast" elevation="24" transition="slide-y-transition">
				{{ $utilsStore.toast.text }}

				<template #actions>
					<v-btn icon="fa fa-times" color="white" @click="$utilsStore.hideToast()" />
				</template>
			</v-snackbar>

			<v-main style="--v-layout-top: 48px;">
				<v-banner v-if="user && user?.status === 0" class="align-center" icon="$info" color="info" lines="one" sticky>
					<v-banner-text>
						You need to verify your email address before you can continue.
					</v-banner-text>

					<template #actions>
						<v-btn @click="resendVerificationEmail">Resend verification email</v-btn>
					</template>
				</v-banner>

				<Carousel class="mt-n12" v-if="$router.currentRoute.value.name === 'home'" />

				<v-container class="mb-7">
					<router-view v-slot="{ Component }">
						<keep-alive>
							<component :is="Component" :key="$route.fullPath"></component>
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