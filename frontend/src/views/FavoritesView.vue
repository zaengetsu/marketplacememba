<template>
  <div class="favorites-view min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mes Favoris</h1>
        <p class="text-gray-600">Retrouvez tous vos produits préférés</p>
      </div>

      <!-- Empty State -->
      <div v-if="favorites.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">💝</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun favori pour le moment</h3>
        <p class="text-gray-600 mb-6">Découvrez nos produits et ajoutez vos préférés à cette liste</p>
        <router-link
          to="/products"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
        >
          Découvrir nos produits
        </router-link>
      </div>

      <!-- Favorites Grid -->
      <div v-else>
        <!-- Actions Bar -->
        <div class="flex justify-between items-center mb-6">
          <p class="text-gray-600">{{ favorites.length }} produit(s) en favoris</p>
          <button
            @click="clearAllFavorites"
            class="text-red-600 hover:text-red-700 font-medium"
            :disabled="isLoading"
          >
            Vider les favoris
          </button>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in favorites"
            :key="product.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
          >
            <!-- Product Image -->
            <div class="relative aspect-square overflow-hidden">
              <img
                :src="getProductImage(product)"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              <!-- Favorite Button -->
              <button
                @click="removeFromFavorites(product.id)"
                class="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white hover:text-red-600 transition-all shadow-sm"
                :disabled="isLoading"
              >
                <span class="text-xl">❤️</span>
              </button>

              <!-- Sale Badge -->
              <div
                v-if="product.isOnSale && product.salePrice"
                class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
              >
                -{{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}%
              </div>

              <!-- Stock Badge -->
              <div
                v-if="product.stockQuantity <= 5 && product.stockQuantity > 0"
                class="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium"
              >
                Plus que {{ product.stockQuantity }} en stock
              </div>
              <div
                v-else-if="product.stockQuantity === 0"
                class="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium"
              >
                Rupture de stock
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <div class="mb-2">
                <span class="text-xs text-gray-500 uppercase tracking-wide">{{ product.category?.name || 'Sport' }}</span>
              </div>
              
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>
              
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ product.description }}</p>

              <!-- Price -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <span
                    v-if="product.isOnSale && product.salePrice"
                    class="text-lg font-bold text-red-600"
                  >
                    {{ formatCurrency(product.salePrice) }}
                  </span>
                  <span
                    :class="[
                      'font-semibold',
                      product.isOnSale && product.salePrice
                        ? 'text-sm text-gray-500 line-through' 
                        : 'text-lg text-gray-900'
                    ]"
                  >
                    {{ formatCurrency(product.price) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex space-x-2">
                <button
                  @click="addToCart(product)"
                  :disabled="product.stockQuantity === 0 || isLoading"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {{ product.stockQuantity === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}
                </button>
                
                <router-link
                  :to="`/products/${product.id}`"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Voir
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore" class="text-center mt-8">
          <button
            @click="loadMore"
            :disabled="isLoading"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Chargement...' : 'Charger plus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from 'vue-toastification'
import { productService } from '@/services/api'
import type { Product } from '@/types/product'
import { getProductImageUrl } from '@/utils/image'

const cartStore = useCartStore()
const toast = useToast()

const favorites = ref<Product[]>([])
const isLoading = ref(false)
const hasMore = ref(false)

// Images par défaut pour les catégories
const categoryImages: Record<string, string> = {
  'chaussures': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'musculation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
  'yoga-pilates': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
  'electronique-sport': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  'accessoires': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'nutrition': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop',
  'cardio': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
  'sports-combat': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&h=500&fit=crop'
}

const loadFavorites = async () => {
  isLoading.value = true
  try {
    // Récupérer les IDs des favoris depuis localStorage
    const savedFavorites = localStorage.getItem('userFavorites')
    if (!savedFavorites) {
      favorites.value = []
      return
    }

    const favoriteIds = JSON.parse(savedFavorites)
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      favorites.value = []
      return
    }

    // Charger les produits favoris depuis l'API
    const favoriteProducts: Product[] = []
    for (const id of favoriteIds) {
      try {
        const response = await productService.getProduct(id.toString())
        if (response.success && response.data) {
          favoriteProducts.push(response.data)
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du produit ${id}:`, error)
        // Retirer l'ID invalide des favoris
        const updatedIds = favoriteIds.filter((fId: any) => fId !== id)
        localStorage.setItem('userFavorites', JSON.stringify(updatedIds))
      }
    }

    favorites.value = favoriteProducts
  } catch (error) {
    toast.error('Erreur lors du chargement des favoris')
    console.error('Error loading favorites:', error)
    favorites.value = []
  } finally {
    isLoading.value = false
  }
}

const removeFromFavorites = async (productId: number) => {
  try {
    favorites.value = favorites.value.filter(product => product.id !== productId)
    
    // Mettre à jour localStorage
    const favoriteIds = favorites.value.map(product => product.id)
    localStorage.setItem('userFavorites', JSON.stringify(favoriteIds))
    
    toast.success('Produit retiré des favoris')
  } catch (error) {
    toast.error('Erreur lors de la suppression')
    console.error('Error removing from favorites:', error)
  }
}

const clearAllFavorites = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider tous vos favoris ?')) {
    try {
      favorites.value = []
      localStorage.removeItem('userFavorites')
      toast.success('Tous les favoris ont été supprimés')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error('Error clearing favorites:', error)
    }
  }
}

const getProductImage = (product: Product) => {
  // Utilise la fonction utilitaire commune
  return getProductImageUrl(product)
}

const addToCart = async (product: Product) => {
  // Convertir le produit au format attendu par le store
  const cartProduct: any = {
    _id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
    salePrice: product.salePrice,
    isOnSale: product.isOnSale,
    images: [{ url: getProductImage(product), alt: product.name, isPrimary: true }],
    category: { 
      id: product.categoryId.toString(), 
      name: product.category?.name || 'Sport', 
      slug: product.category?.slug || 'sport' 
    },
    stock: { 
      quantity: product.stockQuantity, 
      reserved: 0, 
      lowStockThreshold: 5 
    },
    slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
    status: 'active' as const,
    isActive: true,
    rating: { average: 4.5, count: 100 },
    salesCount: 50,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }
  
  await cartStore.addItem(cartProduct, 1)
}

const loadMore = async () => {
  // Cette fonctionnalité n'est plus nécessaire car on charge tous les favoris
  hasMore.value = false
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 