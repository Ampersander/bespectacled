<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email, maxLength, minLength, required, sameAs } from '@vuelidate/validators'

import { useAuthStore, useUtilsStore } from '@/store'
import { storeToRefs } from 'pinia'

const $router = useRouter()
const $store = useAuthStore()
const $utilsStore = useUtilsStore()

const { user, error, violations } = storeToRefs($store)

const parallax = new URL('@/assets/carnival.jpeg', import.meta.url).href

const valid = ref(true)
// const user = ref($store.user)
const showPassword = ref(false)
const inputs = reactive({
	username: '',
	email: '',
	password: '',
	confirmPassword: '',
	...user?.value
})

const form = ref<null | typeof import('vuetify/components')['VForm']>(null)

const rules = {
	username: { required, minLength: minLength(3), maxLength: maxLength(20) },
	email: { required, email, maxLength: maxLength(50) },
	password: { required, minLength: minLength(7), maxLength: maxLength(40) },
	// sameAs validator is broken for some reason so I'm using a custom one instead
	confirmPassword: { required, sameAs: {
		$validator: (value: string) => value === inputs.password,
		$message: 'Passwords do not match'
	} }
}

const v$ = useVuelidate(rules, inputs)

onBeforeMount(() => !user?.value && $router.push('/login'))

const handleEditProfile = async (payload: any) => {
	if (!valid.value) return

	$utilsStore.setLoading(true)

	try {
		await $store.editProfile(payload)
		if (!user?.value) return
		$utilsStore.showToast('Profile updated!')
		// $router.push({ name: 'login' })
		// $router.push({ name: 'home' })
	} catch (err: any) {
		$utilsStore.showToast('Failed to update profile!', 'danger')
	} finally {
		$utilsStore.setLoading(false)
	}
}
</script>

<template>
	<v-parallax :src="parallax">
		<div class="d-flex flex-column fill-height justify-center align-center">
			<div class="text-white-50 text-h2 font-weight-thin mb-4">{{ user?.username && `${user?.username}'s ` }}Profile</div>
<div class="text-h4 text-secondary">Edit your profile information</div>
		</div>
	</v-parallax>

	<v-card :disabled="$utilsStore.isLoading || !inputs">
		<v-form ref="form" v-model="valid" @submit.prevent="handleEditProfile(inputs)">
			<v-card-text>
				<v-row>
					<v-col cols="12" sm="6">
						<v-text-field
							v-model="inputs.username"
							:error="Boolean(violations?.username)"
							:error-messages="violations?.username || v$.username?.$errors.map((e: any) => e.$message)"
							:counter="20"
							label="Username*"
							required
							clearable
							@input="v$.username.$touch"
							@blur="v$.username.$touch"
						/>
					</v-col>

					<v-col cols="12" sm="6">
						<v-text-field
							v-model="inputs.email"
							:error="Boolean(violations?.email)"
							:error-messages="violations?.email || v$.email?.$errors.map((e: any) => e.$message)"
							:counter="50"
							label="Email*"
							type="email"
							required
							clearable
							@input="v$.email.$touch"
							@blur="v$.email.$touch"
						/>
					</v-col>

					<v-col cols="12" sm="6">
						<v-text-field
							v-model="inputs.password"
							:error="Boolean(violations?.password)"
							:error-messages="violations?.password || v$.password?.$errors.map((e: any) => e.$message)"
							:counter="40"
							label="Password*"
							:type="showPassword ? 'text' : 'password'"
							required
							clearable
							@input="v$.password.$touch"
							@blur="v$.password.$touch"
							:append-inner-icon="inputs.password && (showPassword ? 'fa fa-eye-slash' : 'fa fa-eye')"
							@click:append-inner="showPassword = !showPassword"
						/>
					</v-col>

					<v-col cols="12" sm="6">
						<v-text-field
							v-model="inputs.confirmPassword"
							:error="Boolean(violations?.confirmPassword)"
							:error-messages="violations?.confirmPassword || v$.confirmPassword?.$errors.map((e: any) => e.$message)"
							:counter="40"
							label="Confirm Password*"
							type="password"
							required
							clearable
							@input="v$.confirmPassword.$touch"
							@blur="v$.confirmPassword.$touch"
						/>
					</v-col>
				</v-row>
			</v-card-text>

			<v-card-actions>
				<v-spacer />

				<v-btn :disabled="!v$.$anyDirty" color="primary" @click="form?.reset()" type="reset">Reset</v-btn>
				<v-btn :loading="$utilsStore.isLoading" color="primary" variant="elevated" type="submit" @click="v$.$validate">Edit Profile</v-btn>
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