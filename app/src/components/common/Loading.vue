<script setup lang="ts">
defineProps<{ visible: boolean }>()
</script>

<template>
	<v-overlay :model-value="visible" class="align-center justify-center">
		<v-progress-circular indeterminate size="64" color="primary" />
	</v-overlay>
</template>