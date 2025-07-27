 <!-- navbar.vue -->

<template>
  <!-- navbarClass 現在可以移除，因為寬度由父元素的 .nav 控制 -->
  <div>
    <!-- 在 el-menu 外面包一個限制寬度的容器，讓菜單項居中顯示 -->
    <div class="container mx-auto max-w-screen-xl">
      <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">首頁儀表板</el-menu-item>
        <el-menu-item index="2">股票與虛擬貨幣</el-menu-item>
        <el-menu-item index="3">匯率頁面</el-menu-item>
        <!-- 使用 flex-grow 將右側項目推到最右邊 -->

        <el-menu-item index="4">關於我們</el-menu-item>
        <el-menu-item index="5" disabled>歡迎光臨, Admin</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

const emit = defineEmits(["menu-click"]);

const handleSelect = (index: string) => {
  emit("menu-click", index);
};
</script>

<style scoped>
.el-menu-demo {
  display: flex; /* 啟用 flexbox */
  width: 100%;
  background-color: transparent;
  border-bottom: none; /* Navbar 的底部邊框由父元素的 box-shadow 取代 */
}

.flex-grow {
  flex-grow: 1; /* 這個空的 div 會佔據所有可用空間 */
}

.el-menu-demo :deep(.el-menu-item) {
  font-size: 18px; /* 稍微調整字體大小以適應更多項目 */
  padding: 0 20px;
  line-height: 60px; /* 建議設定一個固定的行高，這也是 main-content 的 padding-top 的依據 */
  font-weight: bold;
  border-bottom: none !important;
}

.el-menu-demo :deep(.el-menu-item:hover) {
  background-color: #ededfc !important;
  color: #333 !important;
}

.el-menu-demo :deep(.el-menu-item.is-active) {
  background-color: #ededfc !important;
  color: #409eff !important; /* 讓當前選中項的顏色更突出 */
}
</style>
