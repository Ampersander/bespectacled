<script setup lang="ts">
import { ref } from 'vue'

// const numbers = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 0])
// const letters = ref('qwertyuiop'.split(''))

const settings = ref({
	alignment: 1,
	formatting: [],
	picker: 'black',
	swatches: [
		['#FF0000', '#AA0000', '#550000'],
		['#FFFF00', '#AAAA00', '#555500'],
		['#00FF00', '#00AA00', '#005500'],
		['#00FFFF', '#00AAAA', '#005555'],
		['#0000FF', '#0000AA', '#000055'],
	],
	value: 'Hello World.\r\rStart editing...',
})
</script>

<template>
	<v-card max-width="600" class="mx-auto">
		<div class="d-flex justify-space-between pa-4 pb-0">
			<v-btn-toggle v-model="settings.formatting" multiple variant="outlined" divided>
				<v-btn>
					<v-icon icon="mdi-format-italic"></v-icon>
				</v-btn>

				<v-btn>
					<v-icon icon="mdi-format-bold"></v-icon>
				</v-btn>

				<v-btn>
					<v-icon icon="mdi-format-underline"></v-icon>
				</v-btn>

				<v-btn>
					<div class="d-flex align-center flex-column justify-center">
						<v-icon icon="mdi-format-color-text"></v-icon>

						<v-sheet tile height="4" width="26" color="purple"></v-sheet>
						<v-color-picker v-model="settings.picker" :swatches="settings.swatches" hide-canvas hide-inputs show-swatches />
					</div>
				</v-btn>
			</v-btn-toggle>

			<v-btn-toggle v-model="settings.alignment" variant="outlined" divided>
				<v-btn>
					<v-icon icon="mdi-format-align-center"></v-icon>
				</v-btn>

				<v-btn>
					<v-icon icon="mdi-format-align-left"></v-icon>
				</v-btn>

				<v-btn>
					<v-icon icon="mdi-format-align-right"></v-icon>
				</v-btn>
			</v-btn-toggle>
		</div>

		<v-sheet class="pa-4 text-center">
			<v-textarea v-model="settings.value" variant="outlined" auto-grow full-width rows="2" hide-details></v-textarea>
		</v-sheet>
	</v-card>
</template>