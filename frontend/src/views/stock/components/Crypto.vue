<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">比特幣近 7 日價格走勢</h1>

    <div v-if="isLoading" class="text-center p-8">
      正在載入圖表資料...
    </div>

    <div v-if="error" class="text-center p-8 text-red-500">
      {{ error }}
    </div>


    <div v-if="!isLoading && !error" ref="chartDom" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { getMarketChart } from '@/api/coingecko.js';
import * as echarts from 'echarts';

const chartDom = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await getMarketChart('bitcoin');
    const dates = response.data.prices.map(item => {
      const date = new Date(item[0]);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const prices = response.data.prices.map(item => item[1]);


    isLoading.value = false;


    await nextTick();


    if (!chartDom.value) return;

    const myChart = echarts.init(chartDom.value);
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value', axisLabel: { formatter: '${value}' } },
      series: [{ name: '價格', type: 'line', data: prices, smooth: true }],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    };
    myChart.setOption(option);

    window.addEventListener('resize', () => {
      myChart.resize();
    });

  } catch (err) {
    console.error("無法取得圖表資料:", err);
    error.value = '無法取得圖表資料，請稍後再試。';

    isLoading.value = false;
  }
});
</script>

