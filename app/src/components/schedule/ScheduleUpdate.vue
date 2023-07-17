<script lang="ts" setup>
import { onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import Toolbar from "@/components/common/Toolbar.vue";
import Form from "@/components/schedule/ScheduleForm.vue";
import Loading from "@/components/common/Loading.vue";
import { useScheduleCreateStore, useScheduleDeleteStore, useScheduleUpdateStore } from "@/store";
import { useMercureItem } from "@/composables/mercureItem";
import { useBreadcrumb } from "@/composables/breadcrumb";
import type { Schedule } from "@/types/schedule";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const breadcrumb = useBreadcrumb();

const scheduleCreateStore = useScheduleCreateStore();
const { created } = storeToRefs(scheduleCreateStore);

const scheduleDeleteStore = useScheduleDeleteStore();
const { isLoading: deleteLoading, error: deleteError } =
  storeToRefs(scheduleDeleteStore);

const scheduleUpdateStore = useScheduleUpdateStore();
const {
  retrieved: item,
  updated,
  isLoading,
  error,
  violations,
} = storeToRefs(scheduleUpdateStore);

useMercureItem({
  store: scheduleUpdateStore,
  deleteStore: scheduleDeleteStore,
  redirectRouteName: "ScheduleList",
});

await scheduleUpdateStore.retrieve(decodeURIComponent(route.params.id as string));

async function update(item: Schedule) {
  await scheduleUpdateStore.update(item);
}

async function deleteItem() {
  if (!item?.value) {
    scheduleUpdateStore.setError(t("itemNotFound"));
    return;
  }

  await scheduleDeleteStore.deleteItem(item?.value);

  router.push({ name: "ScheduleList" });
}

onBeforeUnmount(() => {
  scheduleUpdateStore.$reset();
  scheduleCreateStore.$reset();
  scheduleDeleteStore.$reset();
});
</script>

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

    <v-alert v-if="created || updated" type="success" class="mb-4">
      <template v-if="updated">
        {{ $t("itemUpdated", [updated["@id"]]) }}
      </template>
      <template v-else-if="created">
        {{ $t("itemCreated", [created["@id"]]) }}
      </template>
    </v-alert>

    <Form v-if="item" :values="item" :errors="violations" @submit="update" />
  </v-container>

  <Loading :visible="isLoading || deleteLoading" />
</template>