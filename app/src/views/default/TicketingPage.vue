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