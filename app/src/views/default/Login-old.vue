<script setup>
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const $store = useStore()
const $router = useRouter()

const valid = true
const step = ref(1)
const message = ref('')
const loading = ref(false)
const loggedIn = computed(() => $store.state.auth.status.loggedIn)
const inputs = reactive({ email: '', password: '', confirmPassword: '' })
const errors = reactive({ email: '', password: '', confirmPassword: '' })
const currentTitle = computed(() => {
	switch (step.value) {
		case 1: return 'Login'
		case 2: return 'Create a password'
		default: return 'Account created'
	}
})
const rules = {
	email: [
		(v) => !!v || 'Email is required',
		(v) => /.+@.+\..+/.test(v) || 'Email must be valid',
		(v) => (v && v.length <= 50) || 'Email must be less than 50 characters'
	], password: [
		(v) => !!v || 'Password is required',
		(v) => (v && v.length >= 6) || 'Password must be at least 6 characters',
		(v) => (v && v.length <= 40) || 'Password must be less than 40 characters'
	], confirmPassword: [
		(v) => !!v || 'Password confirmation is required',
		(v) => (v && v.length >= 6) || 'Password confirmation must be at least 6 characters',
		(v) => (v && v.length <= 40) || 'Password confirmation must be less than 40 characters',
		(v) => (v && v === inputs.password) || 'Password confirmation must match password'
	]
}

onBeforeMount(() => loggedIn.value && $router.push('/profile'))

const handleLogin = async user => {
	loading.value = true

	try {
		await $store.dispatch('auth/login', user)
		$router.push('/profile')
	} catch (err) {
		message.value = err?.response?.data?.message || err.message || err.toString()

		if (err.response.data.error) errors['email'] = err.response.data.error
		else if (err.response.data.violations) err.response.data.violations.forEach(v => errors[v.propertyPath] = v.message)
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<div class="text-h3 text-center my-8">Login</div>

	<v-form ref="form" v-model="valid" lazy-validation @submit.prevent="handleLogin">
		<v-card class="mx-auto" max-width="500">
			<v-card-title class="d-flex text-h6 font-weight-regular justify-space-between">
				<span>{{ currentTitle }}</span>
				<v-avatar color="primary" size="24" v-text="step" />
			</v-card-title>

			<v-window v-model="step">
				<v-window-item :value="1">
					<v-card-text>
						<v-text-field label="Email" type="email" name="email" placeholder="john@doe.com" :rules="rules.email" />
						<span class="text-caption text-grey-darken-1">This is the email you will use to login to your BeSpectacled account.</span>
					</v-card-text>
				</v-window-item>

				<v-window-item :value="2">
					<v-card-text>
						<v-text-field label="Password" type="password" name="password" :rules="rules.password" />
						<v-text-field label="Confirm Password" type="password" name="confirmPassword" :rules="rules.confirmPassword" />
						<span class="text-caption text-grey-darken-1">Please enter a password for your account.</span>
					</v-card-text>
				</v-window-item>

				<v-window-item :value="3">
					<div class="pa-4 text-center">
						<v-img class="mb-4" contain height="128" src="https://cdn.vuetifyjs.com/images/logos/v.svg"></v-img>
						<h3 class="text-h6 font-weight-light mb-2">Welcome to Vuetify</h3>
						<span class="text-caption text-grey">Thanks for signing up!</span>
					</div>
				</v-window-item>
			</v-window>

			<v-divider></v-divider>

			<v-card-actions>
				<v-btn v-if="step > 1" variant="text" @click="step--">Back</v-btn>
				<v-spacer></v-spacer>
				<v-btn v-if="step < 3" color="primary" variant="flat" @click="step++">Next</v-btn>
				<!-- :disabled="loading" -->
			</v-card-actions>
		</v-card>
	</v-form>
</template>