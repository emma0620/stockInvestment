  <!--layout index.vue -->

<template>
  <div class="app-main-containe">

    <Navbar class="nav" @menu-click="handleMenuClick" />
        <AppMain />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'

const router = useRouter()

const handleMenuClick = (index: string) => {
  switch (index) {
    case '1':
      router.push('/dashboard')
      break
    case '2':
      router.push('/stock')
      break
    case '3':
      router.push('/rate')
      break
    case '4':
      router.push('/about')
      break
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}


.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}


.main-content {
  flex-grow: 1;
  padding-top: 60px;
  background-color: #ededfc;
}

.app-main-container {
  flex-grow: 1;

  padding: 20px;
  width: 100%;
}
</style>
