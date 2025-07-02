<template>
  <div class="product-detail">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <router-link to="/" class="text-gray-700 hover:text-blue-600">
              Accueil
            </router-link>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <router-link to="/products" class="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">
                Produits
              </router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-1 text-gray-500 md:ml-2">{{ product?.category?.name }}</span>
            </div>
          </li>
          <li aria-current="page">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-1 text-gray-500 md:ml-2">{{ product?.name }}</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2">Chargement du produit...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">😞</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <router-link to="/products" class="btn btn-primary">
          Retour aux produits
        </router-link>
      </div>

      <!-- Contenu produit -->
      <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Images -->
        <div>
          <!-- Image principale -->
          <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-6 relative">
            <img 
              :src="getProductImage(product)" 
              :alt="product.name"
              class="w-full h-96 object-cover"
            >
            <!-- Badges -->
            <div v-if="product.isOnSale" class="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold">
              PROMOTION -{{ Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100) }}%
            </div>
            <div v-if="product.stockQuantity <= 5 && product.stockQuantity > 0" class="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full text-sm">
              Stock faible
            </div>
            <div v-if="product.stockQuantity === 0" class="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full text-sm">
              Rupture de stock
            </div>
          </div>


        </div>

        <!-- Informations produit -->
        <div>
          <!-- Titre et prix -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
            
            <!-- Prix -->
            <div class="flex items-center space-x-4 mb-4">
              <span v-if="product.isOnSale && product.salePrice" class="text-4xl font-bold text-red-500">
                {{ product.salePrice }}€
              </span>
              <span :class="product.isOnSale && product.salePrice ? 'line-through text-gray-400 text-2xl' : 'text-4xl font-bold text-gray-900'">
                {{ product.price }}€
              </span>
            </div>
            
            <!-- Économie -->
            <div v-if="product.isOnSale && product.salePrice" class="text-green-600 font-medium mb-4">
              Vous économisez {{ (product.price - product.salePrice).toFixed(2) }}€
            </div>
          </div>

          <!-- Description -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-3">Description</h3>
            <p class="text-gray-700 leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Informations techniques -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-3">Informations</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Catégorie :</span>
                <span class="font-medium">{{ product.category?.name }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Stock :</span>
                <span class="font-medium" :class="getStockClass(product.stockQuantity)">
                  {{ product.stockQuantity }} unité(s)
                </span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Référence :</span>
                <span class="font-medium">{{ product.slug }}</span>
              </div>
            </div>
          </div>

          <!-- Ajout au panier -->
          <div class="mb-8">
            <div class="flex items-center space-x-4 mb-6">
              <label class="text-lg font-medium text-gray-700">Quantité :</label>
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button 
                  @click="quantity > 1 && quantity--"
                  :disabled="quantity <= 1"
                  class="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <input 
                  v-model.number="quantity" 
                  type="number" 
                  min="1" 
                  :max="product.stockQuantity"
                  class="w-20 text-center border-0 focus:ring-0"
                >
                <button 
                  @click="quantity < product.stockQuantity && quantity++"
                  :disabled="quantity >= product.stockQuantity"
                  class="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex space-x-4">
              <button 
                @click="addToCart"
                :disabled="!product.stockQuantity || isAdding"
                class="flex-1 btn btn-primary py-4 text-lg"
                :class="{ 'opacity-50 cursor-not-allowed': !product.stockQuantity || isAdding }"
              >
                <span v-if="isAdding" class="flex items-center justify-center">
                  <div class="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout en cours...
                </span>
                <span v-else>
                  {{ product.stockQuantity ? `Ajouter au panier (${quantity})` : 'Rupture de stock' }}
                </span>
              </button>
              
              <button class="btn btn-outline py-4 px-6">
                ❤️
              </button>
              
              <button class="btn btn-outline py-4 px-6">
                📤
              </button>
            </div>
          </div>

          <!-- Livraison et retour -->
          <div class="border-t pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div class="flex items-start">
                <div class="text-green-500 mr-3 mt-1">🚚</div>
                <div>
                  <div class="font-medium">Livraison gratuite</div>
                  <div class="text-gray-600">À partir de 50€ d'achat</div>
                </div>
              </div>
              <div class="flex items-start">
                <div class="text-blue-500 mr-3 mt-1">↩️</div>
                <div>
                  <div class="font-medium">Retour gratuit</div>
                  <div class="text-gray-600">Sous 30 jours</div>
                </div>
              </div>
              <div class="flex items-start">
                <div class="text-purple-500 mr-3 mt-1">🔒</div>
                <div>
                  <div class="font-medium">Paiement sécurisé</div>
                  <div class="text-gray-600">SSL et 3D Secure</div>
                </div>
              </div>
              <div class="flex items-start">
                <div class="text-orange-500 mr-3 mt-1">📞</div>
                <div>
                  <div class="font-medium">Support client</div>
                  <div class="text-gray-600">7j/7 de 9h à 18h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Produits similaires -->
      <div v-if="product && similarProducts.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="similarProduct in similarProducts" :key="similarProduct.id" class="card hover:shadow-lg transition-shadow">
            <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                :src="getProductImage(similarProduct)" 
                :alt="similarProduct.name"
                class="w-full h-48 object-cover"
              >
            </div>
            <div class="card-body">
              <h3 class="font-semibold text-lg mb-2 line-clamp-2">{{ similarProduct.name }}</h3>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span v-if="similarProduct.isOnSale" class="text-red-500 font-bold">
                    {{ similarProduct.salePrice }}€
                  </span>
                  <span :class="similarProduct.isOnSale ? 'line-through text-gray-400' : 'font-bold text-gray-900'">
                    {{ similarProduct.price }}€
                  </span>
                </div>
                <router-link 
                  :to="`/products/${similarProduct.id}`"
                  class="btn btn-primary btn-sm"
                >
                  Voir
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useToast } from 'vue-toastification'
import { productService } from '@/services/api'
import type { Product } from '../types/product'
import { getCategoryImageUrl, getProductImageUrl } from '../utils/image'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// État
const product = ref<Product | null>(null)
const similarProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const isAdding = ref(false)
const selectedImage = ref<any>(null)

// Méthodes utilitaires
const getStockClass = (stockQuantity: number) => {
  if (stockQuantity === 0) return 'text-red-600'
  if (stockQuantity <= 5) return 'text-orange-600'
  return 'text-green-600'
}

const getProductImage = (product: Product) => {
  // Utiliser d'abord l'image du produit si elle existe
  if (product.images && product.images.length > 0) {
    return getProductImageUrl(product)
  }
  // Sinon utiliser l'image de la catégorie
  if (product.category?.slug) {
    return getCategoryImageUrl(product.category.slug)
  }
  // Image par défaut
  return '/placeholder.svg'
}

// Actions
const addToCart = async () => {
  if (!product.value) return
  
  isAdding.value = true
  try {
    // Convertir le produit au format attendu par le cart store
    const cartProduct = {
      ...product.value,
      _id: product.value.id.toString(),
      stock: {
        quantity: product.value.stockQuantity,
        reserved: 0,
        lowStockThreshold: 5
      },
      images: [{ url: getProductImage(product.value), alt: product.value.name, isPrimary: true }]
    }
    
    await cartStore.addItem(cartProduct as any, quantity.value)
    toast.success(`${quantity.value} ${product.value.name} ajouté(s) au panier`)
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    toast.error('Erreur lors de l\'ajout au panier')
  } finally {
    isAdding.value = false
  }
}

const loadProduct = async () => {
  try {
    loading.value = true
    error.value = null
    
    const productId = route.params.id as string
    
    // Charger le produit depuis l'API
    const response = await productService.getProduct(productId)
    
    if (response.success && response.data) {
      product.value = response.data
      
      // Charger les produits similaires (même catégorie)
      if (product.value && product.value.categoryId) {
        const similarResponse = await productService.getProducts({
          category: product.value.categoryId.toString(),
          limit: 4
        })
        
        if (similarResponse.success && similarResponse.data && similarResponse.data.products) {
          similarProducts.value = similarResponse.data.products.filter(p => p.id !== product.value!.id)
        }
      }
    } else {
      error.value = 'Le produit demandé n\'existe pas ou n\'est plus disponible.'
    }
    
  } catch (err) {
    console.error('Erreur lors du chargement du produit:', err)
    error.value = 'Erreur lors du chargement du produit.'
  } finally {
    loading.value = false
  }
}

// Watcher pour recharger si l'ID change
watch(() => route.params.id, () => {
  if (route.params.id !== product.value?.id.toString()) {
    loadProduct()
  }
})

onMounted(() => {
  loadProduct()
})
</script> 