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
        <!-- 右上：匯率試算 -->
        <div class="calculator-section">
          <h3 class="section-title">匯率試算</h3>
          <el-form :model="calculator" label-width="80px" label-position="left">
            <el-row :gutter="10">
              <el-col :span="10">
                <el-form-item label="我想要將">
                  <el-input-number
                    v-model="calculator.amount"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-select
                  v-model="calculator.from"
                  filterable
                  placeholder="請選擇"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in rates"
                    :key="item.currency"
                    :label="`${item.currency_zh} (${item.currency})`"
                    :value="item.currency"
                  />
                </el-select>
              </el-col>
            </el-row>
            <el-row :gutter="10" align="middle">
              <el-col :span="10">
                <el-form-item label="兌換成" class="inline-form-item">
                  <el-input v-model="calculator.result" readonly placeholder="換算結果" />
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-select
                  v-model="calculator.to"
                  filterable
                  placeholder="請選擇"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in rates"
                    :key="item.currency"
                    :label="`${item.currency_zh} (${item.currency})`"
                    :value="item.currency"
                  />
                </el-select>
              </el-col>
              <el-col :span="5">
                <el-button type="primary" plain @click="performCalculation" style="width: 100%"
                  >換算</el-button
                >
              </el-col>
            </el-row>
          </el-form>
          <p class="disclaimer">※ 本功能試算結果僅供參考，實際交易匯率以交易當下為準。</p>
        </div>

        <!-- 右下：歷史匯率走勢圖 -->
        <div class="chart-section" v-loading="chartLoading">
          <div class="chart-header">
            <p class="section-title">歷史匯率走勢 ({{ selectedCurrency }}/TWD)</p>
            <div class="period-selector">
              <el-select
                v-model="chartPeriod"
                placeholder="選擇期間"
                @change="fetchChartData"
                style="width: 120px"
              >
                <el-option label="近一個月" value="1M" />
                <el-option label="近三個月" value="3M" />
                <el-option label="近半年" value="6M" />
                <el-option label="指定月份" value="CUSTOM" />
              </el-select>
              <el-date-picker
                v-if="chartPeriod === 'CUSTOM'"
                v-model="selectedDate"
                type="month"
                placeholder="選擇月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                @change="fetchChartData"
                style="margin-left: 10px"
                :disabled-date="disabledDateHandler"
              />
            </div>
          </div>
          <div ref="chartDom" style="width: 100%; height: 350px"></div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// --- 型別定義 (Type Definitions) ---
interface Rate {
  country: string
  currency_zh: string
  currency: string
  rate: number
}

interface Calculator {
  amount: number
  from: string
  to: string
  result: string | null
}

type ChartPeriod = '1M' | '3M' | '6M' | 'CUSTOM'

// --- 響應式狀態 (Reactive States) ---
const rates = ref<Rate[]>([])
const loading = ref<boolean>(true)
const calculator = reactive<Calculator>({ amount: 1, from: 'USD', to: 'TWD', result: null })
const selectedCurrency = ref<string>('USD')

const chartPeriod = ref<ChartPeriod>('1M')
const selectedDate = ref<string>('')

const chartDom = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null
const chartLoading = ref<boolean>(false)

const currencyToCountry: Record<string, [string, string]> = {
  USD: ['United States of America', '美金'],
  HKD: ['Hong Kong', '港幣'],
  GBP: ['United Kingdom', '英鎊'],
  AUD: ['Australia', '澳幣'],
  CAD: ['Canada', '加拿大幣'],
  SGD: ['Singapore', '新加坡幣'],
  CHF: ['Switzerland', '瑞士法郎'],
  JPY: ['Japan', '日圓'],
  ZAR: ['South Africa', '南非幣'],
  SEK: ['Sweden', '瑞典幣'],
  NZD: ['New Zealand', '紐元'],
  THB: ['Thailand', '泰幣'],
  PHP: ['Philippines', '菲國比索'],
  IDR: ['Indonesia', '印尼幣'],
  EUR: ['Eurozone', '歐元'],
  KRW: ['South Korea', '韓元'],
  VND: ['Vietnam', '越南盾'],
  MYR: ['Malaysia', '馬來幣'],
  CNY: ['China', '人民幣'],
  TWD: ['Taiwan', '台幣'],
}

// --- 方法 (Functions) ---

const parseCSV = (csvText: string): Rate[] => {
  const lines = csvText.trim().split('\n')
  lines.shift()
  const result: Rate[] = []
  for (const line of lines) {
    const data = line.split(',')
    if (data.length < 13) continue
    const currencyCode = data[0].split(' ')[0].trim()
    const rateStr = data[12]
    if (!currencyToCountry[currencyCode]) continue
    let rate = 0
    if (rateStr !== '-') rate = parseFloat(rateStr)
    if (rate !== 0) {
      result.push({
        country: currencyToCountry[currencyCode][0],
        currency_zh: currencyToCountry[currencyCode][1],
        currency: currencyCode,
        rate: rate,
      })
    }
  }
  result.push({ country: 'Taiwan', currency_zh: '台幣', currency: 'TWD', rate: 1 })
  return result.sort((a, b) => a.currency.localeCompare(b.currency))
}

//? 'https://api.allorigins.win/raw?url=https://rate.bot.com.tw' // 生產環境

const corsProxyUrl = 'https://cors.emmawang0620.workers.dev/'
const getApiUrl = (targetPath: string) => {
  if (import.meta.env.PROD) {
    // 將完整的目標 URL 進行編碼，以防特殊字元影響
    const encodedTargetUrl = encodeURIComponent(`https://rate.bot.com.tw${targetPath}`)
    return `${corsProxyUrl}?url=${encodedTargetUrl}`
  } else {
    return `/api${targetPath}`
  }
}

const fetchRates = async () => {
  loading.value = true
  try {
    // 使用新的 getApiUrl 函式來產生 URL
    const url = getApiUrl('/xrt/flcsv/0/day')
    const res = await fetch(url)
    if (!res.ok) throw new Error('台灣銀行網站無法取得資料')
    rates.value = parseCSV(await res.text())
  } catch (err) {
    if (err instanceof Error) {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('發生未知錯誤')
    }
  } finally {
    loading.value = false
  }
}

const performCalculation = (): void => {
  if (!calculator.amount) {
    ElMessage.warning('請輸入金額')
    return
  }
  const fromRateInfo = rates.value.find((r) => r.currency === calculator.from)
  const toRateInfo = rates.value.find((r) => r.currency === calculator.to)
  if (!fromRateInfo || !toRateInfo) {
    ElMessage.error('找不到對應的匯率資料')
    return
  }
  const amountInTwd = calculator.amount * fromRateInfo.rate
  calculator.result = (amountInTwd / toRateInfo.rate).toFixed(4)
}

const fetchChartData = async (): Promise<void> => {
  if (chartPeriod.value === 'CUSTOM' && !selectedDate.value) {
    initChart([], [], [])
    return
  }
  if (selectedCurrency.value === 'TWD') {
    initChart([], [], [])
    return
  }

  chartLoading.value = true

  let periodPath = ''
  switch (chartPeriod.value) {
    case '1M':
    case '3M':
      periodPath = 'L3M'
      break
    case '6M':
      periodPath = 'L6M'
      break
    case 'CUSTOM':
      periodPath = selectedDate.value
      break
  }

  const targetPath = `/xrt/flcsv/0/${periodPath}/${selectedCurrency.value}`
  const url = getApiUrl(targetPath)
  try {
    const response = await axios.get<string>(url)
    const csvText = response.data
    if (!csvText) throw new Error('API未返回任何資料')

    const lines = csvText.trim().split('\n')
    lines.shift()

    let dates: string[] = []
    let buyRates: number[] = []
    let sellRates: number[] = []

    for (const line of lines) {
      const columns = line.split(',')
      if (columns.length < 14) continue
      const dateStr = columns[0].trim()
      const buyRateStr = columns[3].trim()
      const sellRateStr = columns[13].trim()
      if (dateStr && buyRateStr !== '-' && sellRateStr !== '-') {
        dates.push(dateStr)
        buyRates.push(parseFloat(buyRateStr))
        sellRates.push(parseFloat(sellRateStr))
      }
    }

    dates.reverse()
    buyRates.reverse()
    sellRates.reverse()

    if (chartPeriod.value === '1M') {
      const thirtyDays = 30
      dates = dates.slice(-thirtyDays)
      buyRates = buyRates.slice(-thirtyDays)
      sellRates = sellRates.slice(-thirtyDays)
    }

    initChart(dates, buyRates, sellRates)
  } catch (err) {
    if (err instanceof Error) {
      ElMessage.error(`無法獲取 ${selectedCurrency.value} 的歷史資料: ${err.message}`)
    } else {
      ElMessage.error(`無法獲取 ${selectedCurrency.value} 的歷史資料`)
    }
    initChart([], [], [])
  } finally {
    chartLoading.value = false
  }
}

const initChart = (dates: string[], buyRates: number[], sellRates: number[]): void => {
  if (!chartDom.value) return

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['現金買入', '現金賣出'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', scale: true, axisLabel: { formatter: '{value} TWD' } },
    series: [
      { name: '現金買入', type: 'line', data: buyRates, smooth: true },
      { name: '現金賣出', type: 'line', data: sellRates, smooth: true },
    ],
    grid: { left: '10%', right: '5%', bottom: '10%' },
  }

  nextTick(() => {
    if (!chartInstance) {
      chartInstance = echarts.init(chartDom.value as HTMLElement)
    }
    chartInstance.setOption(option, true)
  })
}

const handleCurrencySelect = (row: Rate): void => {
  if (row.currency) {
    selectedCurrency.value = row.currency
  }
}

const disabledDateHandler = (time: Date): boolean => {
  const startOf2024 = new Date('2024-01-01')
  return time.getTime() < startOf2024.getTime() || time.getTime() > Date.now()
}

onMounted(async () => {
  const now = new Date()
  selectedDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  await fetchRates()
  await fetchChartData()

  const resizeHandler = () => chartInstance?.resize()
  window.addEventListener('resize', resizeHandler)
})

watch(selectedCurrency, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchChartData()
  }
})
</script>

<style scoped>
.section-title {
  color: rgb(75, 75, 75);
  border-bottom: 2px solid #d1aead;
  padding-bottom: 8px;
  margin-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 600;
}
.calculator-section {
  min-height: 200px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.disclaimer {
  font-size: 0.75rem;
  color: #999;
  margin-top: 10px;
}
.inline-form-item {
  margin-bottom: 0;
}
.period-selector {
  display: flex;
  align-items: center;
}
</style>
