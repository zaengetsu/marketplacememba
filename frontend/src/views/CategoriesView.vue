<template>
  <div class="categories-view min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Catégories</h1>
        <p class="text-gray-600">Découvrez nos produits par catégorie</p>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <div class="relative max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une catégorie..."
            class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2">Chargement des catégories...</p>
      </div>

      <!-- Categories Grid -->
      <div v-else-if="filteredCategories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer"
          @click="navigateToCategory(category)"
        >
          <!-- Category Image -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="getCategoryImage(category)"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            <!-- Product Count Badge -->
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
              {{ getCategoryProductCount(category) }} produits
            </div>
            
            <!-- Category Icon -->
            <div class="absolute bottom-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
              {{ getCategoryIcon(category) }}
            </div>
          </div>

          <!-- Category Info -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
              {{ category.name }}
            </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ category.description }}
            </p>

            <!-- Action Button -->
            <button class="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium group-hover:shadow-md">
              Explorer {{ category.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">🔍</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune catégorie trouvée</h3>
        <p class="text-gray-600 mb-6">Essayez avec un autre terme de recherche</p>
        <button
          @click="searchQuery = ''"
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
        >
          Voir toutes les catégories
        </button>
      </div>

      <!-- Featured Categories Section -->
      <div v-if="!searchQuery && featuredCategories.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Catégories en vedette</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div
            v-for="featured in featuredCategories"
            :key="featured.id"
            class="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            @click="navigateToCategory(featured)"
          >
            <div class="flex">
              <!-- Image -->
              <div class="w-1/3 relative">
                <img
                  :src="getCategoryImage(featured)"
                  :alt="featured.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <!-- Content -->
              <div class="w-2/3 p-6 flex flex-col justify-center">
                <div class="flex items-center mb-2">
                  <span class="text-2xl mr-3">{{ getCategoryIcon(featured) }}</span>
                  <h3 class="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {{ featured.name }}
                  </h3>
                </div>
                <p class="text-gray-600 mb-4">{{ featured.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ getCategoryProductCount(featured) }} produits</span>
                  <span class="text-orange-600 font-medium group-hover:text-orange-700">
                    Explorer →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryService, productService } from '../services/api'
import type { Category } from '../types/product'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const searchQuery = ref('')
const loading = ref(true)

const categories = ref<Category[]>([])
const productCounts = ref<Record<number, number>>({})

// Images et icônes par catégorie
const categoryData: Record<string, { image: string; icon: string }> = {
  'chaussures': {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
    icon: '👟'
  },
  'musculation': {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    icon: '💪'
  },
  'yoga-pilates': {
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    icon: '🧘'
  },
  'electronique-sport': {
    image : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    icon  : '⌚'
  },        
  'accessoires': {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
    icon: '🎒'
  },
  'nutrition': {
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&h=400&fit=crop',
    icon: '🥤'
  },
  'cardio': {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    icon: '🏃'
  },
  'sports-combat': {
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
    icon: '🥊'
  }
}

const featuredCategories = computed(() => 
  categories.value.filter(cat => ['chaussures', 'musculation', 'yoga-pilates', 'electronique-sport'].includes(cat.slug))
)

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data.filter((cat: Category) => cat.isActive)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
    toast.error('Erreur lors du chargement des catégories')
  }
}

const loadProductCounts = async () => {
  try {
    // Charger le nombre de produits pour chaque catégorie
    for (const category of categories.value) {
      const response = await productService.getProducts({
        category: category.id.toString(),
        limit: 1 // On veut juste le total, pas les produits
      })
      
      if (response.success && response.data) {
        productCounts.value[category.id] = response.data.pagination.total
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des compteurs:', error)
    // Ne pas afficher d'erreur pour les compteurs, utiliser des valeurs par défaut
  }
}

const getCategoryImage = (category: Category) => {
  return categoryData[category.slug]?.image || categoryData['accessoires'].image
}

const getCategoryIcon = (category: Category) => {
  return categoryData[category.slug]?.icon || '🏃'
}

const getCategoryProductCount = (category: Category) => {
  return productCounts.value[category.id] || 0
}

const navigateToCategory = (category: Category) => {
  router.push({
    path: '/products',
    query: { category: category.slug }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await loadCategories()
    await loadProductCounts()
  } finally {
    loading.value = false
  }
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