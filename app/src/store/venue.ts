import { defineStore } from 'pinia'

import api from '@/utils/api'
import type { Venue } from '@/types/venue'
import type { ListParams } from '@/types/list'
import { SubmissionError } from '@/utils/error'
import { extractHubURL } from '@/utils/mercure'
import type { SubmissionErrors } from '@/types/error'
import type { PagedCollection } from '@/types/collection'

interface CreateState {
	created?: Venue
	isLoading: boolean
	error?: string
	violations?: SubmissionErrors
}

interface DeleteState {
	deleted?: Venue
	mercureDeleted?: Venue
	isLoading: boolean
	error?: string
}

interface ListState {
	items: Venue[]
	totalItems: number
	isLoading: boolean
	error?: string
	hubUrl?: URL
}

interface ShowState {
	retrieved?: Venue
	hubUrl?: URL
	isLoading: boolean
	error?: string
}

interface UpdateState {
	retrieved?: Venue
	updated?: Venue
	hubUrl?: URL
	isLoading: boolean
	error?: string
	violations?: SubmissionErrors
}

export const useVenueCreateStore = defineStore('venueCreate', {
	state: (): CreateState => ({
		created: undefined,
		isLoading: false,
		error: undefined,
		violations: undefined
	}),
	actions: {
		async create(payload: Venue) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			try {
				const response = await api('venues', {
					method: 'POST',
					body: JSON.stringify(payload)
				})
				const data: Venue = await response.json()

				this.toggleLoading()
				this.setCreated(data)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof SubmissionError) {
					this.setViolations(error.errors)
					this.setError(error.errors._error)
					return
				}

				if (error instanceof Error) this.setError(error.message)
			}
		},
		setCreated(created: Venue) {
			this.created = created
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setError(error: string | undefined) {
			this.error = error
		},
		setViolations(violations: SubmissionErrors | undefined) {
			this.violations = violations
		}
	}
})

export const useVenueDeleteStore = defineStore('venueDelete', {
	state: (): DeleteState => ({
		deleted: undefined,
		mercureDeleted: undefined,
		isLoading: false,
		error: undefined,
	}),
	actions: {
		async deleteItem(item: Venue) {
			this.setError('')
			this.toggleLoading()

			if (!item?.['@id']) {
				this.setError('No venue found. Please reload')
				return
			}

			try {
				await api(item['@id'], { method: 'DELETE' })

				this.toggleLoading()
				this.setDeleted(item)
				this.setMercureDeleted(undefined)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof Error) this.setError(error.message)
			}
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setDeleted(deleted: Venue) {
			this.deleted = deleted
		},
		setMercureDeleted(mercureDeleted: Venue | undefined) {
			this.mercureDeleted = mercureDeleted
		},
		setError(error: string) {
			this.error = error
		}
	}
})

export const useVenueListStore = defineStore('venueList', {
	state: (): ListState => ({
		items: [],
		totalItems: 0,
		isLoading: false,
		error: undefined,
		hubUrl: undefined,
	}),
	actions: {
		async getItems(params: ListParams) {
			this.setError('')
			this.toggleLoading()

			try {
				const response = await api('venues', { params })
				const data: PagedCollection<Venue> = await response.json()
				const hubUrl = extractHubURL(response)

				this.toggleLoading()

				this.setItems(data['hydra:member'])
				this.setTotalItems(data['hydra:totalItems'] ?? 0)

				if (hubUrl) this.setHubUrl(hubUrl)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof Error) this.setError(error.message)
			}
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setItems(items: Venue[]) {
			this.items = items
		},
		setTotalItems(totalItems: number) {
			this.totalItems = totalItems
		},
		setHubUrl(hubUrl: URL) {
			this.hubUrl = hubUrl
		},
		setError(error: string) {
			this.error = error
		},
		updateItem(updatedItem: Venue) {
			const item: Venue | undefined = this.items.find(
				i => i['@id'] === updatedItem['@id']
			)

			if (!item) return

			Object.assign(item, updatedItem)
		},
		deleteItem(deletedItem: Venue) {
			this.items = this.items.filter(item => {
				return item['@id'] !== deletedItem['@id']
			})
		}
	}
})

export const useVenueShowStore = defineStore('venueShow', {
	state: (): ShowState => ({
		retrieved: undefined,
		hubUrl: undefined,
		isLoading: false,
		error: undefined,
	}),

	actions: {
		async retrieve(id: string) {
			this.toggleLoading()

			try {
				const response = await api('venues/' + id)
				const data: Venue = await response.json()
				const hubUrl = extractHubURL(response)

				this.toggleLoading()
				this.setRetrieved(data)

				if (hubUrl) this.setHubUrl(hubUrl)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof Error) this.setError(error.message)
			}
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setRetrieved(retrieved: Venue) {
			this.retrieved = retrieved
		},
		setHubUrl(hubUrl: URL) {
			this.hubUrl = hubUrl
		},
		setError(error: string) {
			this.error = error
		}
	}
})

export const useVenueUpdateStore = defineStore('venueUpdate', {
	state: (): UpdateState => ({
		retrieved: undefined,
		updated: undefined,
		hubUrl: undefined,
		isLoading: false,
		error: undefined,
		violations: undefined,
	}),
	actions: {
		async retrieve(id: string) {
			this.toggleLoading()

			try {
				const response = await api('venues/' + id)
				const data: Venue = await response.json()
				const hubUrl = extractHubURL(response)

				this.toggleLoading()
				this.setRetrieved(data)

				if (hubUrl) this.setHubUrl(hubUrl)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof Error) this.setError(error.message)
			}
		},
		async update(payload: Venue) {
			this.setError(undefined)
			this.toggleLoading()

			if (!this.retrieved) {
				this.setError('No venue found. Please reload')
				return
			}

			try {
				const response = await api(this.retrieved['@id'] ?? payload['@id'] ?? '', {
					method: 'PUT',
					headers: new Headers({
						'Content-Type': 'application/ld+json',
					}),
					body: JSON.stringify(payload)
				})
				const data: Venue = await response.json()

				this.toggleLoading()
				this.setUpdated(data)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof SubmissionError) {
					this.setViolations(error.errors)
					this.setError(error.errors._error)
					return
				}

				if (error instanceof Error) this.setError(error.message)
			}
		},
		setRetrieved(retrieved: Venue) {
			this.retrieved = retrieved
		},
		setUpdated(updated: Venue) {
			this.updated = updated
		},
		setHubUrl(hubUrl: URL) {
			this.hubUrl = hubUrl
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setError(error?: string) {
			this.error = error
		},
		setViolations(violations?: SubmissionErrors) {
			this.violations = violations
		},
		resetErrors() {
			this.setError(undefined)
			this.setViolations(undefined)
		}
	}
})

export const useVenueStore = () => ({
	venueListStore: useVenueListStore(),
	venueShowStore: useVenueShowStore(),
	venueCreateStore: useVenueCreateStore(),
	venueUpdateStore: useVenueUpdateStore(),
	venueDeleteStore: useVenueDeleteStore()
})