<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email, minLength, maxLength, required } from '@vuelidate/validators'

import { useAuthStore, useUtilsStore } from '@/store'

const $router = useRouter()
const $store = useAuthStore()
const $utilsStore = useUtilsStore()

const { user, error, violations } = storeToRefs($store)

const parallax = new URL('@/assets/carnival.jpeg', import.meta.url).href

const valid = ref(true)
const showPassword = ref(false)
const inputs = reactive({ email: '', password: '' })
const form = ref<null | typeof import('vuetify/components')['VForm']>(null)

const rules = {
	email: { required, email, maxLength: maxLength(50) },
	password: { required, minLength: minLength(6), maxLength: maxLength(40) }
}

const v$ = useVuelidate(rules, inputs)

onBeforeMount(() => user?.value && $router.push('/profile'))

const handleLogin = async (user: any) => {
	if (!valid.value) return

	$utilsStore.setLoading(true)

	try {
		await $store.login(user)
		$utilsStore.showToast('Login successful!')
		$router.push({ name: 'home' })
	} catch (err: any) {
		$utilsStore.showToast(err, 'danger')
	} finally {
		$utilsStore.setLoading(false)
	}
}
</script>

<template>
	<v-parallax :src="parallax">
		<div class="d-flex flex-column fill-height justify-center align-center">
			<div class="text-white-50 text-h2 font-weight-thin mb-4">BeSpectacled Login</div>
			<div class="text-h4 text-primary">Login to your account</div>
		</div>
	</v-parallax>

	<v-card :disabled="$utilsStore.isLoading || !inputs">
		<v-form ref="form" v-model="valid" @submit.prevent="handleLogin(inputs)">
			<v-card-text>
				<v-row>
					<v-col cols="12">
						<v-text-field
							autofocus
							v-model="inputs.email"
							:error-messages="v$.email?.$errors.map((e: any) => e.$message)"
							:counter="50"
							label="Email*"
							type="email"
							required
							@input="v$.email.$touch"
							@blur="v$.email.$touch"
						/>
					</v-col>

					<v-col cols="12">
						<v-text-field
							v-model="inputs.password"
							:error-messages="v$.password?.$errors.map((e: any) => e.$message)"
							:counter="40"
							label="Password*"
							:type="showPassword ? 'text' : 'password'"
							required
							@input="v$.password.$touch"
							@blur="v$.password.$touch"
							:append-inner-icon="inputs.password && (showPassword ? 'fa fa-eye-slash' : 'fa fa-eye')"
							@click:append-inner="showPassword = !showPassword"
						/>
					</v-col>
				</v-row>
			</v-card-text>

			<v-card-actions>
				<v-btn color="primary" variant="tonal" @click="$router.push('/register')">No account yet?</v-btn>
				<!-- <v-btn color="primary" variant="tonal" @click="$router.push('/forgot-password')">Forgot Password?</v-btn> -->

				<v-spacer />

				<v-btn :disabled="!v$.$anyDirty" color="primary" @click="form?.reset()" type="reset">Reset</v-btn>
				<v-btn :loading="$utilsStore.isLoading" color="primary" variant="elevated" type="submit" @click="v$.$validate">Login</v-btn>
			</v-card-actions>
		</v-form>
	</v-card>
</template>

<style scoped>
.v-parallax {
	height: calc(50vh - (48px + 16px * 2)) !important;
	margin-bottom: 16px;
}

.card-container.card {
	padding: 40px 40px;
}

.card {
	padding: 20px 25px 30px;
	margin: 0 auto 25px;
	margin-top: 50px;
}
</style>