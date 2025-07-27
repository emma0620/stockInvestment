  <!--layout index.vue -->

<template>
  <div class="app-main-containe">
    <!-- Navbar 現在處於全寬的容器中 -->
    <Navbar class="nav" @menu-click="handleMenuClick" />
        <AppMain />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import Navbar from "./components/Navbar.vue";
import AppMain from "./components/AppMain.vue";

const router = useRouter();

const handleMenuClick = (index) => {
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
  flex-direction: column;
  min-height: 100vh; /* 確保佈局至少和視窗一樣高 */
}

/* 將 Navbar 固定在頂部 */
.nav {
  position: fixed; /* 改為 fixed，相對於視窗定位 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 確保在最上層 */
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%; /* 明確設定寬度為100% */
}

/* 主要內容區域 */
.main-content {
  flex-grow: 1; /* 讓內容區塊可以伸展，填滿剩餘高度 */
  padding-top: 60px; /* **非常重要**：這個值要約等於 Navbar 的高度，防止內容被遮擋 */
  background-color: #ededfc; /* 您可以換成任何您喜歡的背景色 */
}

.app-main-container {
  flex-grow: 1; /* 讓 AppMain 佔據剩餘的水平空間 */
  /* 你可以根據需要添加 AppMain 內容的 padding */
  padding: 20px; /* 這是一個範例 padding，請根據你的設計調整 */
  width: 100%;
}
</style>
