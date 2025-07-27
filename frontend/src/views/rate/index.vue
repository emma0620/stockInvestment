<template>
  <el-card class="m-2">
    <!-- 主佈局：分為左右兩欄 -->
    <el-row :gutter="20">
      <!-- 左欄：即時匯率列表 -->
      <el-col :span="6">
        <h3 class="section-title">即時匯率</h3>
        <el-table
          :data="rates"
          stripe
          border
          highlight-current-row
          @row-click="handleCurrencySelect"
          v-loading="loading"
          height="600"
          style="width: 100%"
        >
          <el-table-column prop="currency_zh" label="幣別" />
          <el-table-column prop="currency" label="代碼" width="80" />
          <el-table-column prop="rate" label="參考匯率(對TWD)" />
        </el-table>
      </el-col>

      <!-- 右欄：包含計算機和圖表 -->
      <el-col :span="18">
        <!-- 右上：匯率試算 (結構保持不變) -->
        <div class="calculator-section">
          <!-- ... 您的匯率試算表單 ... -->
          <h3 class="section-title">匯率試算</h3>
          <el-form :model="calculator" label-width="80px" label-position="left">
            <el-row :gutter="10"  >
              <el-col :span="10">
                <el-form-item label="我想要將">
                  <el-input-number v-model="calculator.amount" :min="0" controls-position="right" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-select v-model="calculator.from" filterable placeholder="請選擇" style="width: 100%;">
                  <el-option v-for="item in rates" :key="item.currency" :label="`${item.currency_zh} (${item.currency})`" :value="item.currency" />
                </el-select>
              </el-col>
            </el-row>
              <el-row :gutter="10" align="middle" >
                <el-col :span="10">
                  <el-form-item label="兌換成" class="inline-form-item">
                    <el-input v-model="calculator.result" readonly placeholder="換算結果" />
                  </el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-select v-model="calculator.to" filterable placeholder="請選擇" style="width: 100%;">
                    <el-option v-for="item in rates" :key="item.currency" :label="`${item.currency_zh} (${item.currency})`" :value="item.currency" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-button type="primary" plain @click="performCalculation" style="width: 100%;">換算</el-button>
                </el-col>
              </el-row>
          </el-form>
          <p class="disclaimer">※ 本功能試算結果僅供參考，實際交易匯率以交易當下為準。</p>
        </div>

        <!-- 右下：歷史匯率走勢圖 -->
        <div class="chart-section" v-loading="chartLoading">
          <div class="chart-header">
            <p class="section-title">歷史匯率走勢 ({{ selectedCurrency }}/TWD)</p>
            <!-- **UI 修改點** -->
            <div class="period-selector">
              <el-select v-model="chartPeriod" placeholder="選擇期間" @change="fetchChartData" style="width: 120px;">
                <el-option label="近一個月" value="1M" />
                <el-option label="近三個月" value="3M" />
                <el-option label="近半年" value="6M" />
                <el-option label="指定月份" value="CUSTOM" />
              </el-select>
              <!-- 只有當選擇"指定月份"時才顯示日期選擇器 -->
              <el-date-picker
                v-if="chartPeriod === 'CUSTOM'"
                v-model="selectedDate"
                type="month"
                placeholder="選擇月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                @change="fetchChartData"
                style="margin-left: 10px;"
                :disabled-date="disabledDateHandler"
              />
            </div>
          </div>
          <div ref="chartDom" style="width: 100%; height: 350px;"></div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref, onMounted, reactive, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import * as echarts from 'echarts';



const rates = ref([]);
const loading = ref(true);
const calculator = reactive({ amount: 1, from: 'USD', to: 'TWD', result: null });
const selectedCurrency = ref('USD');


const chartPeriod = ref('1M');

const selectedDate = ref('');

const chartDom = ref(null);
let chartInstance = null;
const chartLoading = ref(false);

const currencyToCountry = {
  USD: ['United States of America', '美金'], HKD: ['Hong Kong', '港幣'], GBP: ['United Kingdom', '英鎊'], AUD: ['Australia', '澳幣'], CAD: ['Canada', '加拿大幣'], SGD: ['Singapore', '新加坡幣'], CHF: ['Switzerland', '瑞士法郎'], JPY: ['Japan', '日圓'], ZAR: ['South Africa', '南非幣'], SEK: ['Sweden', '瑞典幣'], NZD: ['New Zealand', '紐元'], THB: ['Thailand', '泰幣'], PHP: ['Philippines', '菲國比索'], IDR: ['Indonesia', '印尼幣'], EUR: ['Eurozone', '歐元'], KRW: ['South Korea', '韓元'], VND: ['Vietnam', '越南盾'], MYR: ['Malaysia', '馬來幣'], CNY: ['China', '人民幣'], TWD: ['Taiwan', '台幣'],
};

// --- 方法 (Functions) ---

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  lines.shift();
  const result = [];
  for (const line of lines) {
    const data = line.split(',');
    if (data.length < 13) continue;
    const currencyCode = data[0].split(' ')[0].trim();
    const rateStr = data[12];
    if (!currencyToCountry[currencyCode]) continue;
    let rate = 0;
    if (rateStr !== '-') rate = parseFloat(rateStr);
    if (rate !== 0) {
        result.push({
            country: currencyToCountry[currencyCode][0],
            currency_zh: currencyToCountry[currencyCode][1],
            currency: currencyCode,
            rate: rate,
        });
    }
  }
  result.push({ country: 'Taiwan', currency_zh: '台幣', currency: 'TWD', rate: 1 });
  return result.sort((a, b) => a.currency.localeCompare(b.currency));
};

const fetchRates = async () => {
  loading.value = true;
  try {
   const res = await fetch('/api/xrt/flcsv/0/day');
    if (!res.ok) throw new Error('台灣銀行網站無法取得資料');
    rates.value = parseCSV(await res.text());
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    loading.value = false;
  }
};

const performCalculation = () => {
    if(!calculator.amount){
        ElMessage.warning('請輸入金額');
        return;
    }
    const fromRateInfo = rates.value.find(r => r.currency === calculator.from);
    const toRateInfo = rates.value.find(r => r.currency === calculator.to);
    if (!fromRateInfo || !toRateInfo) {
        ElMessage.error('找不到對應的匯率資料');
        return;
    }
    const amountInTwd = calculator.amount * fromRateInfo.rate;
    calculator.result = (amountInTwd / toRateInfo.rate).toFixed(4);
};

// --- **fetchChartData 函式重構** ---
const fetchChartData = async () => {

  if (chartPeriod.value === 'CUSTOM' && !selectedDate.value) {
    initChart([], [], []); // 清空圖表
    return;
  }
  if (selectedCurrency.value === 'TWD') {
    initChart([], [], []);
    return;
  }

  chartLoading.value = true;

  // 1. 根據 chartPeriod 動態決定 API 路徑的期間部分
  let periodPath = '';
  switch (chartPeriod.value) {
    case '1M':
    case '3M':
      periodPath = 'L3M'; // 近一個月和三個月都抓三個月的資料
      break;
    case '6M':
      periodPath = 'L6M';
      break;

    case 'CUSTOM':
      periodPath = selectedDate.value; // 使用 YYYY-MM 格式的日期
      break;
  }

  const url = `/api/xrt/flcsv/0/${periodPath}/${selectedCurrency.value}`;

  try {
    const response = await axios.get(url);
    const csvText = response.data;
    if (!csvText) throw new Error('API未返回任何資料');

    const lines = csvText.trim().split('\n');
    lines.shift();

    let dates = [];
    let buyRates = [];
    let sellRates = [];

    for (const line of lines) {
      const columns = line.split(',');
      if (columns.length < 14) continue;
      const dateStr = columns[0].trim();
      const buyRateStr = columns[3].trim();
      const sellRateStr = columns[13].trim();
      if (dateStr && buyRateStr !== '-' && sellRateStr !== '-') {
        dates.push(dateStr);
        buyRates.push(parseFloat(buyRateStr));
        sellRates.push(parseFloat(sellRateStr));
      }
    }

    dates.reverse();
    buyRates.reverse();
    sellRates.reverse();

    // 2. 如果是"近一個月"，則在前端篩選出最近 30 筆資料
    if (chartPeriod.value === '1M') {
      dates = dates.slice(-30);
      buyRates = buyRates.slice(-30);
      sellRates = sellRates.slice(-30);
    }

    // 3. 將最終處理好的資料傳給繪圖函式
    initChart(dates, buyRates, sellRates);

  } catch (err) {
    ElMessage.error(`無法獲取 ${selectedCurrency.value} 的歷史資料`);
    initChart([], [], []);
  } finally {
    chartLoading.value = false;
  }
};


// 5. 初始化或更新 ECharts 圖表 (此函式不需變更)
const initChart = (dates, buyRates, sellRates) => {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['現金買入', '現金賣出'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', scale: true, axisLabel: { formatter: '{value} TWD' } },
    series: [
      { name: '現金買入', type: 'line', data: buyRates, smooth: true },
      { name: '現金賣出', type: 'line', data: sellRates, smooth: true }
    ],
    grid: { left: '10%', right: '5%', bottom: '10%' }
  };

  nextTick(() => {
      if (!chartInstance) chartInstance = echarts.init(chartDom.value);
      chartInstance.setOption(option, true);
  });
};


// --- 事件處理與生命週期 ---
const handleCurrencySelect = (row) => {
  if (row.currency) selectedCurrency.value = row.currency;
};

const disabledDateHandler = (time) => {
  // `time` 是日期選擇器面板上每一個月份的 Date 物件

  // 條件一：禁用 2024 年 1 月 1 日之前的日期
  const startOf2024 = new Date('2024-01-01');
  if (time.getTime() < startOf2024.getTime()) {
    return true;
  }

  // 條件二：禁用未來的月份 (使用 Date.now() 獲取當前時間的時間戳)
  if (time.getTime() > Date.now()) {
    return true;
  }

  // 如果以上條件都不滿足，則不禁用
  return false;
};

onMounted(async () => {
  // 設定預設的指定月份為當前月份
  const now = new Date();
  selectedDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await fetchRates();
  await fetchChartData();
  window.addEventListener('resize', () => chartInstance?.resize());
});

watch(selectedCurrency, (newVal, oldVal) => {
  if (newVal !== oldVal) fetchChartData();
});
</script>

<style scoped>
/* ...您現有的 style... */
.section-title { color: rgb(75, 75, 75); border-bottom: 2px solid #D1AEAD; padding-bottom: 8px; margin-bottom: 16px; font-size: 1.1rem; font-weight: 600; }
.calculator-section { min-height: 200px; } /* 給計算機一個最小高度 */
.chart-header { display: flex; justify-content: space-between; align-items: center; }
.disclaimer { font-size: 0.75rem; color: #999; margin-top: 10px; }
.inline-form-item { margin-bottom: 0; }
/* 新增的 style */
.period-selector {
  display: flex;
  align-items: center;
}
</style>
