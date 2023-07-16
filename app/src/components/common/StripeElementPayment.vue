<template>
  <template v-if="isConnected">
    <StripeElements v-if="stripeLoaded" v-slot="{ elements, instance }" ref="elms" :stripe-key="stripeKey"
      :instance-options="instanceOptions" :elements-options="elementsOptions">
      <StripeElement type='payment' ref="card" :elements="elements" :options="cardOptions" />
    </StripeElements>
  </template>
  <v-list-item link prepend-icon="fa fa-ticket" @click="pay" :disabled="!isConnected">
    <v-list-item-title>Buy Ticket {{ price }}
      <i class="fa fa-dollar v-icon notranslate v-theme--dark v-icon--size-default text-yellow"
        aria-hidden="true"></i></v-list-item-title>
  </v-list-item>
  <template v-if="!isConnected">
    You need to be connected to buy a ticket
  </template>

</template>

<script lang="ts">
import { StripeElements, StripeElement } from 'vue-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { defineComponent, ref, onBeforeMount } from 'vue'
import PaymentService from '@/services/payment.service';
import { STRIPE_PK } from "../../utils/config";
import { storeToRefs } from 'pinia'
import { useAuthStore, useUtilsStore } from '@/store'
import { computed } from 'vue';

export default defineComponent({
  name: 'StripeElementPayment',
  props: {
    eventId: Number,
    date: String,
    time: String,
    price: Number,
  },

  components: {
    StripeElements,
    StripeElement,
  },

  setup(props) {
    const store = useAuthStore()
    const { user } = storeToRefs(store)

    const isConnected = computed(() =>
      user?.value ? true : false
    )
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
    const eventId = ref(props.eventId);
    const date = ref(props.date);
    const time = ref(props.time);
    const price = ref(props.price);
    const clientSecret = ref('');
    const utilsStore = useUtilsStore()

    onBeforeMount(() => {

      const data = {
        eventId: eventId.value,
        date: date.value,
        time: time.value,
      }

      PaymentService.generatePaymentIntent(data).then((res) => {
        PaymentService.setPaymentIntent(res.data.clientSecret);
        elementsOptions.value = {
          clientSecret: res.data.clientSecret,
        }
        clientSecret.value = res.data.clientSecret;
        const stripePromise = loadStripe(stripeKey.value)
        stripePromise.then(() => {
          stripeLoaded.value = true
        })
      });

    })

    const pay = () => {

      elms.value.instance.confirmPayment(
        {
          //clientSecret: clientSecret.value,
          elements: elms.value.elements,
          confirmParams: {
            return_url: window.location.origin + '/?success=true',
          }
        }).then((res: any) => {
          console.log(res);
          if (res.error) {
            utilsStore.showToast(res.error.message, 'danger')
          } else {
            utilsStore.showToast('Payment successful!')
          }
        });

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
      pay,
    }
  },
})
</script>
