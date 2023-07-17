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

<script lang="ts" setup>
import { onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import Toolbar from "@/components/common/Toolbar.vue";
import Form from "@/components/user/UserForm.vue";
import Loading from "@/components/common/Loading.vue";
import { useUserCreateStore, useUserDeleteStore, useUserUpdateStore } from "@/store";
import { useMercureItem } from "@/composables/mercureItem";
import { useBreadcrumb } from "@/composables/breadcrumb";
import type { User } from "@/types/user";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const breadcrumb = useBreadcrumb();

const userCreateStore = useUserCreateStore();
const { created } = storeToRefs(userCreateStore);

const userDeleteStore = useUserDeleteStore();
const { isLoading: deleteLoading, error: deleteError } =
  storeToRefs(userDeleteStore);

const userUpdateStore = useUserUpdateStore();
const {
  retrieved: item,
  updated,
  isLoading,
  error,
  violations,
} = storeToRefs(userUpdateStore);

useMercureItem({
  store: userUpdateStore,
  deleteStore: userDeleteStore,
  redirectRouteName: "UserList",
});

await userUpdateStore.retrieve(decodeURIComponent(route.params.id as string));

async function update(item: User) {
  await userUpdateStore.update(item);
}

async function deleteItem() {
  if (!item?.value) {
    userUpdateStore.setError(t("itemNotFound"));
    return;
  }

  await userDeleteStore.deleteItem(item?.value);

  router.push({ name: "UserList" });
}

onBeforeUnmount(() => {
  userUpdateStore.$reset();
  userCreateStore.$reset();
  userDeleteStore.$reset();
});
</script>
