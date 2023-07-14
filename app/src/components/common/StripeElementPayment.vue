<template>
  <div>
    <stripe-element-payment
      ref="paymentRef"
      :pk="pk"
      :elements-options="elementsOptions"
      :confirm-params="confirmParams"
    />
    <button @click="pay">Pay</button>
  </div>
</template>

<script>
import { StripeElementPayment } from '@vue-stripe/vue-stripe';
import { STRIPE_PK } from "../../utils/config";
import PaymentService from '@/services/payment.service';

export default {
  props: ['event', 'date', 'time'],
  components: {
    StripeElementPayment,
  },
  data() {
    this.pk = STRIPE_PK;
    return {
      pk: STRIPE_PK,
      elementsOptions: {
        appearance: {}, // appearance options
      },
      confirmParams: {
        return_url: window.location.origin + '?success', // success url
      },
    };
  },
  mounted() {
    this.generatePaymentIntent();
  },
  methods: {
    async generatePaymentIntent() {
      let eventId = this.event.id;
      let date = this.date;
      let time = this.time;

      const data = {
        eventId,
        date,
        time
      };
      console.log(data);

      const paymentIntent = await PaymentService.generatePaymentIntent(data); // this is just a dummy, create your own API call
      PaymentService.setPaymentIntent(paymentIntent.clientSecret);
      console.log(PaymentService.getPaymentIntent());
      this.elementsOptions.clientSecret = paymentIntent.client_secret;
    },
    pay() { 
      this.$refs.paymentRef.submit();
    },
  },
};
</script>