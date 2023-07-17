import axios from 'axios'

import headers from './headers'

const API_URL = import.meta.env.VITE_API_URL

class PaymentService {
	generatePaymentIntent(data: any) {
		return axios.post(API_URL + '/generate-intent', data, { headers: headers() })
	}
	generatePaymentIntentBooking(data: any) {
		console.log(data);
		return axios.post(API_URL + '/generate-intent-booking', data, { headers: headers() })
	}
	checkPayment() {
		console.log(this.getPaymentIntent());
		return axios.post(API_URL + '/check-payment', {paymentIntentId:this.getPaymentIntent()}, { headers: headers() })
	}
	setPaymentIntent(paymentIntent: any = null) {
		paymentIntent ? localStorage.setItem('paymentIntent', JSON.stringify(paymentIntent)) : localStorage.removeItem('paymentIntent');
	}
	getPaymentIntent() {
		return localStorage.getItem('paymentIntent') ? JSON.parse(localStorage.getItem('paymentIntent')!) : null;
	}
}

export default new PaymentService()