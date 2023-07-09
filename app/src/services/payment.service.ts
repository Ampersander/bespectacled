import axios from 'axios'

import headers from './headers'

const API_URL = import.meta.env.VITE_API_URL

class PaymentService {
	generateIntent(data: any) {
		return axios.post(API_URL + 'generatePaymentIntent', data, { headers: headers() })
	}
}

export default new PaymentService()