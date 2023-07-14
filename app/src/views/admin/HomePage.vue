<script setup lang="ts">
import { computed, onMounted, ref, onBeforeMount } from 'vue'
import PaymentService from '@/services/payment.service';

const categories = ref([
	{ name: 'User', icon: 'fa fa-user-tie', to: '/users/', children: [] },
	{ name: 'Event', icon: 'fa fa-star', to: '/events/', children: [] },
	{ name: 'Venue', icon: 'fa fa-location-dot', to: '/venues/', children: [] },
	{ name: 'Schedule', icon: 'fa fa-calendar-days', to: '/schedule/', key: 'day', children: [] }
])

const parallax = new URL('@/assets/stadium.jpeg', import.meta.url).href

onBeforeMount(() => {
	//if the url possess ?success, then the payment was successful
	if (window.location.search.includes('?success')) {

		//check if the payment was successful
		PaymentService.checkPayment().then((response) => {
			console.log(response);
		});	
	}
})

</script>

<template>
	<v-parallax :src="parallax">
		<div class="d-flex flex-column fill-height justify-center align-center">
			<div class="text-h2 font-weight-thin mb-4">BeSpectacled Admin</div>
			<div class="text-h4 text-secondary">Manage the website's content</div>
		</div>
	</v-parallax>

	<!-- <v-row justify="space-around">
		<v-col v-for="n in 4" class="text-center" cols="12" sm="6">
			<v-card class="mx-auto" @click="() => $router.push('/admin/users')">
				<v-card-item class="w-50">
					<div>
						<div class="mb-2 text-overline">OVERLINE</div>
						<div class="mb-2 text-h5 font-weight-bold">87.365</div>
						<div class="mb-n2 text-overline">Registrations</div>
						<div class="text-overline">in the last month</div>
					</div>
				</v-card-item>
			</v-card>
		</v-col>
	</v-row> -->

	<v-row>
		<v-col cols="6">
			<v-card>
				<v-list lines="two">
					<v-list-subheader>Manage Entities</v-list-subheader>

					<v-list-item
						v-for="{ name, icon, to, key, children } in categories"
						:key="name"
						:prepend-icon="icon"
						@click="() => $router.push('/admin' + to)"
						:title="`Manage ${name}s`"
					/>
					<!-- :subtitle="`${children?.length ?? 0} ${(key || name).toLowerCase()}${children?.length === 1 ? '' : 's'}`" -->
				</v-list>
			</v-card>
		</v-col>

		<v-col cols="6">
			<v-card>
				<v-list lines="two">
					<v-list-subheader>Create Entities</v-list-subheader>

					<v-list-item
						v-for="{ name, icon, to, key, children } in categories"
						:key="name"
						:prepend-icon="icon"
						@click="() => $router.push('/admin' + to + 'create')"
						:title="`Create ${name}`"
					/>
				</v-list>
			</v-card>
		</v-col>
	</v-row>
</template>

<style>
.v-parallax {
	height: calc(50vh - (48px + 16px * 2)) !important;
	margin-bottom: 16px;
}

.v-parallax .v-btn {
	position: absolute;
	bottom: 16px;
}
</style>