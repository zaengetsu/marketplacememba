<template>
  <div class="cart-view">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Mon Panier</h1>

      <!-- Panier vide -->
      <div v-if="!cartStore.hasItems" class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold mb-4">Votre panier est vide</h2>
        <p class="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/" class="btn btn-primary">
          Continuer mes achats
        </router-link>
      </div>

      <!-- Panier avec articles -->
      <div v-else>
        <!-- Étapes du checkout -->
        <div class="mb-8">
          <div class="flex items-center space-x-4">
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              checkoutStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            ]">1</div>
            <span :class="checkoutStep >= 1 ? 'text-orange-600 font-medium' : 'text-gray-600'">Panier</span>

            <div class="flex-1 h-0.5 bg-gray-200"></div>

            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              checkoutStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            ]">2</div>
            <span :class="checkoutStep >= 2 ? 'text-orange-600 font-medium' : 'text-gray-600'">Livraison</span>

            <div class="flex-1 h-0.5 bg-gray-200"></div>

            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              checkoutStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
            ]">3</div>
            <span :class="checkoutStep >= 3 ? 'text-orange-600 font-medium' : 'text-gray-600'">Paiement</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contenu principal -->
          <div class="lg:col-span-2">

            <!-- Étape 1: Articles du panier -->
            <div v-if="checkoutStep === 1" class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Articles ({{ cartStore.totalItems }})</h2>
              </div>
              <div class="card-body p-0">
                <div v-for="item in cartStore.items" :key="item.product.id"
                  class="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                  <!-- Image du produit -->
                  <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-4">
                    <img :src="getProductImage(item.product)" :alt="item.product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  <!-- Détails du produit -->
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg">{{ item.product.name }}</h3>
                    <p class="text-gray-600 text-sm">{{ item.product.category?.name || 'Catégorie non définie' }}</p>

                    <!-- Réservation -->
                    <div v-if="item.reservedUntil" class="text-xs text-orange-600 mt-1">
                      Réservé jusqu'à {{ formatTime(item.reservedUntil) }}
                    </div>
                  </div>

                  <!-- Quantité -->
                  <div class="flex items-center mx-4">
                    <button @click="updateQuantity(item.product.id.toString(), item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50">
                      -
                    </button>
                    <span class="mx-3 font-semibold">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item.product.id.toString(), item.quantity + 1)"
                      class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                      +
                    </button>
                  </div>

                  <!-- Prix -->
                  <div class="text-right mr-4">
                    <div class="font-semibold">
                      {{ (getCurrentPrice(item.product) * item.quantity).toFixed(2) }}€
                    </div>
                    <div v-if="item.product.isOnSale" class="text-sm text-gray-500 line-through">
                      {{ (item.product.price * item.quantity).toFixed(2) }}€
                    </div>
                  </div>

                  <!-- Supprimer -->
                  <button
                    v-if="item.product && item.product.id !== undefined && item.product.id !== null"
                    @click="cartStore.removeItem(item.product.id.toString())"
                    class="text-red-500 hover:text-red-700 p-2">
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- Étape 2: Informations de livraison -->
            <div v-if="checkoutStep === 2" class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Informations de livraison</h2>
              </div>
              <div class="card-body">
                <ShippingForm @submit="handleShippingSubmit" />
              </div>
            </div>

            <!-- Étape 3: Confirmation -->
            <div v-if="checkoutStep === 3" class="space-y-6">
              <div class="card">
                <div class="card-header">
                  <h2 class="text-xl font-semibold">Récapitulatif de commande</h2>
                </div>
                <div class="card-body">
                  <div class="mb-4">
                    <h3 class="font-medium mb-2">Livraison à :</h3>
                    <div class="text-gray-600">
                      <p>{{ shippingData.firstName }} {{ shippingData.lastName }}</p>
                      <p>{{ shippingData.street }}</p>
                      <p>{{ shippingData.postalCode }} {{ shippingData.city }}</p>
                      <p>{{ shippingData.country }}</p>
                    </div>
                    <button @click="checkoutStep = 2" class="text-orange-600 text-sm mt-2">Modifier</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Résumé de commande -->
          <div class="lg:col-span-1">
            <div class="card sticky top-4">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Résumé</h2>
              </div>
              <div class="card-body">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>Sous-total HT</span>
                    <span>{{ totalHT.toFixed(2) }}€</span>
                  </div>
                  <div class="flex justify-between">
                    <span>TVA (20%)</span>
                    <span>{{ tva.toFixed(2) }}€</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Sous-total TTC</span>
                    <span>{{ totalTTC.toFixed(2) }}€</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Livraison</span>
                    <span>{{ shippingCost.toFixed(2) }}€</span>
                  </div>
                  <hr>
                  <div class="flex justify-between font-semibold text-lg">
                    <span>Total à payer</span>
                    <span>{{ (totalTTC + shippingCost).toFixed(2) }}€</span>
                  </div>
                </div>

                <!-- Boutons d'action selon l'étape -->
                <div class="mt-6 space-y-3">
                  <button v-if="checkoutStep === 1" @click="checkoutStep = 2" class="w-full btn btn-primary">
                    Continuer vers la livraison
                  </button>

                  <button v-if="checkoutStep === 2" @click="checkoutStep = 1" class="w-full btn btn-outline">
                    Retour au panier
                  </button>

                  <button v-if="checkoutStep === 3" @click="proceedToCheckout" :disabled="checkoutLoading"
                    class="w-full btn btn-primary">
                    <div v-if="checkoutLoading"
                      class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {{ checkoutLoading ? 'Redirection...' : 'Procéder au paiement' }}
                  </button>

                  <button v-if="checkoutStep === 3" @click="checkoutStep = 2" class="w-full btn btn-outline">
                    Modifier la livraison
                  </button>
                </div>

                <button @click="cartStore.clearCart" class="w-full btn btn-outline mt-3">
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import ShippingForm from '@/components/ShippingForm.vue'
import type { Product } from '@/types/product'
import { getProductImageUrl } from '@/utils/image'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const getProductImage = (product: Product) => {
  // Utilise la fonction utilitaire commune
  return getProductImageUrl(product)
}

const checkoutStep = ref(1) // 1: Panier, 2: Livraison, 3: Confirmation
const checkoutLoading = ref(false)
const shippingData = ref({
  firstName: '',
  lastName: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  instructions: ''
})


const shippingCost = computed(() => {
  return cartStore.totalPrice >= 50 ? 0 : 5.99
})
 
// Calcul HT, TVA, TTC
const totalTTC = computed(() => cartStore.totalPrice)
const totalHT = computed(() => totalTTC.value / 1.2)
const tva = computed(() => totalTTC.value - totalHT.value)

const getCurrentPrice = (product: Product) => {
  if (!product) return 0
  return product.isOnSale && product.salePrice ? product.salePrice : product.price
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const updateQuantity = (productId: string, newQuantity: number) => {
  if (newQuantity > 0) {
    cartStore.updateQuantity(productId, newQuantity)
  }
}

const handleShippingSubmit = (data: any) => {
  shippingData.value = { ...data }
  checkoutStep.value = 3
}

const proceedToCheckout = async () => {
  console.log('🔍 Début du checkout')
  console.log('🔍 Auth token:', authStore.token ? 'Présent' : 'Manquant')
  console.log('🔍 API URL:', import.meta.env.VITE_API_URL)
  console.log('🔍 Stripe key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY)

  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/cart')
    return
  }

  checkoutLoading.value = true

  try {
    // Prépare les items pour le backend
    const items = cartStore.items
      .filter(item => item.product)
      .map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: getCurrentPrice(item.product)
      }))

    // 1. Créer commande + intention de paiement
    const { order, paymentIntent } = await orderStore.processCheckout(
      items,
      shippingData.value
    )

    console.log('✅ Commande créée:', order)
    console.log('💳 Intention de paiement créée:', paymentIntent)

    // 2. Demander l'URL Stripe Checkout au backend
    const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        orderId: order.id,
        paymentIntentId: paymentIntent.id,
        email: authStore.user?.email,
        shippingCost: shippingCost.value
      })
    })

    const data = await res.json()

    if (data.success && data.url) {
      // Vider le panier avant la redirection
      cartStore.clearCart()
      // Rediriger vers Stripe Checkout
      window.location.href = data.url
    } else {
      throw new Error(data.message || 'Impossible de démarrer le paiement Stripe')
    }

  } catch (error: any) {
    console.error('❌ Erreur lors du checkout:', error)
    alert(`Erreur: ${error.message}`)
  } finally {
    checkoutLoading.value = false
  }
}
</script>