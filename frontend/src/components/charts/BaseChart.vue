<template>
  <div ref="chartDom" style="width: 100%; height: 100%;"></div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  option: {
    type: Object,
    required: true,
  }
});

const chartDom = ref(null);
let myChart = null;

onMounted(() => {
    // 使用 nextTick 確保 DOM 已渲染
    nextTick(() => {
        myChart = echarts.init(chartDom.value);
        myChart.setOption(props.option);
    });
});

// 監聽 option 的變化，當外部傳入的資料更新時，自動重繪圖表
watch(() => props.option, (newOption) => {
  if (myChart) {
    myChart.setOption(newOption);
  }
}, { deep: true }); // 使用 deep watch 監聽物件內部變化
</script>
