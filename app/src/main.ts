import { createApp } from 'vue'
import VCalendar from 'v-calendar'
// import { StripePlugin } from '@vue-stripe/vue-stripe'

import 'bootstrap'
import 'v-calendar/style.css' // import 'v-calendar/dist/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './styles/main.scss'

import App from '@/App.vue'
import router from '@/router'
import pinia from '@/plugins/pinia'
import VueI18n from '@/plugins/i18n'
import vuetify from '@/plugins/vuetify'
import tracker from '@/plugins/tracker'
import { VueGtag, config } from '@/plugins/vue-gtag'

const options = {
	APP_ID: 'ESGI'
}

createApp(App)
	.use(pinia)
	.use(router)
	.use(VueGtag, config, router)
	.use(tracker, options)
	.use(vuetify)
	.use(VueI18n)
	.use(VCalendar, { componentPrefix: 'vc' })
	.mount('#app')