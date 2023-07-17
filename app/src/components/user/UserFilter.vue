<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.enabled"
          :label="$t('user.enabled')"
          type="boolean"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.username"
          :label="$t('user.username')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.email"
          :label="$t('user.email')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.roles"
          :label="$t('user.roles')"
          type="string"
        />
      </v-col>
      <!-- <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.password"
          :label="$t('user.password')"
          type="string"
        />
      </v-col> -->
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.enabled"
          :label="$t('user.enabled')"
          type="boolean"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.events"
          :label="$t('user.events')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.tickets"
          :label="$t('user.tickets')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.bookings"
          :label="$t('user.bookings')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.transactions"
          :label="$t('user.transactions')"
          type="string"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.createdAt"
          :label="$t('user.createdAt')"
          type="dateTime"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.updatedAt"
          :label="$t('user.updatedAt')"
          type="dateTime"
        />
      </v-col>
      <!-- <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="item.deletedAt"
          :label="$t('user.deletedAt')"
          type="dateTime"
        />
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import type { User } from "@/types/user";

const props = defineProps<{
  values: User;
}>();

const item = toRef(props, "values");
</script>
