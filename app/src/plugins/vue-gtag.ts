import VueGtag, { event } from 'vue-gtag'
import type { Router } from 'vue-router'

// see https://developers.google.com/analytics/devguides/collection/gtagjs/events
const Track = (el: HTMLElement, { value }: any) => el.addEventListener('click', () => event(value[0], value[1]))
// ex: v-track.click="params"

const config = {
	appName: 'BeSpectacled',
	pageTrackerScreenviewEnabled: true,
	config: {
		id: 'G-YKS0DVR7XB', // import.meta.env.VITE_GTAG_ID,
	}
}

// export const config = (router: Router) => {
// 	return {
// 		config: {
// 			// Mandatory fields
// 			appName: 'BeSpectacled',
// 			appVersion: '1.0',
// 			trackingId: 'G-YKS0DVR7XB', // import.meta.env.VITE_GTAG_ID,

// 			// Sync router with Google Analytics
// 			vueRouter: router,

// 			// Global Dimensions and Metrics can optionally be specified.
// 			globalDimensions: [
// 				{ dimension: 1, value: 'FirstDimension' },
// 				{ dimension: 2, value: 'SecondDimension' }
// 				// Because websites are only 2D, obviously. WebGL? What's that?
// 			],

// 			globalMetrics: [
// 				{ metric: 1, value: 'MyMetricValue' },
// 				{ metric: 2, value: 'AnotherMetricValue' }
// 			]
// 		}
// 	}
// }

export {
	Track,
	VueGtag,
	config,
}