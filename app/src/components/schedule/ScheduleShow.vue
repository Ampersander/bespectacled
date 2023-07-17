<template>
  <Toolbar
    :actions="['delete']"
    :breadcrumb="breadcrumb"
    :is-loading="isLoading"
    @delete="deleteItem"
  />

  <v-container fluid>
    <v-alert v-if="error || deleteError" type="error" class="mb-4" closable>
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
            {{ $t("schedule.date") }}
          </td>

          <td>
            {{ item.date }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("schedule.times") }}
          </td>

          <td>
            {{ item.times }}
                      </td>
        </tr>
        <tr>
          <td>
            {{ $t("schedule.event") }}
          </td>

          <td>
            <router-link
              v-if="router.hasRoute('EventShow')"
              :to="{ name: 'EventShow', params: { id: item.event?.['@id'] } }"
            >
              {{ item.event?.["@id"] }}
            </router-link>

            <p v-else>
              {{ item.event?.["@id"] }}
            </p>
          </td>
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
import { useScheduleDeleteStore, useScheduleShowStore } from "@/store";
import { useBreadcrumb } from "@/composables/breadcrumb";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const breadcrumb = useBreadcrumb();

const scheduleShowStore = useScheduleShowStore();
const { retrieved: item, isLoading, error } = storeToRefs(scheduleShowStore);

const scheduleDeleteStore = useScheduleDeleteStore();
const { deleted, error: deleteError } = storeToRefs(scheduleDeleteStore);

useMercureItem({
  store: scheduleShowStore,
  deleteStore: scheduleDeleteStore,
  redirectRouteName: "ScheduleList",
});

await scheduleShowStore.retrieve(decodeURIComponent(route.params.id as string));

async function deleteItem() {
  if (!item?.value) {
    scheduleDeleteStore.setError(t("itemNotFound"));
    return;
  }

  await scheduleDeleteStore.deleteItem(item.value);

  if (!deleted?.value) {
    return;
  }

  router.push({ name: "ScheduleList" });
}

onBeforeUnmount(() => {
  scheduleShowStore.$reset();
});
</script>
