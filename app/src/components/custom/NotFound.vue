<script setup>
const parallax = new URL('@/assets/404.png', import.meta.url).href
</script>

<template>
	<v-parallax class="w-auto h-screen mb-6" :src="parallax">
		<v-sheet color="transparent" class="d-flex flex-column fill-height justify-center align-center text-white">
			<div class="text-white-50 mb-4 text-h1 font-weight-black backdrop blend blend-dark">Uh oh!</div>
			<div class="h1 font-weight-black backdrop blend blend-dark">This page doesn't exist.</div>

			<v-btn color="primary"
				prepend-icon="fa fa-beat fa-arrow-left"
				append-icon="fa fa-fade fa-home"
				size="x-large"
				@click="() => $router.push({ name: 'home' })"
			/>
		</v-sheet>
	</v-parallax>
</template>

<!-- <style>
html {
	overflow-y: auto !important;
}

.v-parallax {
	height: calc(100vh - (48px + 16px * 3)) !important;
	margin-bottom: 16px;
}

.v-parallax .v-btn {
	position: absolute;
	bottom: 48px;
}

.v-parallax .v-img__img {
	object-fit: cover;
}
</style> -->