import { App } from 'vue'

interface TrackerOptions {
	APP_ID: string,
	service?: string,
	visitorId?: string,
	sessionId?: string
}

export default {
	install(Vue: App, options: TrackerOptions) {
		if (!options.APP_ID) { throw new Error('Please provide an APP_ID.') }

		const configData = {
			APP_ID: options.APP_ID,
			servoce: options.service || 'frontend',
			visitorId: options.visitorId || '1234567890',
			sessionId: options.sessionId || '1234567890'
		}

		const eventListeners: any = {}

		const sendEvent = (data: any) => {
			const url = 'http://localhost:3000/events'

			fetch(url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}

		Vue.directive('track', {
			mounted(el: HTMLElement, binding: any) {
				eventListeners[binding.arg] = () => {
					sendEvent({
						...configData,
						event: binding.value,
						tag: binding.arg
					})
				}
			},
			unmounted(el: HTMLElement, binding: any) {
				el.removeEventListener('click', eventListeners[binding.arg])
				delete eventListeners[binding.arg]
			}
		})
	}
}

// usage: v-track:<tag>.<event>
// ex: v-track:ABCXYZ.click