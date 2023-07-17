<script lang="ts">
import { computed, defineComponent, ref, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import { StripeElements, StripeElement } from 'vue-stripe-js'

import { STRIPE_PK } from '../../utils/config'
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

		const store = useAuthStore()
		const { user } = storeToRefs(store)

		const isConnected = computed(() => (user?.value ? true : false))
		const stripeKey = ref(STRIPE_PK) // Votre clé d'API Stripe de test
		const instanceOptions = ref({
			// Options d'instance Stripe (le cas échéant)
		})
		const elementsOptions = ref({
			// clientSecret: ''
		})
		const cardOptions = ref({
			// Options de l'élément de carte Stripe
		})
		const stripeLoaded = ref(false)
		const card = ref()
		const elms = ref()
		const venueId = ref(props.venueId)
		const date = ref(props.date)
		const price = ref(props.price)
		const clientSecret = ref("")
		const utilsStore = useUtilsStore()

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

					let data = {
						paymentMethodId: res.paymentMethod.id,
						venueId: venueId.value,
						date: date.value,
						price: price.value,
					}

					PaymentService.generatePaymentIntentBooking(data)
						.then((res: any) => {
							console.log(res)
							if (res.status === 500) utilsStore.showToast(res.detail, 'danger')
							else {
								utilsStore.showToast('Reservation successful!')

								// TODO remove double timeout
								setTimeout(() => {
									setTimeout(() => { router.replace('/') }, 2000)
								}, 2000)
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
			stripeKey,
			stripeLoaded,
			isConnected,
			instanceOptions,
			elementsOptions,
			cardOptions,
			card,
			elms,
			pay
		}
	}
})
</script>

<template>
	<template v-if="isConnected">
		<StripeElements v-if="stripeLoaded" #="{ elements, instance }" ref="elms" :stripe-key="stripeKey" :instance-options="instanceOptions" :elements-options="elementsOptions">
			<StripeElement ref="card" :elements="elements" :options="cardOptions" />
		</StripeElements>
	</template>

	<v-btn class="mt-4" :disabled="!isConnected" prepend-icon="fa fa-ticket" link @click="pay">
		Book this venue for
		<v-icon class="fa fa-dollar text-yellow" />
		{{ price }}
	</v-btn>

	<template v-if="!isConnected">
		You need to be connected to book a venue
	</template>
</template>