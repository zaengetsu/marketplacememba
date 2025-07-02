<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Liste des commandes</h1>

    <!-- Recherche et filtre -->
    <div class="flex flex-wrap gap-4 mb-6">
      <input
        v-model="search"
        @input="onSearch"
        class="input input-bordered"
        placeholder="Recherche utilisateur..."
        style="min-width:200px"
      />
      <select v-model="status" @change="onSearch" class="input input-bordered">
        <option value="">Tous statuts</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <table class="min-w-full bg-white mt-2">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">ID</th>
          <th class="py-2 px-4 border-b">Utilisateur</th>
          <th class="py-2 px-4 border-b">Statut</th>
          <th class="py-2 px-4 border-b">Total</th>
          <th class="py-2 px-4 border-b">Date</th>
          <th class="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td class="py-2 px-4 border-b">{{ order.id }}</td>
          <td class="py-2 px-4 border-b">
            {{ order.user?.firstName }} {{ order.user?.lastName }}
            <span v-if="!order.user">-</span>
          </td>
          <td class="py-2 px-4 border-b">{{ order.status }}</td>
          <td class="py-2 px-4 border-b">{{ order.total }} €</td>
          <td class="py-2 px-4 border-b">{{ formatDate(order.createdAt) }}</td>
          <td class="py-2 px-4 border-b">
            <select 
              :value="order.status" 
              @change="updateOrderStatus(order, $event.target.value)"
              class="form-select text-sm mr-2"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
            <button class="btn btn-xs btn-outline">Voir</button>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td class="py-2 px-4 border-b" colspan="6" align="center">Aucune commande</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="flex justify-center items-center gap-2 mt-6" v-if="pagination.pages > 1">
      <button class="btn btn-sm" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">Précédent</button>
      <span>Page {{ pagination.page }} / {{ pagination.pages }}</span>
      <button class="btn btn-sm" :disabled="pagination.page === pagination.pages" @click="changePage(pagination.page + 1)">Suivant</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '@/services/api'

const toast = useToast()

const orders = ref<any[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 1 })
const search = ref('')
const status = ref('')
const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const fetchOrders = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (search.value) params.search = search.value
    if (status.value) params.status = status.value

    const response = await apiClient.get('/admin/orders', { params })
    if (response.data.success) {
      orders.value = response.data.data.orders
      pagination.value = response.data.data.pagination
    }
  } catch (e) {
    orders.value = []
    pagination.value = { page: 1, limit: 10, total: 0, pages: 1 }
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  fetchOrders()
}

const onSearch = () => {
  pagination.value.page = 1
  fetchOrders()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR')
}

const updateOrderStatus = async (order: any, newStatus: string) => {
  try {
    const response = await apiClient.put(`/orders/${order.id}/status`, {
      status: newStatus
    })
    
    if (response.data.success) {
      // Mise à jour locale
      order.status = newStatus
      toast.success('Statut de la commande mis à jour avec succès')
    } else {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    toast.error('Erreur lors de la mise à jour du statut de la commande')
    
    // Recharger les données pour revenir à l'état original
    await fetchOrders()
  }
}

onMounted(fetchOrders)
</script>