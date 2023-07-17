<script setup>
import image from '@/assets/404.png'
const onIntersect = {
	handler: (b, e) => {
		e[0].target.style.transition = 'opacity .3s ease'
		e[0].target.style.opacity = e[0].intersectionRatio
	},
	options: { threshold: [0, .25, .5, .75, 1] }
}
</script>

<template>
	<v-parallax :src="image">
		<div class="d-flex flex-column fill-height justify-center align-center text-white">
			<h1 class="text-primary text-h1 font-weight-thin mb-4">W. I. P.</h1>
			<h4 class="text-amber">Please check back later as this page is still under construction.</h4>

			<v-btn
				color="primary"
				prepend-icon="fa fa-fade fa-arrow-left"
				append-icon="fa fa-bounce fa-home"
				size="x-large"
				@click="() => $router.push({ name: 'home' })"
			/>
		</div>
	</v-parallax>

	<v-row>
		<v-col v-for="n in 24" :key="n" cols="4">
			<v-card height="200" v-intersect="onIntersect" />
		</v-col>
	</v-row>
</template>

<style>
.v-parallax {
	height: calc(100vh - (48px + 16px * 2)) !important;
	margin-bottom: 16px;
}

.v-parallax .v-sheet .v-btn {
	position: absolute;
	bottom: 48px;
}

.v-parallax .v-img__img {
	object-fit: cover;
}
</style>