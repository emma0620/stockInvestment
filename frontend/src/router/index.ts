import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'; 
import dashboard from '@/views/dashboard/index.vue'
import stock from '@/views/stock/index.vue'
import rate from '@/views/rate/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: dashboard,
        },
        {
          path: '/stock',
          name: 'stock',
          component: stock,
        },
        {
          path: '/rate',
          name: 'rate',
          component: rate,
        },
      ],
    },
  ],
})

export default router
