<template>
  <div class="navbarClass">

    <el-menu class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">首頁儀表板</el-menu-item>
      <el-menu-item index="2">股票與虛擬貨幣</el-menu-item>
      <el-menu-item index="3">匯率頁面</el-menu-item>  
      <el-menu-item index="5" disable>歡迎光臨, Admin</el-menu-item> 
      <el-menu-item index="4" >歡迎光臨, Admin</el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits(["menu-click"]);

const handleSelect = (index) => {
  emit("menu-click", index);
};
</script>

<style scoped>


.navbarClass {
  display: flex;
  align-items: center;  
  
  width: 100%;  
  border-bottom: 1px solid #eee;  
  padding: 0 10px;  
  box-sizing: border-box;  
}

.el-menu-demo {
  width: 70%;
  flex-grow: 1; /* 讓菜單填滿剩餘空間 */
  justify-content: space-between; /* 讓菜單項目之間平均分配空間 */
  background-color: transparent; /* 改為透明或移除，除非你真的要藍色背景 */
  border-bottom: none; /* Element Plus 菜單可能有預設底線，移除它避免雙重底線 */
}

/* 新增這個規則來針對 Menu Item */
.el-menu-demo :deep(.el-menu-item) {
  font-size: 20px; /* <--- 將字體大小設定應用到 Menu Item 上 */
  /* 你可能也需要調整 padding 或 line-height 來讓視覺效果更好 */
  /* 例如： */
  padding: 0 15px; /* 稍微增加左右間距 */
  line-height: 58px; /* Element Plus 預設高度通常是 60px 或 58px，調整行高使文字垂直居中 */
  font-weight: bold;
}


.el-menu-demo :deep(.el-menu-item:hover) {
  background-color: #ededfc !important;
}

/* 修改 active（選中）時的背景色、移除底線 */
.el-menu-demo :deep(.el-menu-item.is-active) {
  background-color: #ededfc !important; /* 點擊後選中的背景 */
  border-bottom: none !important; /* 移除底線 */
  color: #333 !important; /* 也可以調整文字顏色 */
}
</style>
