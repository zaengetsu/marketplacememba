<template>
  <div class="orders-view">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Mes Commandes</h1>

      <!-- Loading -->
      <div v-if="orderStore.isLoading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">Chargement des commandes...</p>
      </div>

      <!-- Aucune commande -->
      <div v-else-if="orderStore.orders.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📦</div>
        <h2 class="text-2xl font-semibold mb-4">Aucune commande</h2>
        <p class="text-gray-600 mb-8">Vous n'avez pas encore passé de commande</p>
        <router-link to="/" class="btn btn-primary">
          Découvrir nos produits
        </router-link>
      </div>

      <!-- Liste des commandes -->
      <div v-else class="space-y-6">
        <div v-for="order in orderStore.orders" :key="order.id" class="card">
          <div class="card-body">
            <!-- En-tête de commande -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold">Commande #{{ order.id }}</h3>
                <p class="text-gray-600 text-sm">
                  Passée le {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="mt-2 md:mt-0 flex items-center space-x-4">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(order.status) }}
                </span>
                <span class="text-lg font-semibold">{{ parseFloat(order.total.toString()).toFixed(2) }}€</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2">
              <button 
                @click="viewOrderDetails(order.id)"
                class="btn btn-outline btn-sm"
              >
                Voir détails
              </button>
              <button 
                v-if="order.status === 'delivered'"
                @click="reorderItems(order.id)"
                class="btn btn-primary btn-sm"
              >
                Recommander
              </button>
              <button 
                v-if="['pending', 'confirmed'].includes(order.status)"
                @click="cancelOrder(order.id)"
                class="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="flex justify-center mt-8">
          <div class="flex space-x-2">
            <button 
              v-for="page in pagination.pages" 
              :key="page"
              @click="loadPage(page)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium',
                page === pagination.page 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Détails de la commande #{{ selectedOrder.id }}</h2>
            <button @click="selectedOrder = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="font-medium mb-2">Statut</h3>
              <span :class="getStatusClass(selectedOrder.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ getStatusText(selectedOrder.status) }}
              </span>
            </div>

            <div>
              <h3 class="font-medium mb-2">Total</h3>
              <span class="text-xl font-semibold">{{ parseFloat(selectedOrder.total.toString()).toFixed(2) }}€</span>
            </div>

            <div>
              <h3 class="font-medium mb-2">Adresse de livraison</h3>
              <div class="text-gray-600">
                <p>{{ selectedOrder.shippingAddress?.street }}</p>
                <p>{{ selectedOrder.shippingAddress?.postalCode }} {{ selectedOrder.shippingAddress?.city }}</p>
                <p>{{ selectedOrder.shippingAddress?.country }}</p>
              </div>
            </div>

            <div>
              <h3 class="font-medium mb-2">Date de commande</h3>
              <p class="text-gray-600">{{ formatDate(selectedOrder.createdAt) }}</p>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button @click="selectedOrder = null" class="btn btn-outline">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore, type Order } from '@/stores/orders'
// import { useCartStore } from '@/stores/cart'

const orderStore = useOrderStore()
// const cartStore = useCartStore()
const selectedOrder = ref<Order | null>(null)
const pagination = ref<any>(null)

onMounted(async () => {
  await loadOrders()
})

const loadOrders = async (page = 1) => {
  try {
    const result = await orderStore.fetchOrders({ page, limit: 10 })
    pagination.value = result.pagination
  } catch (error: any) {
    console.error('Erreur lors du chargement des commandes:', error)
    alert(`Erreur: ${error.message}`)
  }
}

const loadPage = (page: number) => {
  loadOrders(page)
}

const viewOrderDetails = async (orderId: number) => {
  try {
    const order = await orderStore.fetchOrderById(orderId.toString())
    selectedOrder.value = order
  } catch (error: any) {
    console.error('Erreur lors du chargement des détails:', error)
    alert(`Erreur: ${error.message}`)
  }
}

const reorderItems = async (orderId: number) => {
  // Ici on ajouterait les articles de la commande au panier
  console.log('Recommander les articles de la commande:', orderId)
  alert('Fonctionnalité à implémenter: ajouter les articles au panier')
}

const cancelOrder = async (orderId: number) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    try {
      // Ici on annulerait la commande
      console.log('Annuler la commande:', orderId)
      alert('Commande annulée (fonctionnalité à implémenter)')
      await loadOrders()
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error)
      alert(`Erreur: ${error.message}`)
    }
  }
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return texts[status as keyof typeof texts] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 