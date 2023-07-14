<script setup>
import { onBeforeMount } from 'vue'
import paymentService from '@/services/payment.service';

const onIntersect = {
	handler: (b, e) => {
		e[0].target.style.transition = 'opacity .3s ease'
		e[0].target.style.opacity = e[0].intersectionRatio
	},
	options: { threshold: [0, .25, .5, .75, 1] }
}

onBeforeMount(() => {
	const script = document.createElement('script')
	script.src = 'https://platform.twitter.com/widgets.js'
	script.async = true
	document.head.appendChild(script)

	//if the url possess ?success, then the payment was successful
	if (window.location.search.includes('?success')) {
		//check if the payment was successful
		let paymentIntentId = paymentService.getPaymentIntent();
		paymentService.checkPayment(paymentIntentId).then((response) => {
			console.log(response);
		});	
	}
})
</script>

<template>
	<v-row style="flex-wrap: nowrap;">
		<v-sheet v-show="$vuetify.display.mdAndUp" class="w-auto me-6 sticky-top sticky-full overflow-x-hidden overflow-y-auto" min-width="300" rounded>
			<v-card flat loading class="twitter-timeline text-decoration-none" width="300" height="inherit" data-chrome="noheader,nofooter,noscrollbar,noborders" data-lang="en" data-width="300" data-dnt="true" :data-theme="$vuetify.theme.name" href="https://twitter.com/newyorkcity?ref_src=twsrc%5Etfw">
				<template #loader="{ isActive }">
					<v-progress-linear :active="isActive" color="primary" indeterminate />
				</template>

				<v-sheet color="transparent" class="d-flex flex-column fill-height justify-center align-center text-white">
					<v-icon icon="fab fa-twitter" size="x-large" />
					<v-progress-circular class="position-absolute" color="primary" size="64" indeterminate />
				</v-sheet>
			</v-card>
		</v-sheet>

		<v-row class="w-50 mb-0">
			<!-- <div class="blend text-h1 font-weight-thin ml-10 my-4">What's New?</div> -->
			<v-img v-intersect="onIntersect" class="w-100" src="https://www.nyc.com/images/broadway/lion_king.png" />
			<v-img v-intersect="onIntersect" class="w-100" src="https://www.nyc.com/images/broadway/alladin.png" />
			<v-img v-intersect="onIntersect" class="w-100" src="https://www.nyc.com/images/broadway/wicked.png" />

			<!-- <v-col v-for="n in 24" :key="n" cols="12" sm="6" md="4">
				<v-card width="auto" height="200" v-intersect="onIntersect" />
			</v-col> -->
		</v-row>
	</v-row>
</template>