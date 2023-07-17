<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useScheduleDeleteStore, useScheduleListStore } from "@/store";
import Toolbar from "@/components/common/Toolbar.vue";
import ActionCell from "@/components/common/ActionCell.vue";
import { useMercureList } from "@/composables/mercureList";
import { useBreadcrumb } from "@/composables/breadcrumb";
import type { VuetifyOrder } from "@/types/list";
import type { Schedule } from "@/types/schedule";

const { t } = useI18n();
const router = useRouter();
const breadcrumb = useBreadcrumb();

const scheduleDeleteStore = useScheduleDeleteStore();
const { deleted, mercureDeleted } = storeToRefs(scheduleDeleteStore);

const scheduleListStore = useScheduleListStore();
const { items, totalItems, error, isLoading } = storeToRefs(scheduleListStore);

const page = ref("1");
const order = ref({});

async function sendRequest() {
  await scheduleListStore.getItems({
    page: page.value,
    order: order.value,
  });
}

useMercureList({ store: scheduleListStore, deleteStore: scheduleDeleteStore });

sendRequest();

const headers = [
  {
    title: t("actions"),
    key: "actions",
    sortable: false,
  },
  {
    title: t("schedule.date"),
    key: "date",
    sortable: false,
  },
  {
    title: t("schedule.times"),
    key: "times",
    sortable: false,
  },
  {
    title: t("schedule.event"),
    key: "event",
    sortable: false,
  },
];

function updatePage(newPage: string) {
  page.value = newPage;

  sendRequest();
}

function updateOrder(newOrders: VuetifyOrder[]) {
  const newOrder = newOrders[0];
  order.value = { [newOrder.key]: newOrder.order };

  sendRequest();
}


function goToShowPage(item: Schedule) {
  router.push({
    name: "ScheduleShow",
    params: { id: item.id },
  });
}

function goToCreatePage() {
  router.push({
    name: "ScheduleCreate",
  });
}

function goToUpdatePage(item: Schedule) {
  router.push({
    name: "ScheduleUpdate",
    params: { id: item.id },
  });
}

async function deleteItem(item: Schedule) {
  await scheduleDeleteStore.deleteItem(item);

  sendRequest();
}

onBeforeUnmount(() => {
  scheduleDeleteStore.$reset();
});
</script>

<template>
  <Toolbar
    :actions="['add']"
    :breadcrumb="breadcrumb"
    :is-loading="isLoading"
    @add="goToCreatePage"
  />

  <v-container fluid>
    <v-alert v-if="deleted" type="success" class="mb-4" closable>
      {{ $t("itemDeleted", [deleted.id]) }}
    </v-alert>
    <v-alert v-if="mercureDeleted" type="success" class="mb-4" closable>
      {{ $t("itemDeletedByAnotherUser", [mercureDeleted.id]) }}
    </v-alert>

    <v-alert v-if="error" type="error" class="mb-4" closable>
      {{ error }}
    </v-alert>


    <v-data-table-server
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="isLoading"
      :items-per-page="items.length"
      @update:page="updatePage"
      @update:sortBy="updateOrder"
    >
      <template #item.actions="{ item }">
        <ActionCell
          :actions="['show', 'update', 'delete']"
          @show="goToShowPage(item.raw)"
          @update="goToUpdatePage(item.raw)"
          @delete="deleteItem(item.raw)"
        />
      </template>

      <template #item.date="{ item }">
        <router-link :to="{ name: 'ScheduleShow', params: { id: item.raw.id } }">
          {{ item.raw.date }}
        </router-link>
      </template>

      <template #item.event="{ item }">
        <router-link
          v-if="router.hasRoute('EventShow') && item.raw.event?.id"
          :to="{ name: 'EventShow', params: { id: item.raw.event?.id } }"
        >
          {{ item.raw.event?.title }}
        </router-link>

        <p v-else>
          {{ item.raw.event?.title }}
        </p>
      </template>
    </v-data-table-server>
  </v-container>
</template>