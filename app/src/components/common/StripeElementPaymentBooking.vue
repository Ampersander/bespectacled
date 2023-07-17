<template>
  <template v-if="isConnected">
    <StripeElements v-if="stripeLoaded" v-slot="{ elements, instance }" ref="elms" :stripe-key="stripeKey"
      :instance-options="instanceOptions" :elements-options="elementsOptions">
      <StripeElement ref="card" :elements="elements" :options="cardOptions" />
    </StripeElements>
  </template>
  <v-list-item link prepend-icon="fa fa-ticket" @click="pay" :disabled="!isConnected">
    <v-list-item-title>Buy Ticket {{ price }}
      <i class="fa fa-dollar v-icon notranslate v-theme--dark v-icon--size-default text-yellow"
        aria-hidden="true"></i></v-list-item-title>
  </v-list-item>
  <template v-if="!isConnected">
    You need to be connected to book a venue
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
  name: 'StripeElementPaymentBooking',
  props: {
    venueId: Number,
    date: Date,
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
    const venueId = ref(props.venueId);
    const date = ref(props.date);
    const price = ref(props.price);
    const clientSecret = ref('');
    const utilsStore = useUtilsStore()
    console.log(date);
    onBeforeMount(() => {

      const data = {
        venueId: venueId.value,
        date: date.value,
      }

      const stripePromise = loadStripe(stripeKey.value)
      stripePromise.then(() => {
        stripeLoaded.value = true
      })
    });


    const pay = () => {

      elms.value.instance.createPaymentMethod(
        {
          elements: elms.value.elements

        }
      ).then((res: any) => {
        console.log(res);
        let data = {
          paymentMethodId: res.paymentMethod.id,
          venueId: venueId.value,
          date: date.value,
          price: price.value,
        }

        PaymentService.generatePaymentIntentBooking( data ).then((res: any) => {
          console.log(res);
        }).catch((err: any) => {
          console.log(err);
        })

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
