<script setup>
import { ref } from 'vue'

const model = ref(false)

const onScroll = () => model.value = window.scrollY > 200
const onClick = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
	<v-layout-item class="text-end pointer-events-none" size="88" position="bottom" model-value v-scroll="onScroll">
		<div class="ma-4">
			<v-fab-transition>
				<v-btn v-show="model" class="mt-auto pointer-events-initial" color="primary" elevation="8" icon="fa fa-chevron-up" size="large" @click="onClick" />
			</v-fab-transition>
		</div>
	</v-layout-item>
</template>

<style scoped>
.pointer-events-none {
	pointer-events: none;
}

.pointer-events-initial {
	pointer-events: initial;
}
</style>