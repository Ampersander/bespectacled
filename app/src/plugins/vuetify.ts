import 'vuetify/styles'
import { Directive } from 'vue'
import { mdi } from 'vuetify/iconsets/mdi'
import * as labs from 'vuetify/labs/components'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { createVuetify, ThemeDefinition  } from 'vuetify'
import { VuetifyDateAdapter as adapter } from 'vuetify/labs/date/adapters/vuetify'

const helpers: Record<string, Directive<HTMLElement, any>> = {
	// Set the focus on an element (if not an input, focus a child one)
	Focus: (el, { value = true }) => value && (el.tagName === 'INPUT' ? el.focus() : el.querySelector('input')?.focus()),
	// Scroll to an element but with an offset (height and padding bottom of the navbar)
	ScrollTo: (el, { value }) => el.addEventListener('click', () => window.scrollTo({ behavior: 'smooth', top: document.querySelector(value).getBoundingClientRect().top + window.scrollY - 48 - 16 })),
	// Show the user a notification
	Notify: (el, { value }) => el.addEventListener('click', () => Notification.requestPermission().then(() => new Notification('BeSpectacled', { body: (value[0]?.name || value[0]?.title) + value[1], icon: value[0].src })))
}

const dark: ThemeDefinition = {
	dark: true,
	colors: {
		primary: '#7750f8',
		surface: '#1d2333',
		secondary: '#45a7f5',
		// secondary: '#40d04f', // green from xplorer
		// tertiary: '#da38c0', // pink from filter: hue-rotate(45deg)
		background: '#161b28'
	}
}

const variations = {
	darken: 1,
	lighten: 1,
	colors: ['primary', 'surface', 'secondary']
}

export default createVuetify({
	date: { adapter },
	components: { ...components, ...labs },
	directives: { ...directives, ...helpers },
	theme: { defaultTheme: 'dark', themes: { dark }, variations },
	icons: { defaultSet: 'fa', aliases, sets: { fa, mdi } },
	// locale: { locale: 'en', fallback: 'en', messages: {} }
})