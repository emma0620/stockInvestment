<template>
  <div class="layout">
    <Navbar @menu-click="handleMenuClick" />

      <div class="app-main-container">
        <AppMain />
      </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue"; 
import AppMain from "./components/AppMain.vue";

const router = useRouter();
const route = useRoute();
 

const currentMenu = ref("1"); // 預設選中第一個菜單項目

const handleMenuClick = (index) => {
  currentMenu.value = index;
  switch (index) {
    case "1":
      router.push("/dashboard");
      break;
    case "2":
      router.push("/stock");
      break;
    case "3":
      router.push("/rate");
      break;
      case "4":
       router.push("/about");
        break;
    // case "5":
    //   router.push("/settings");
    //   break;
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column; /* 將 Navbar 和 main-container 垂直排列 */
  min-height: 100vh;
}

.main-container {
  display: flex; /* 將 Sidebar 和 app-main-container 水平排列 */
  flex-grow: 1; /* 讓 main-container 佔據剩餘的垂直空間 */
  background-color: #ededfc;
}


.app-main-container {
  flex-grow: 1; /* 讓 AppMain 佔據剩餘的水平空間 */
  /* 你可以根據需要添加 AppMain 內容的 padding */
  padding: 20px; /* 這是一個範例 padding，請根據你的設計調整 */
}
</style>
