<template>
  <div class="admin-dashboard">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p class="text-gray-600">Bienvenue {{ authStore.user?.firstName }} ({{ authStore.user?.role }})</p>
        </div>
        <div class="flex space-x-4">
          <button @click="refreshData" class="btn btn-outline">
            🔄 Actualiser
          </button>
          <router-link to="/admin/users" class="btn btn-primary">
            👥 Gérer les utilisateurs
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                👥
              </div>
              <div>
                <p class="text-sm text-gray-600">Utilisateurs</p>
                <p class="text-2xl font-bold">{{ stats.users }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                📦
              </div>
              <div>
                <p class="text-sm text-gray-600">Produits</p>
                <p class="text-2xl font-bold">{{ stats.products }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                🛒
              </div>
              <div>
                <p class="text-sm text-gray-600">Commandes</p>
                <p class="text-2xl font-bold">{{ stats.orders }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                💰
              </div>
              <div>
                <p class="text-sm text-gray-600">CA du mois</p>
                <p class="text-2xl font-bold">{{ formatCurrency(stats.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Actions rapides -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold">Actions rapides</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 gap-4">
              <router-link 
                v-if="canAccess('products:write')"
                to="/admin/products/new" 
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div class="text-2xl mb-2">➕</div>
                <div class="text-sm font-medium">Nouveau produit</div>
              </router-link>

              <router-link 
                v-if="canAccess('users:write')"
                to="/admin/users/new" 
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div class="text-2xl mb-2">👤</div>
                <div class="text-sm font-medium">Nouvel utilisateur</div>
              </router-link>

              <router-link 
                v-if="canAccess('orders:read')"
                to="/admin/orders" 
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div class="text-2xl mb-2">📋</div>
                <div class="text-sm font-medium">Voir commandes</div>
              </router-link>

              <router-link 
                v-if="canAccess('analytics:read')"
                to="/admin/analytics" 
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
              >
                <div class="text-2xl mb-2">📊</div>
                <div class="text-sm font-medium">Analytics</div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Activité récente -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-semibold">Activité récente</h2>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div class="flex-1">
                  <p class="text-sm">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(activity.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions par rôle -->
      <div v-if="authStore.user?.role === 'ROLE_ADMIN'" class="card">
        <div class="card-header">
          <h2 class="text-xl font-semibold">Gestion des permissions</h2>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 class="font-semibold text-green-600 mb-2">ROLE_ADMIN</h3>
              <ul class="text-sm space-y-1">
                <li>✅ Gestion complète des utilisateurs</li>
                <li>✅ Gestion complète des produits</li>
                <li>✅ Gestion des commandes</li>
                <li>✅ Gestion des factures</li>
                <li>✅ Analytics complètes</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-blue-600 mb-2">ROLE_STORE_KEEPER</h3>
              <ul class="text-sm space-y-1">
                <li>❌ Gestion des utilisateurs</li>
                <li>✅ Gestion des produits</li>
                <li>✅ Gestion des stocks</li>
                <li>✅ Lecture des commandes</li>
                <li>❌ Gestion des factures</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-purple-600 mb-2">ROLE_COMPTA</h3>
              <ul class="text-sm space-y-1">
                <li>❌ Gestion des utilisateurs</li>
                <li>❌ Gestion des produits</li>
                <li>✅ Lecture des commandes</li>
                <li>✅ Gestion des factures</li>
                <li>✅ Analytics financières</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const stats = ref({
  users: 0,
  products: 0,
  orders: 0,
  revenue: 0
})

const recentActivity = ref([
  {
    id: 1,
    description: 'Nouveau produit ajouté: iPhone 15 Pro',
    createdAt: new Date()
  },
  {
    id: 2,
    description: 'Commande #1234 traitée',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    description: 'Nouvel utilisateur inscrit',
    createdAt: new Date(Date.now() - 7200000)
  }
])

const canAccess = (permission: string) => {
  const userRole = authStore.user?.role
  
  const permissions: Record<string, string[]> = {
    'products:read': ['ROLE_ADMIN', 'ROLE_STORE_KEEPER', 'ROLE_USER'],
    'products:write': ['ROLE_ADMIN', 'ROLE_STORE_KEEPER'],
    'users:write': ['ROLE_ADMIN'],
    'orders:read': ['ROLE_ADMIN', 'ROLE_COMPTA', 'ROLE_STORE_KEEPER'],
    'analytics:read': ['ROLE_ADMIN', 'ROLE_COMPTA']
  }
  
  return permissions[permission]?.includes(userRole || '') || false
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const refreshData = async () => {
  // Simuler le chargement des stats
  stats.value = {
    users: 156,
    products: 89,
    orders: 234,
    revenue: 45678.90
  }
}

onMounted(() => {
  refreshData()
})
</script> 