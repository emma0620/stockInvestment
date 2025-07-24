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
 
  justify-content: space-between;  
  background-color: transparent;  
  border-bottom: none;  
}

 
.el-menu-demo :deep(.el-menu-item) {
  font-size: 20px; 
  padding: 0 15px;  
  line-height: 58px;  
  font-weight: bold;
}


.el-menu-demo :deep(.el-menu-item:hover) {
  background-color: #ededfc !important;
}

 
.el-menu-demo :deep(.el-menu-item.is-active) {
  background-color: #ededfc !important;  
  border-bottom: none !important;  
  color: #333 !important;  
}
</style>
