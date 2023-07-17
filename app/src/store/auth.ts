import axios from 'axios'
import { defineStore } from 'pinia'

import router from '@/router'
import api from '@/utils/api'
import headers from './headers'
import { User } from '@/types/user'
import { SubmissionError } from '@/utils/error'
import { SubmissionErrors } from '@/types/error'

interface State {
	user?: User
	isLoading: boolean
	error?: string
	violations?: SubmissionErrors
}

const baseUrl = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
	state: (): State => ({
		// initialize state from local storage to enable user to stay logged in
		user: JSON.parse(localStorage.getItem('user') || 'null'),
		isLoading: false,
		error: undefined,
		violations: undefined
	}),
	actions: {
		async login(user: any) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			return axios.post(`${baseUrl}/login`, user)
				.then(async ({ data }) => {
					if (data.token) {
						try {
							// Set the user here so that the profile request can use the token
							this.setUser(data)

							const response = await api('profile')
							const profile: User = await response.json()

							// Store as little as possible but as much as necessary
							this.setUser({ ...data, id: profile.id, '@id': profile['@id'], username: profile.username, email: profile.email, roles: profile.roles })
						} catch (error) {
							this.toggleLoading()

							if (error instanceof Error) this.setError(error.message)
						}

						// // fetch user profile
						// const profile = await this.profile(data)
						// this.setUser({ ...data, ...profile.data })
					} else throw new Error('Missing token.')
				})
				.catch(error => {
					// console.log(Object.keys(error))
					// if (error?.response?.data?.message) {
					// 	this.error = error.response.data.message
					// 	return
					// }
					if (error instanceof SubmissionError) {
						this.violations = error.errors
						this.error = error.errors._error
						throw new Error(this.error)
					}

					this.error = this.error = error?.response?.data?.message || error.message || error.toString()
					throw new Error(this.error)
				})
				.finally(() => {
					this.isLoading = false
				})
		},
		async register(payload: any) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			try {
				const response = await api('register', {
					method: 'POST',
					body: JSON.stringify(payload)
				})
				const data: User = await response.json()

				this.toggleLoading()
				this.setUser(data)
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
		async editProfile(payload: any) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			if (!this.user) {
				this.setError('No user found. Please reload')
				return
			}

			try {
				const response = await api('/api/users/' + this.user.id, {
					method: 'PUT',
					headers: new Headers({
						'Content-Type': 'application/ld+json',
						'Authorization': `Bearer ${this.user.token}`,
					}),
					body: JSON.stringify(payload)
				})
				const data: User = await response.json()

				this.toggleLoading()
				this.setUser({ ...this.user, ...data })
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
		async forgotPassword(payload: Pick<User, 'email'>) {
			this.setError(undefined)
			this.setViolations(undefined)
			this.toggleLoading()

			try {
				const response = await api('forgot-password', {
					method: 'POST',
					body: JSON.stringify(payload)
				})
				const data = await response.json()

				return data
			} catch (error) {
				if (error instanceof SubmissionError) {
					this.setViolations(error.errors)
					this.setError(error.errors._error)
				} else if (error instanceof Error) this.setError(error.message)

				throw this.error
			} finally {
				this.toggleLoading()
			}
		},
		logout(redirect = true) {
			this.setUser(undefined)
			redirect && router.push('/login')
		},
		profile(data = null) {
			return axios.get(`${baseUrl}/profile`, { headers: headers(data) })
		},
		setUser(user: User | undefined) {
			this.user = user
			user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user')
		},
		toggleLoading() {
			this.isLoading = !this.isLoading
		},
		setError(error: string | undefined) {
			this.error = error
			setTimeout(() => { this.error = undefined }, 5000)
		},
		setViolations(violations: SubmissionErrors | undefined) {
			this.violations = violations
			setTimeout(() => { this.violations = undefined }, 5000)
		}
	}
})