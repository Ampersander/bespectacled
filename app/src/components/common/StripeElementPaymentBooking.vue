<script lang="ts">
import { computed, defineComponent, ref, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import { StripeElements, StripeElement } from 'vue-stripe-js'

import { STRIPE_PK } from '@/utils/config'
import { useAuthStore, useUtilsStore } from '@/store'
import PaymentService from '@/services/payment.service'

export default defineComponent({
	name: 'StripeElementPaymentBooking',
	props: {
		date: Date,
		price: Number,
		venueId: Number
	},
	components: {
		StripeElement,
		StripeElements
	},
	setup(props) {
		const router = useRouter()
		const utilsStore = useUtilsStore()

		const store = useAuthStore()
		const { user } = storeToRefs(store)

		const card = ref()
		const elms = ref()
		const cardOptions = ref({}) // Options de l'élément de carte Stripe
		const clientSecret = ref('')
		const date = ref(props.date)
		const price = ref(props.price)
		const stripeLoaded = ref(false)
		const elementsOptions = ref({}) // { clientSecret: '' }
		const instanceOptions = ref({}) // Options d'instance Stripe (le cas échéant)
		const stripeKey = ref(STRIPE_PK) // Votre clé d'API Stripe de test
		const venueId = ref(props.venueId)
		const isConnected = computed(() => (user?.value ? true : false))

		console.log(date)

		onBeforeMount(() => {
			const data = { date: date.value, venueId: venueId.value }
			const stripePromise = loadStripe(stripeKey.value)
			stripePromise.then(() => { stripeLoaded.value = true })
		})

		const pay = () => {
			elms.value?.instance
				.createPaymentMethod({ elements: elms.value.elements })
				.then((res: any) => {
					console.log(res)

					let data = { date: date.value, price: price.value, venueId: venueId.value, paymentMethodId: res.paymentMethod.id }

					PaymentService.generatePaymentIntentBooking(data)
						.then((res: any) => {
							console.log(res)

							if (res.status === 500) utilsStore.showToast(res.detail, 'danger')
							else {
								utilsStore.showToast('Booking successful!')
								setTimeout(() => { router.replace('/profile') }, 2000)
							}
						})
						.catch((err: any) => {
							if (err.response) {
								// Access the error response from the API
								const errorResponse = err.response.data
								console.log(errorResponse)
								utilsStore.showToast(errorResponse?.detail, 'danger')
							} else {
								// Handle other types of errors
								console.log(err)
								utilsStore.showToast('An error occurred during the booking.', 'danger')
							}
						})
				}).catch((err: any) => {
					console.log(err)
					utilsStore.showToast('An error occurred during the booking.', 'danger')
				})
		}

		return {
			pay,
			card,
			elms,
			stripeKey,
			cardOptions,
			isConnected,
			stripeLoaded,
			elementsOptions,
			instanceOptions
		}
	}
})
</script>

<template>
	<template v-if="isConnected">
		<StripeElements v-if="stripeLoaded" #="{ elements, instance }" ref="elms" :stripe-key="stripeKey" :elements-options="elementsOptions" :instance-options="instanceOptions">
			<StripeElement ref="card" :elements="elements" :options="cardOptions" />
		</StripeElements>
	</template>

	<v-btn class="mt-4" prepend-icon="fa fa-ticket" :disabled="!isConnected" link @click="pay">
		Book Venue for
		<v-icon class="fa fa-dollar text-yellow" />
		{{ price }}
	</v-btn>

	<template v-if="!isConnected">
		You need to be logged in to book a venue.
	</template>
</template>