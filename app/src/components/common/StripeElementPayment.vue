<template>
    <div>
      <stripe-element-payment
        ref="paymentRef"
        :pk="pk"
        :elements-options="elementsOptions"
        :confirm-params="confirmParams"
      />
      <button @click="pay">Pay Now {{event.price}} €</button>
    </div>
  </template>
  
  <script>
  import { StripeElementPayment } from '@vue-stripe/vue-stripe';
  import { STRIPE_PK } from "../../utils/config";
  import PaymentService from "@/services/PaymentService";

  export default {
    props: ['event'],
    setup(props) {
        // setup() receives props as the first argument.
        console.log(props.event)
    },
    components: {
      StripeElementPayment,
    },
    data () {
      this.pk = STRIPE_PK;
      return {
        pk: STRIPE_PK,
        elementsOptions: {
          appearance: {}, // appearance options
        },
        confirmParams: {
          return_url:  window.location.origin +'/success', // success url
        },
      };
    },
    mounted () {
      this.generatePaymentIntent();
    },
    methods: {
      async generatePaymentIntent () {
        const paymentIntent = await PaymentService.generatePaymentIntent(); // this is just a dummy, create your own API call
        this.elementsOptions.clientSecret = paymentIntent.client_secret;
      },
      pay () {
        this.$refs.paymentRef.submit();
      },
    },
  };
  </script>