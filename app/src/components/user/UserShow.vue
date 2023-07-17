<template>
  <Toolbar
    :actions="['delete']"
    :breadcrumb="breadcrumb"
    :is-loading="isLoading"
    @delete="deleteItem"
  />

  <v-container fluid>
    <v-alert v-if="error || deleteError" type="error" class="mb-4">
      {{ error || deleteError }}
    </v-alert>

    <v-table v-if="item">
      <thead>
        <tr>
          <th>{{ $t("field") }}</th>
          <th>{{ $t("value") }}</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>
            {{ $t("user.username") }}
          </td>

          <td>
            {{ item.username }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.email") }}
          </td>

          <td>
            {{ item.email }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.password") }}
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.roles") }}
          </td>

          <td>
            {{ item.roles }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.enabled") }}
          </td>

          <td>
            {{ item.enabled }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.events") }}
          </td>

          <td>
            <template v-if="router.hasRoute('EventShow')">
              <router-link
                v-for="event in item.events"
                :to="{ name: 'EventShow', params: { id: event['@id'] } }"
                :key="event['@id']"
              >
                {{ event["@id"] }}

                <br />
              </router-link>
            </template>

            <template v-else>
              <p
                v-for="event in item.events"
                :key="event['@id']"
              >
                {{ event["@id"] }}
              </p>
            </template>
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.tickets") }}
          </td>

          <td>
            <template v-if="router.hasRoute('TicketShow')">
              <router-link
                v-for="ticket in item.tickets"
                :to="{ name: 'TicketShow', params: { id: ticket['@id'] } }"
                :key="ticket['@id']"
              >
                {{ ticket["@id"] }}

                <br />
              </router-link>
            </template>

            <template v-else>
              <p
                v-for="ticket in item.tickets"
                :key="ticket['@id']"
              >
                {{ ticket["@id"] }}
              </p>
            </template>
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.bookings") }}
          </td>

          <td>
            <template v-if="router.hasRoute('BookingShow')">
              <router-link
                v-for="booking in item.bookings"
                :to="{ name: 'BookingShow', params: { id: booking['@id'] } }"
                :key="booking['@id']"
              >
                {{ booking["@id"] }}

                <br />
              </router-link>
            </template>

            <template v-else>
              <p
                v-for="booking in item.bookings"
                :key="booking['@id']"
              >
                {{ booking["@id"] }}
              </p>
            </template>
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.transactions") }}
          </td>

          <!-- <td>
            <template v-if="router.hasRoute('TransactionShow')">
              <router-link
                v-for="transaction in item.transactions"
                :to="{ name: 'TransactionShow', params: { id: transaction } }"
                :key="transaction"
              >
                {{ transaction }}

                <br />
              </router-link>
            </template>

            <template v-else>
              <p
                v-for="transaction in item.transactions"
                :key="transaction"
              >
                {{ transaction }}
              </p>
            </template>
          </td> -->
        </tr>
        <tr>
          <td>
            {{ $t("user.createdAt") }}
          </td>

          <td>
            {{ formatDateTime(item.createdAt) }}
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.updatedAt") }}
          </td>

          <td>
            {{ formatDateTime(item.updatedAt) }}
          </td>
        </tr>
        <tr>
          <td>
            {{ $t("user.deletedAt") }}
          </td>

          <!-- <td>
            {{ formatDateTime(item.deletedAt) }}
          </td> -->
        </tr>
      </tbody>
    </v-table>
  </v-container>

  <Loading :visible="isLoading" />
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Toolbar from "@/components/common/Toolbar.vue";
import Loading from "@/components/common/Loading.vue";
import { useMercureItem } from "@/composables/mercureItem";
import { useUserDeleteStore, useUserShowStore } from "@/store";
import { formatDateTime } from "@/utils/date";
import { useBreadcrumb } from "@/composables/breadcrumb";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const breadcrumb = useBreadcrumb();

const userShowStore = useUserShowStore();
const { retrieved: item, isLoading, error } = storeToRefs(userShowStore);

const userDeleteStore = useUserDeleteStore();
const { deleted, error: deleteError } = storeToRefs(userDeleteStore);

useMercureItem({
  store: userShowStore,
  deleteStore: userDeleteStore,
  redirectRouteName: "UserList",
});

await userShowStore.retrieve(decodeURIComponent(route.params.id as string));

async function deleteItem() {
  if (!item?.value) {
    userDeleteStore.setError(t("itemNotFound"));
    return;
  }

  await userDeleteStore.deleteItem(item.value);

  if (!deleted?.value) {
    return;
  }

  router.push({ name: "UserList" });
}

onBeforeUnmount(() => {
  userShowStore.$reset();
});
</script>
