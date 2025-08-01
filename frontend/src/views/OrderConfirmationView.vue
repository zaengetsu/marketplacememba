<template>
  <div class="order-confirmation-view">
    <div class="container mx-auto px-4 py-8">
      <!-- Success Message -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">✅</div>
        <h1 class="text-3xl font-bold mb-4 text-green-600">Commande confirmée !</h1>
        <p class="text-gray-600 text-lg">Merci pour votre achat. Votre commande a été traitée avec succès.</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">Chargement des détails de la commande...</p>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="max-w-2xl mx-auto">
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="text-xl font-semibold">Détails de votre commande</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="font-medium mb-2">Numéro de commande</h3>
                <p class="text-gray-600">#{{ order.id }}</p>
              </div>
              <div>
                <h3 class="font-medium mb-2">Statut</h3>
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div>
                <h3 class="font-medium mb-2">Total payé</h3>
                <p class="text-xl font-semibold">
                  {{ (Number(order.total) + Number(order.shippingCost || 0)).toFixed(2) }}€
                </p>
                <div class="text-sm mt-2">
                  <div>Sous-total HT : <span class="font-semibold">{{ totalHT(order).toFixed(2) }}€</span></div>
                  <div>TVA (20%) : <span class="font-semibold">{{ tva(order).toFixed(2) }}€</span></div>
                  <div v-if="order.shippingCost && order.shippingCost > 0">Livraison : <span class="font-semibold">{{ Number(order.shippingCost).toFixed(2) }}€</span></div>
                  <div>Total TTC : <span class="font-semibold">{{ (Number(order.total) + Number(order.shippingCost || 0)).toFixed(2) }}€</span></div>
                </div>
              </div>
              <div>
                <h3 class="font-medium mb-2">Date de commande</h3>
                <p class="text-gray-600">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>

            <div v-if="order.shippingAddress" class="mt-6">
              <h3 class="font-medium mb-2">Adresse de livraison</h3>
              <div class="text-gray-600">
                <p>{{ order.shippingAddress.street }}</p>
                <p>{{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}</p>
                <p>{{ order.shippingAddress.country }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="text-xl font-semibold">Prochaines étapes</h2>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  1
                </div>
                <div>
                  <h3 class="font-medium">Confirmation par email</h3>
                  <p class="text-gray-600 text-sm">Vous allez recevoir un email de confirmation avec tous les détails de votre commande.</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  2
                </div>
                <div>
                  <h3 class="font-medium">Traitement de la commande</h3>
                  <p class="text-gray-600 text-sm">Votre commande sera traitée dans les 24h ouvrées.</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  3
                </div>
                <div>
                  <h3 class="font-medium">Expédition</h3>
                  <p class="text-gray-600 text-sm">Vous recevrez un email avec le numéro de suivi dès l'expédition.</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  4
                </div>
                <div>
                  <h3 class="font-medium">Facture</h3>
                  <p class="text-gray-600 text-sm">Une facture sera générée et disponible dans votre espace client.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/orders" class="btn btn-primary">
            Voir mes commandes
          </router-link>
          <router-link to="/invoices" class="btn btn-outline">
            Voir mes factures
          </router-link>
          <router-link to="/" class="btn btn-outline">
            Continuer mes achats
          </router-link>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-8">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-semibold mb-4">Commande non trouvée</h2>
        <p class="text-gray-600 mb-8">Impossible de récupérer les détails de cette commande.</p>
        <router-link to="/orders" class="btn btn-primary">
          Voir mes commandes
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore, type Order } from '@/stores/orders'

const route = useRoute()
const orderStore = useOrderStore()
const order = ref<Order | null>(null)
const loading = ref(true)

onMounted(async () => {
  const orderId = route.params.id as string
  
  if (orderId) {
    try {
      order.value = await orderStore.fetchOrderById(orderId)
    } catch (error: any) {
      console.error('Erreur lors du chargement de la commande:', error)
    }
  }
  
  loading.value = false
})

// Calcul HT/TVA/TTC à partir du total TTC (20% TVA)
const totalHT = (order: any) => {
  if (!order || !order.total) return 0
  return parseFloat(order.total) / 1.2
}
const tva = (order: any) => {
  if (!order || !order.total) return 0
  return parseFloat(order.total) - totalHT(order)
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
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