import { defineStore } from 'pinia'

import api from '@/utils/api'
import headers from './headers'
import type { User } from '@/types/user'
import type { ListParams } from '@/types/list'
import { SubmissionError } from '@/utils/error'
import { extractHubURL } from '@/utils/mercure'
import type { SubmissionErrors } from '@/types/error'
import type { PagedCollection } from '@/types/collection'

interface CreateState {
	created?: User
	isLoading: boolean
	error?: string
	violations?: SubmissionErrors
}

interface DeleteState {
	deleted?: User
	mercureDeleted?: User
	isLoading: boolean
	error?: string
}

interface ListState {
	items: User[]
	totalItems: number
	isLoading: boolean
	error?: string
	hubUrl?: URL
}

interface ShowState {
	retrieved?: User
	hubUrl?: URL
	isLoading: boolean
	error?: string
}

interface UpdateState {
	retrieved?: User
	updated?: User
	hubUrl?: URL
	isLoading: boolean
	error?: string
	violations?: SubmissionErrors
}

export const useUserCreateStore = defineStore('userCreate', {
	state: (): CreateState => ({
		created: undefined,
		isLoading: false,
		error: undefined,
		violations: undefined
	}),
	actions: {
		async create(payload: User) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			try {
				const response = await api('users', {
					method: 'POST',
					body: JSON.stringify(payload)
				})
				const data: User = await response.json()

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
		setCreated(created: User) {
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

export const useUserDeleteStore = defineStore('userDelete', {
	state: (): DeleteState => ({
		deleted: undefined,
		mercureDeleted: undefined,
		isLoading: false,
		error: undefined,
	}),
	actions: {
		async deleteItem(item: User) {
			this.setError('')
			this.toggleLoading()

			if (!item?.['@id']) {
				this.setError('No user found. Please reload')
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
		setDeleted(deleted: User) {
			this.deleted = deleted
		},
		setMercureDeleted(mercureDeleted: User | undefined) {
			this.mercureDeleted = mercureDeleted
		},
		setError(error: string) {
			this.error = error
		}
	}
})

export const useUserListStore = defineStore('userList', {
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
				const response = await api('users', { params, authorization: headers().Authorization })
				const data: PagedCollection<User> = await response.json()
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
		async getArtists(params: ListParams) {
			this.setError('')
			this.toggleLoading()

			try {
				const response = await api('artists', { params })
				const data: PagedCollection<User> = await response.json()
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
		setItems(items: User[]) {
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
		updateItem(updatedItem: User) {
			const item: User | undefined = this.items.find(
				i => i['@id'] === updatedItem['@id']
			)

			if (!item) return

			Object.assign(item, updatedItem)
		},
		deleteItem(deletedItem: User) {
			this.items = this.items.filter(item => {
				return item['@id'] !== deletedItem['@id']
			})
		}
	}
})

export const useUserShowStore = defineStore('userShow', {
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
				const response = await api('users/' + id)
				const data: User = await response.json()
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
		setRetrieved(retrieved: User) {
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

export const useUserUpdateStore = defineStore('userUpdate', {
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
				const response = await api('users/' + id)
				const data: User = await response.json()
				const hubUrl = extractHubURL(response)

				this.toggleLoading()
				this.setRetrieved(data)

				if (hubUrl) this.setHubUrl(hubUrl)
			} catch (error) {
				this.toggleLoading()

				if (error instanceof Error) this.setError(error.message)
			}
		},
		async update(payload: User) {
			this.setError(undefined)
			this.toggleLoading()

			if (!this.retrieved) {
				this.setError('No user found. Please reload')
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
				const data: User = await response.json()

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
		setRetrieved(retrieved: User) {
			this.retrieved = retrieved
		},
		setUpdated(updated: User) {
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

export const useUserStore = () => ({
	userListStore: useUserListStore(),
	userShowStore: useUserShowStore(),
	userCreateStore: useUserCreateStore(),
	userUpdateStore: useUserUpdateStore(),
	userDeleteStore: useUserDeleteStore()
})