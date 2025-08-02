<!-- appmain.vue -->


<template>
  <!-- <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </section> -->

  <section class="app-main">
    <router-view />
  </section>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style scoped>
.app-main {
  background-color: white;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
