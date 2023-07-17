import { defineStore } from 'pinia'

interface State {
	dark: boolean
	isLoading: boolean
	toast: {
		modelValue: boolean
		text: string
		timeout?: number
		color: 'primary' | 'success' | 'danger' | 'error' | 'warning' | 'info'
	},
	banner: {
		modelValue: boolean
		text: string
		color: 'primary' | 'success' | 'danger' | 'error' | 'warning' | 'info'
		action: null | { text: string, callback: () => void }
	}
}

const initialState: State = {
	dark: JSON.parse(localStorage.getItem('dark') || 'true'),
	isLoading: false,
	toast: { modelValue: false, text: '', timeout: 2000, color: 'success' },
	banner: { modelValue: false, text: '', color: 'success', action: null }
}

export const useUtilsStore = defineStore('utils', {
	state: (): State => initialState,
	actions: {
		toggle() {
			localStorage.setItem('dark', JSON.stringify(!this.dark))
			this.dark = !this.dark
		},
		setLoading(isLoading: boolean) {
			this.isLoading = isLoading
		},
		showToast(text: string, color: State['toast']['color'] = 'success', timeout: number = 2000) {
			this.toast = { modelValue: true, text, color, timeout }
			setTimeout(() => this.hideToast(), timeout)
		},
		hideToast() {
			this.toast.modelValue = false
			setTimeout(() => this.toast = initialState.toast, 500)
		},
		showBanner(text: string, color: State['banner']['color'] = 'success', action: State['banner']['action'] = null) {
			this.banner = { modelValue: true, text, color, action }
			setTimeout(() => this.hideBanner(), 5000)
		},
		hideBanner() {
			this.banner = initialState.banner
		}
	}
})