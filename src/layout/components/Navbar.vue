

<template>

  <div>

    <div class="container mx-auto max-w-screen-xl">
      <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <el-menu-item index="1">首頁儀表板</el-menu-item>
        <el-menu-item index="2">股票與虛擬貨幣</el-menu-item>
        <el-menu-item index="3">匯率頁面</el-menu-item>


        <!-- <el-menu-item index="4">關於我們</el-menu-item> -->
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
  display: flex;
  width: 100%;
  background-color: transparent;
  border-bottom: none;
}

.flex-grow {
  flex-grow: 1;
}

.el-menu-demo :deep(.el-menu-item) {
  font-size: 18px;
  padding: 0 20px;
  line-height: 60px;
  font-weight: bold;
  border-bottom: none !important;
}

.el-menu-demo :deep(.el-menu-item:hover) {
  background-color: #ededfc !important;
  color: #333 !important;
}

.el-menu-demo :deep(.el-menu-item.is-active) {
  background-color: #ededfc !important;
  color: #409eff !important;
}
</style>
