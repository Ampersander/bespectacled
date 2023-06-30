import Vue from 'vue'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

import user from './user'
import event from './event'
import venue from './venue'
import schedule from './schedule'
import { useAuthStore } from '@/store'

// beforeEnter: [to => { ...to, query: {} }, { ...to, hash: '' }],

declare module 'vue-router' {
	interface RouteMeta {
		requires?: string
	}
}

const routes = [
	{
		path: '/admin/', component: () => import('@/layouts/Admin.vue'), meta: { requires: 'admin' }, children: [
			{ path: '', name: 'admin', component: () => import('@/views/admin/HomePage.vue') },
			...user,
			...event,
			...venue,
			...schedule
		]
	},
	{
		path: '/', component: () => import('@/layouts/Default.vue'), children: [
			{ path: '', name: 'home', component: () => import('@/views/default/HomePage.vue') },

			{ path: 'artists', name: 'artists', component: () => import('@/views/default/ArtistsPage.vue') },
			{ path: 'artists/:id', name: 'artist', component: () => import('@/views/default/ProfilePage.vue'), meta: { breadcrumb: [{ title: 'Artists', to: { name: 'artists' } }] } },
			{ path: 'events', name: 'events', component: () => import('@/views/default/EventsPage.vue') },
			{ path: 'events/:id', name: 'event', component: () => import('@/views/event/ViewShow.vue'), meta: { breadcrumb: [{ title: 'Events', to: { name: 'events' } }] } },
			{ path: 'venues', name: 'venues', component: () => import('@/views/default/VenuesPage.vue') },
			{ path: 'venues/:id', name: 'venue', component: () => import('@/views/venue/ViewShow.vue'), meta: { breadcrumb: [{ title: 'Venues', to: { name: 'venues' } }] } },
			{ path: 'calendar', name: 'calendar', component: () => import('@/views/default/CalendarPage.vue'), meta: { breadcrumb: [{ title: 'Calendar', to: { name: 'calendar' } }] } },
			{ path: 'ticketing', name: 'ticketing', component: () => import('@/views/default/TicketingPage.vue') },

			{ path: 'orders', name: 'orders', component: () => import('@/views/default/BlankPage.vue'), meta: { requires: 'auth' } },
			{ path: 'tickets', name: 'tickets', component: () => import('@/views/default/BlankPage.vue'), meta: { requires: 'auth' } },
			{ path: 'profile', name: 'profile', component: () => import('@/views/default/ProfilePage.vue'), meta: { requires: 'auth', breadcrumb: [{ title: 'Profile', to: { name: 'profile' } }] } },

			{ path: 'login', name: 'login', component: () => import('@/views/default/LoginPage.vue'), meta: { requires: 'guest' } },
			{ path: 'register', name: 'register', component: () => import('@/views/default/RegisterPage.vue'), meta: { requires: 'guest' } },
			{ path: 'forgot-password', name: 'forgot-password', component: () => import('@/views/default/ForgotPasswordPage.vue'), meta: { requires: 'guest' } },

			{ path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/default/HomePage.vue') }
		]
	}
]

const router = createRouter({ history: createWebHistory(), routes })

// axios.interceptors.response.use(res => {
// 	console.log(res)
// 	if (res.status === 200) console.log('code 200', res.status)
// 	return Promise.resolve(res)
// }, err => {
// 	console.log('axios.interceptors.response', err.response.status)
// 	// /* THIS WORKS BUT BREAKS THE LOGIN ERROR HANDLING */
// 	if (err.response.status === 401) console.log('token expired', err.response)
// 	return Promise.reject(err)
// })

// Vue.http.interceptors.push((request, next)  => {
// 	request.headers['Authorization'] = headers().Authorization
// 	next((response) => {
// 		if(response.status == 401 ) {
// 			auth.logout()
// 			router.push('/login?unauthorized=1')
// 		}
// 	})
// })

// router.onError(err => {
// 	console.log('router.onError', err)
// })

router.beforeEach((to, from, next) => {
	// console.log('router.beforeEach')
	const auth = useAuthStore()

	if (!to.meta?.requires) next()
	else if (to.meta.requires == 'admin' && !auth?.user?.roles?.includes('ROLE_ADMIN')) next('/')
	else if (to.meta.requires == 'auth' && !auth?.user?.token) next('/login')
	else if (to.meta.requires == 'guest' && auth?.user?.token) next('/')
	else next()
})

export default router