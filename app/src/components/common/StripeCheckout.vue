<template>
    <div>
        <stripe-checkout ref="checkoutRef" mode="payment" :pk="publishableKey" :line-items="lineItems"
            :success-url="successURL" :cancel-url="cancelURL" @loading="v => loading = v" />
            <v-list-item link prepend-icon="fa fa-ticket" title="Buy Tickets" @click="submit" />
    </div>
</template>


  
<script >
import { StripeCheckout } from '@vue-stripe/vue-stripe';
import { STRIPE_PK } from "../../utils/config";


export default {
    props: ['event'],
    setup(props) {
        // setup() receives props as the first argument.
        console.log(props.event)
    },
    components: {
        StripeCheckout,
    },
    data(props) {
        this.publishableKey = STRIPE_PK;
        return {
            publishableKey: STRIPE_PK,
            loading: false,
            lineItems: [
                {
                    price: props.event.stripePriceId, // The id of the one-time price you created in your Stripe dashboard
                    quantity: 1,
                },
            ],
            successURL: window.location.origin + '?success=true',
            cancelURL: window.location.origin + '?canceled=true',
        };
    },
    methods: {
        submit() {
            console.log(this);
            // You will be redirected to Stripe's secure checkout page
            this.$refs.checkoutRef.redirectToCheckout((data)=> {
                console.log(data);
                console.log(this);
            });

            // You can also pass a callback that will be called after the redirect

            // this.$refs.checkoutRef.redirectToCheckout((error) => {
            //     // handle possible errors
            //     if (error) {
            //         console.log(error);
            //     }
        },
    },
};
</script>