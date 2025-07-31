<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">📊 Statistiques avancées</h1>

    <div v-if="loading" class="flex justify-center items-center h-40">
      <span class="text-gray-500 text-lg">Chargement des statistiques...</span>
    </div>

    <div v-else>
      <!-- Cards résumé -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div class="text-4xl mb-2 text-blue-600">👥</div>
          <div class="text-lg font-semibold text-gray-700">Utilisateurs</div>
          <div class="text-3xl font-bold text-blue-800">{{ stats?.users?.total ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">Actifs : {{ stats?.users?.active ?? 0 }}</div>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div class="text-4xl mb-2 text-green-600">📦</div>
          <div class="text-lg font-semibold text-gray-700">Produits</div>
          <div class="text-3xl font-bold text-green-800">{{ stats?.products?.total ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">Stock faible : {{ stats?.products?.lowStock ?? 0 }}</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div class="text-4xl mb-2 text-yellow-600">🛒</div>
          <div class="text-lg font-semibold text-gray-700">Commandes</div>
          <div class="text-3xl font-bold text-yellow-800">{{ stats?.orders?.total ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">En attente : {{ stats?.orders?.pending ?? 0 }}</div>
        </div>
        <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div class="text-4xl mb-2 text-purple-600">💰</div>
          <div class="text-lg font-semibold text-gray-700">CA du mois</div>
          <div class="text-3xl font-bold text-purple-800">{{ formatCurrency(stats?.revenue ?? 0) }}</div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Nouveaux utilisateurs -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-blue-700">Nouveaux utilisateurs (7 jours)</h2>
          <Line :data="usersChartData" :options="chartOptions" />
        </div>
        <!-- Commandes par statut -->
        <div class="bg-white rounded-xl shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-yellow-700">Commandes par statut</h2>
          <Pie :data="ordersStatusChartData" :options="chartOptions" />
        </div>
      </div>
      <!-- CA par mois -->
      <div class="bg-white rounded-xl shadow p-6 mt-8">
        <h2 class="text-xl font-semibold mb-4 text-purple-700">Chiffre d'affaires (6 derniers mois)</h2>
        <Bar :data="revenueChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import apiClient from '@/services/api'
import { Line, Pie, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, BarElement)

const loading = ref(true)
const stats = ref<any>(null)
const usersPerDay = ref<any[]>([])
const ordersByStatus = ref<any>({})
const revenuePerMonth = ref<any[]>([])

const fetchStats = async () => {
  loading.value = true
  const [dashboardRes, usersRes, ordersRes, revenueRes] = await Promise.all([
    apiClient.get('/admin/dashboard'),
    apiClient.get('/admin/stats/users-per-day'),
    apiClient.get('/admin/stats/orders-by-status'),
    apiClient.get('/admin/stats/revenue-per-month')
  ])
  stats.value = dashboardRes.data.data
  usersPerDay.value = usersRes.data.data
  ordersByStatus.value = ordersRes.data.data
  revenuePerMonth.value = revenueRes.data.data
  loading.value = false
}

onMounted(fetchStats)

const usersChartData = computed(() => ({
  labels: usersPerDay.value.map(d => d.date),
  datasets: [
    {
      label: 'Nouveaux utilisateurs',
      data: usersPerDay.value.map(d => d.count),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.2)',
      tension: 0.4
    }
  ]
}))

const ordersStatusChartData = computed(() => ({
  labels: Object.keys(ordersByStatus.value),
        datasets: [
          {
            data: Object.values(ordersByStatus.value).map(v => Number(v)),
            backgroundColor: [
              '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f87171', '#f472b6', '#818cf8'
            ]
          }
        ]
}))

const revenueChartData = computed(() => ({
  labels: revenuePerMonth.value.map(d => d.month),
  datasets: [
    {
      label: 'CA (€)',
      data: revenuePerMonth.value.map(d => d.revenue),
      backgroundColor: '#a78bfa'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
</script>