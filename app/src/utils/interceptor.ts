import axios from './axios'
import { User } from '@/types/user'
import { useAuthStore } from '@/store'

const auth = useAuthStore()

export default (store: any) => {
	axios.interceptors.request.use(req => {
		const token = auth.user?.token
		if (token && req.headers) req.headers['Authorization'] = 'Bearer ' + token
		return req
	}, err => {
		return Promise.reject(err)
	})

	axios.interceptors.response.use(res => {
		return res
	}, async err => {
		const originalConfig = err.config

		if (originalConfig.url !== '/api/login' && err.response) {
			// Access Token was expired
			if (err.response.status === 401 && !originalConfig._retry) {
				originalConfig._retry = true

				try {
					const rs = await axios.post('/auth/token/refresh', { 'refresh_token': auth.user?.refresh_token })
					const { token } = rs.data

					// store.dispatch('auth/refreshToken', token)
					auth.setUser({ ...auth.user, token } as User)

					return axios(originalConfig)
				} catch (_error) {
					return Promise.reject(_error)
				}
			}
		}

		return Promise.reject(err)
	})
}