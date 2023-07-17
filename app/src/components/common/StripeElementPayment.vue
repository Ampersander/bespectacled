<script lang="ts">
import { computed, defineComponent, ref, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { loadStripe } from '@stripe/stripe-js'
import { StripeElements, StripeElement } from 'vue-stripe-js'

import { STRIPE_PK } from '@/utils/config'
import { useAuthStore, useUtilsStore } from '@/store'
import PaymentService from '@/services/payment.service'

export default defineComponent({
	name: 'StripeElementPayment',
	props: {
		date: String,
		time: String,
		price: Number,
		eventId: Number
	},
	components: {
		StripeElement,
		StripeElements
	},
	setup(props) {
		const utilsStore = useUtilsStore()

		const store = useAuthStore()
		const { user } = storeToRefs(store)

		const isConnected = computed(() => (user?.value ? true : false))

		const disabled = ref(user?.value ? true : false)

		const card = ref()
		const elms = ref()
		const cardOptions = ref({}) // Options de l'élément de carte Stripe
		const clientSecret = ref('')
		const date = ref(props.date)
		const time = ref(props.time)
		const price = ref(props.price)
		const stripeLoaded = ref(false)
		const elementsOptions = ref({}) // { clientSecret: '' }
		const instanceOptions = ref({}) // Options d'instance Stripe (le cas échéant)
		const stripeKey = ref(STRIPE_PK) // Votre clé d'API Stripe de test
		const eventId = ref(props.eventId)

		onBeforeMount(() => {
			const data = { date: date.value, time: time.value, eventId: eventId.value }

			PaymentService.generatePaymentIntent(data)
				.then((res) => {
					PaymentService.setPaymentIntent(res.data.clientSecret)
					clientSecret.value = res.data.clientSecret
					elementsOptions.value = { clientSecret: res.data.clientSecret }

					const stripePromise = loadStripe(stripeKey.value)
					stripePromise.then(() => stripeLoaded.value = true)
				})
				.catch((err: any) => {
					if (err.response) {
						disabled.value = true
						// Access the error response from the API
						const errorResponse = err.response.data
						console.log(errorResponse)
						utilsStore.showToast(errorResponse?.detail, 'danger')
					} else {
						// Handle other types of errors
						console.log(err)
						utilsStore.showToast('An error occurred during the purchase.', 'danger')
					}
				})
		})

		const pay = () => {
			elms.value?.instance
				// clientSecret: clientSecret.value,
				.confirmPayment({ elements: elms.value.elements, confirmParams: { return_url: window.location.origin + '/?success=true' } })
				.then((res: any) => {
					console.log(res)

					if (res.error) utilsStore.showToast(res.error.message, 'danger')
					else utilsStore.showToast('Payment successful!')
				})
				.catch((err: any) => {
					if (err.response) {
						// Access the error response from the API
						const errorResponse = err.response.data
						console.log(errorResponse)
						utilsStore.showToast(errorResponse.detail, 'danger')
					} else {
						// Handle other types of errors
						console.log(err)
						utilsStore.showToast('An error occurred during the purchase.', 'danger')
					}
				})
		}

		return {
			pay,
			card,
			elms,
			disabled,
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
			<StripeElement ref="card" type="payment" :elements="elements" :options="cardOptions" />
		</StripeElements>
	</template>

	<!-- TODO :disabled="!isConnected || disabled" -->
	<v-list-item class="mt-4" prepend-icon="fa fa-ticket" link @click="pay">
		<v-list-item-title>
			Buy Ticket for
			<v-icon class="fa fa-dollar text-yellow" />
			{{ price }}
		</v-list-item-title>
	</v-list-item>

	<template v-if="!isConnected">
		You need to be logged in to buy a ticket.
	</template>
</template>
