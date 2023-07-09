<script setup>
import { ref } from 'vue'

const cycle = ref(true)

const slides = [
	new URL('@/assets/maestro.jpeg', import.meta.url).href,
	new URL('@/assets/carnival.jpeg', import.meta.url).href,
	new URL('@/assets/concert.jpeg', import.meta.url).href,
	new URL('@/assets/neon-lights.jpeg', import.meta.url).href,
	new URL('@/assets/theatre.jpeg', import.meta.url).href
]
</script>

<template>
	<v-carousel class="w-auto h-screen mb-6" color="secondary" :cycle="cycle"  hide-delimiter-background progress="primary" show-arrows="hover">
		<v-carousel-item v-for="(slide, i) in slides" :key="i">
			<v-parallax :src="slide">
				<v-sheet color="transparent" class="d-flex flex-column fill-height justify-center align-center text-white">
					<div :class="[`text-${i === 5 ? 'black' : 'white'}-50`, 'mb-4 text-h1 font-weight-black blend']">BeSpectacled</div>
					<div class="h1 font-weight-black blend">Book tickets for broadway shows, concerts, and more!</div>

					<v-btn color="primary"
						prepend-icon="fa fa-fade fa-computer-mouse"
						append-icon="fa fa-bounce fa-arrow-down"
						size="x-large"
						v-scroll-to:50="'.twitter-timeline'"
					/>

					<v-btn class="controls" :icon="'fa fa-beat-fade ' + (cycle ? 'fa-pause' : 'fa-play')" color="primary" @click="cycle = !cycle" />
				</v-sheet>
			</v-parallax>
		</v-carousel-item>
	</v-carousel>
</template>