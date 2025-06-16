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
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Liste des articles -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="card-header">
              <h2 class="text-xl font-semibold">Articles ({{ cartStore.totalItems }})</h2>
            </div>
            <div class="card-body p-0">
              <div v-for="item in cartStore.items" :key="item.product.id" 
                   class="flex items-center p-6 border-b border-gray-200 last:border-b-0">
                
                <!-- Image du produit -->
                <div class="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-4">
                  <img 
                    :src="'/placeholder.jpg'" 
                    :alt="item.product.name"
                    class="w-full h-full object-cover"
                  >
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
                  <button 
                    @click="updateQuantity(item.product.id.toString(), item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                    class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span class="mx-3 font-semibold">{{ item.quantity }}</span>
                  <button 
                    @click="updateQuantity(item.product.id.toString(), item.quantity + 1)"
                    class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
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
                  @click="cartStore.removeItem(item.product.id.toString())"
                  class="text-red-500 hover:text-red-700 p-2"
                >
                  🗑️
                </button>
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
                  <span>Sous-total</span>
                  <span>{{ cartStore.totalPrice.toFixed(2) }}€</span>
                </div>
                <div class="flex justify-between">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <hr>
                <div class="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{{ cartStore.totalPrice.toFixed(2) }}€</span>
                </div>
              </div>

              <button 
                @click="proceedToCheckout"
                :disabled="checkoutLoading"
                class="w-full btn btn-primary mt-6"
              >
                <div v-if="checkoutLoading" class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ checkoutLoading ? 'Redirection...' : 'Passer commande' }}
              </button>

              <button 
                @click="cartStore.clearCart"
                class="w-full btn btn-outline mt-3"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

const cartStore = useCartStore()
const checkoutLoading = ref(false)

const getCurrentPrice = (product: Product) => {
  return product.isOnSale && product.salePrice ? product.salePrice : product.price
}

const updateQuantity = (productId: string, quantity: number) => {
  if (quantity <= 0) {
    cartStore.removeItem(productId)
  } else {
    cartStore.updateQuantity(productId, quantity)
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const proceedToCheckout = async () => {
  checkoutLoading.value = true
  
  try {
    // Ici on intégrerait Stripe
    // Pour l'instant, on simule juste
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirection vers la page de paiement Stripe
    console.log('Redirection vers Stripe avec:', {
      items: cartStore.items,
      total: cartStore.totalPrice
    })
    
    // cartStore.clearCart() // Après paiement réussi
  } catch (error) {
    console.error('Erreur lors du checkout:', error)
  } finally {
    checkoutLoading.value = false
  }
}
</script> 