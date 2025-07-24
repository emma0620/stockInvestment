<template>
  <el-card class="m-4">
    <div class="flex justify-between items-center mb-4">
      <div><span class="text-lg font-bold">台灣銀行匯率查詢</span></div>
      <div>
        <el-button type="primary" @click="fetchRates" :loading="loading" plain> 重新整理</el-button>
      </div>
    </div>

    <el-table v-if="rates.length" :data="rates" border stripe>
      <el-table-column prop="country" label="國家" width="160" />
      <el-table-column prop="currency_zh" label="幣別(中文)" width="120" />
      <el-table-column prop="currency" label="幣別代碼" width="100" />
      <el-table-column prop="rate" label="匯率" />
    </el-table>

    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 對應幣別代碼 → 國家與中文幣別名稱
const currencyToCountry = {
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

const rates = ref([])
const loading = ref(false)
const error = ref('')

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n')
  lines.shift() // 移除標題列

  const result = []

  for (const line of lines) {
    const data = line.split(',')
    if (data.length < 13) continue

    const currencyCode = data[0].split(' ')[0].trim()
    const rateStr = data[12]

    if (!currencyToCountry[currencyCode]) continue

    let rate = 0
    if (rateStr !== '-') {
      rate = parseFloat(rateStr)
    }

    result.push({
      country: currencyToCountry[currencyCode][0],
      currency_zh: currencyToCountry[currencyCode][1],
      currency: currencyCode,
      rate: rate,
    })
  }

  // 補上台幣（固定為 1）
  result.push({
    country: 'Taiwan',
    currency_zh: '台幣',
    currency: 'TWD',
    rate: 1,
  })

  return result
}

const fetchRates = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api')
    if (!res.ok) throw new Error('台灣銀行網站無法取得資料')
    const text = await res.text()
    rates.value = parseCSV(text)
  } catch (err) {
    error.value = err.message
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchRates)
</script>

<style scoped>
.text-red-500 {
  color: red;
}
</style>
