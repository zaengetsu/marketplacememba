<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-2xl font-bold">{{ product.name }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenu -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <!-- Images -->
        <div>
          <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-4">
            <img 
              :src="selectedImage?.url || '/placeholder.jpg'" 
              :alt="product.name"
              class="w-full h-96 object-cover"
            >
            <!-- Badges -->
            <div v-if="product.isOnSale" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              PROMOTION
            </div>
            <div v-if="product.stock.quantity <= 5" class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
              Stock faible
            </div>
          </div>

          <!-- Miniatures -->
          <div v-if="product.images.length > 1" class="flex space-x-2">
            <button 
              v-for="(image, index) in product.images" 
              :key="index"
              @click="selectedImage = image"
              class="w-16 h-16 bg-gray-200 rounded overflow-hidden border-2"
              :class="selectedImage === image ? 'border-blue-500' : 'border-transparent'"
            >
              <img :src="image.url" :alt="image.alt" class="w-full h-full object-cover">
            </button>
          </div>
        </div>

        <!-- Détails -->
        <div>
          <!-- Prix -->
          <div class="mb-6">
            <div class="flex items-center space-x-3 mb-2">
              <span v-if="product.isOnSale" class="text-3xl font-bold text-red-500">
                {{ product.salePrice }}€
              </span>
              <span :class="product.isOnSale ? 'line-through text-gray-400 text-xl' : 'text-3xl font-bold text-gray-900'">
                {{ product.price }}€
              </span>
            </div>
            <div v-if="product.isOnSale" class="text-sm text-green-600 font-medium">
              Économisez {{ (product.price - (product.salePrice || 0)).toFixed(2) }}€
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Description</h3>
            <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Informations produit -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Informations</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Catégorie :</span>
                <span class="font-medium">{{ product.category.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Stock disponible :</span>
                <span class="font-medium" :class="product.stock.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ product.stock.quantity }} unité(s)
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Note moyenne :</span>
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-1">
                    <span v-for="i in 5" :key="i" class="text-sm">
                      {{ i <= Math.floor(product.rating.average) ? '★' : '☆' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-600">({{ product.rating.count }} avis)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quantité et ajout au panier -->
          <div class="mb-6">
            <div class="flex items-center space-x-4 mb-4">
              <label class="text-sm font-medium text-gray-700">Quantité :</label>
              <div class="flex items-center border border-gray-300 rounded">
                <button 
                  @click="quantity > 1 && quantity--"
                  :disabled="quantity <= 1"
                  class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <input 
                  v-model.number="quantity" 
                  type="number" 
                  min="1" 
                  :max="product.stock.quantity"
                  class="w-16 text-center border-0 focus:ring-0"
                >
                <button 
                  @click="quantity < product.stock.quantity && quantity++"
                  :disabled="quantity >= product.stock.quantity"
                  class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              @click="handleAddToCart"
              :disabled="!product.stock.quantity || isAdding"
              class="w-full btn btn-primary py-3 text-lg"
              :class="{ 'opacity-50 cursor-not-allowed': !product.stock.quantity || isAdding }"
            >
              <span v-if="isAdding" class="flex items-center justify-center">
                <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Ajout en cours...
              </span>
              <span v-else>
                {{ product.stock.quantity ? `Ajouter au panier (${quantity})` : 'Rupture de stock' }}
              </span>
            </button>
          </div>

          <!-- Actions supplémentaires -->
          <div class="flex space-x-3">
            <button class="flex-1 btn btn-outline">
              ❤️ Ajouter aux favoris
            </button>
            <button class="flex-1 btn btn-outline">
              📤 Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product } from '../types/product'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'add-to-cart': [product: Product, quantity: number]
}>()

const selectedImage = ref(props.product.images[0])
const quantity = ref(1)
const isAdding = ref(false)

const handleAddToCart = async () => {
  isAdding.value = true
  try {
    emit('add-to-cart', props.product, quantity.value)
    // Petite pause pour l'UX
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    isAdding.value = false
  }
}

onMounted(() => {
  // Empêcher le scroll du body quand la modal est ouverte
  document.body.style.overflow = 'hidden'
  
  // Nettoyer au démontage
  return () => {
    document.body.style.overflow = 'auto'
  }
})
</script> 