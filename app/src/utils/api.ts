import qs from 'qs'

import { User } from '@/types/user'
import headers from '@/store/headers'
import { ENTRYPOINT } from './config'
import { useAuthStore, useUtilsStore } from '@/store'
import { SubmissionError } from './error'
import type { SubmissionErrors } from '../types/error'

const MIME_TYPE = 'application/ld+json'

export default async function (id: string, options: any = {}) {
	const auth = useAuthStore()
	const utils = useUtilsStore()

	if (typeof options.headers === 'undefined') Object.assign(options, { headers: new Headers() })

	options.headers.set('Authorization', headers().Authorization)

	if (options.headers.get('Accept') === null) options.headers.set('Accept', MIME_TYPE)

	if (
		options.body !== undefined &&
		!(options.body instanceof FormData) &&
		options.headers.get('Content-Type') === null
	) {
		options.headers.set('Content-Type', MIME_TYPE)
	}

	if (options.params) {
		const queryString = qs.stringify(options.params)
		id = `${id}?${queryString}`
	}

	// enable CORS for all requests
	Object.assign(options, {
		mode: 'cors',
		// credentials: 'include', // when credentials needed
	})

	const response = await fetch(new URL(ENTRYPOINT + '/' + id.replace('/api/', '')), options)
	// const response = await fetch(new URL(ENTRYPOINT + '/' + id), options)

	if (!response.ok) {
		// Handle refresh on expired token and logout on expired refresh token
		if (response.status === 401) {
			const user = JSON.parse(localStorage.getItem('user') || 'null') as User

			// Try refreshing the token request
			const res = await fetch(new URL(ENTRYPOINT + '/token/refresh'), {
				method: 'POST',
				headers: new Headers({ 'Content-Type': 'application/json' }),
				body: JSON.stringify({ 'refresh_token': user?.refresh_token })
			})

			if (res.ok) {
				// Retry the original request with the new token
				const { token } = await res.json()
				auth.setUser({ ...user, token } as User)
				options.headers.set('Authorization', 'Bearer ' + token)
				return await fetch(new URL(ENTRYPOINT + '/' + id.replace('/api/', '')), options)
			} else {
				// Logout the user if it fails again because the refresh token has also expired
				// Also because even API routes with PUBLIC_ACCESS can't be fetched if there's an invalid token
				const error = 'Your session has expired. Please log in again.'
				auth.logout(false)
				utils.showToast(error, 'warning')
				// Try one last time without the token, should work if the user is on a public route
				options.headers.delete('Authorization')
				return await fetch(new URL(ENTRYPOINT + '/' + id.replace('/api/', '')), options)
			}
		}

		const data = await response.json()
		const error = data['hydra:description'] || response.statusText
		if (!data.violations) throw Error(error)

		const errors: SubmissionErrors = { _error: error }
		data.violations.forEach(
			(violation: { propertyPath: string; message: string }) => {
				errors[violation.propertyPath] = violation.message
			}
		)

		throw new SubmissionError(errors)
	}

	return response
}