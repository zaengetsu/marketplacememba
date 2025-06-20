<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Liste des commandes</h1>
    <table class="min-w-full bg-white mt-6">
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
            <!-- Actions à développer -->
            <button class="btn btn-xs btn-outline">Voir</button>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td class="py-2 px-4 border-b" colspan="6" align="center">Aucune commande</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'

const orders = ref<any[]>([])

const fetchOrders = async () => {
  try {
    const response = await apiClient.get('/admin/orders')
    if (response.data.success) {
      orders.value = response.data.data.orders
    }
  } catch (e) {
    orders.value = []
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('fr-FR')
}

onMounted(fetchOrders)
</script>