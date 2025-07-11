<template>
  <div class="products-view">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Nos Produits</h1>
        <div class="text-sm text-gray-600">
          {{ totalProducts }} produit(s) trouvé(s)
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar filtres -->
        <div class="lg:col-span-1">
          <div class="card sticky top-4">
            <div class="card-header">
              <h2 class="text-lg font-semibold">Filtres</h2>
            </div>
            <div class="card-body space-y-6">
              <!-- Recherche -->
              <div>
                <label class="form-label">Rechercher</label>
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Nom du produit..."
                  class="form-input"
                  @input="debouncedSearch"
                >
              </div>

              <!-- Catégories -->
              <div>
                <label class="form-label">Catégorie</label>
                <select v-model="selectedCategory" class="form-select" @change="loadProducts">
                  <option value="">Toutes les catégories</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Prix -->
              <div>
                <label class="form-label">Prix maximum</label>
                <input 
                  v-model.number="maxPrice"
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="50"
                  class="w-full"
                  @change="loadProducts"
                >
                <div class="text-sm text-gray-600 mt-1">
                  Jusqu'à {{ maxPrice }}€
                </div>
              </div>

              <!-- Promotions -->
              <div>
                <label class="flex items-center">
                  <input 
                    v-model="onlyOnSale"
                    type="checkbox" 
                    class="mr-2"
                    @change="loadProducts"
                  >
                  <span class="text-sm">Promotions uniquement</span>
                </label>
              </div>

              <!-- Stock -->
              <div>
                <label class="flex items-center">
                  <input 
                    v-model="onlyInStock"
                    type="checkbox" 
                    class="mr-2"
                    @change="loadProducts"
                  >
                  <span class="text-sm">En stock uniquement</span>
                </label>
              </div>

              <!-- Reset -->
              <button @click="resetFilters" class="btn btn-outline w-full">
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des produits -->
        <div class="lg:col-span-3">
          <!-- Tri -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">Trier par :</span>
              <select v-model="sortBy" class="form-select" @change="loadProducts">
                <option value="name">Nom</option>
                <option value="price">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="newest">Plus récent</option>
              </select>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p class="mt-2">Chargement des produits...</p>
          </div>

          <!-- Grille des produits -->
          <div v-else-if="products.length > 0" class="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
            <div v-for="product in products" :key="product.id" class="group relative">
              <div class="relative">
                <img
                  :src="getProductImage(product)"
                  :alt="product.name"
                  class="aspect-[4/3] w-full rounded-lg bg-gray-100 object-cover"
                />
                <!-- Badge promotion -->
                <div v-if="product.isOnSale && product.salePrice" class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}%
                </div>
                <!-- Badge stock -->
                <div v-if="product.stockQuantity <= 5 && product.stockQuantity > 0" class="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                  Stock faible
                </div>
                <div v-else-if="product.stockQuantity === 0" class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Rupture
                </div>
                <div
                  aria-hidden="true"
                  class="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div 
                    @click="openProductModal(product)"
                    class="w-full rounded-md bg-white/75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur backdrop-filter cursor-pointer hover:bg-white/90"
                  >
                    Voir le produit
                  </div>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between space-x-8 text-base font-medium text-gray-900">
                <h3>
                  <router-link :to="`/products/${product.id}`" class="hover:text-orange-600">
                    <span aria-hidden="true" class="absolute inset-0" />
                    {{ product.name }}
                  </router-link>
                </h3>
                <div class="flex items-center space-x-2">
                  <span v-if="product.isOnSale && product.salePrice" class="text-orange-600 font-bold">
                    {{ formatCurrency(product.salePrice) }}
                  </span>
                  <span :class="product.isOnSale && product.salePrice ? 'line-through text-gray-400 text-sm' : 'text-orange-600 font-bold'">
                    {{ formatCurrency(product.price) }}
                  </span>
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ product.category?.name || 'Sport' }}</p>
              
              <!-- Bouton d'ajout au panier -->
              <button 
                @click.stop="addToCart(product)"
                :disabled="!product.stockQuantity"
                class="mt-3 w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ product.stockQuantity ? 'Ajouter au panier' : 'Rupture de stock' }}
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!loading" class="text-center py-16">
            <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-4xl">🔍</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p class="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
            <button @click="resetFilters" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all">
              Réinitialiser les filtres
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8">
            <div class="flex space-x-2">
              <button 
                @click="previousPage"
                :disabled="currentPage === 1"
                class="btn btn-outline"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
              >
                Précédent
              </button>
              
              <span class="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {{ currentPage }} sur {{ totalPages }}
              </span>
              
              <button 
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="btn btn-outline"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal détail produit -->
    <ProductModal 
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { productService, categoryService } from '../services/api'
import type { Product, Category } from '../types/product'
import ProductModal from '../components/ProductModal.vue'
import { useToast } from 'vue-toastification'

const route = useRoute()
const cartStore = useCartStore()
const toast = useToast()

// État
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const selectedProduct = ref<Product | null>(null)

// Filtres
const searchQuery = ref('')
const selectedCategory = ref('')
const maxPrice = ref(2000)
const onlyOnSale = ref(false)
const onlyInStock = ref(false)
const sortBy = ref('name')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalProducts = ref(0)
const totalPages = ref(0)

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

// Debounce pour la recherche
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 500)
}

const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
    toast.error('Erreur lors du chargement des catégories')
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: itemsPerPage,
      sortBy: sortBy.value === 'newest' ? 'createdAt' : sortBy.value,
      sortOrder: sortBy.value === 'price-desc' ? 'desc' : 'asc'
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (maxPrice.value < 2000) params.maxPrice = maxPrice.value
    if (onlyOnSale.value) params.onSale = true
    if (onlyInStock.value) params.inStock = true

    const response = await productService.getProducts(params)
    
    if (response.success && response.data) {
      products.value = response.data.products || []
      if (response.data.pagination) {
        totalProducts.value = response.data.pagination.total
        totalPages.value = response.data.pagination.pages
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    toast.error('Erreur lors du chargement des produits')
    products.value = []
  } finally {
    loading.value = false
  }
}

const getProductImage = (product: Product) => {
  // Utiliser l'image par défaut basée sur la catégorie
  const categorySlug = product.category?.slug || 'accessoires'
  return categoryImages[categorySlug] || categoryImages['accessoires']
}

const addToCart = async (product: Product) => {
  // Convertir le produit au format attendu par le store (ancien format avec _id)
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

const openProductModal = (product: Product) => {
  selectedProduct.value = product
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  maxPrice.value = 2000
  onlyOnSale.value = false
  onlyInStock.value = false
  currentPage.value = 1
  loadProducts()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadProducts()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadProducts()
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Watcher pour les paramètres de route
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    const category = categories.value.find(cat => cat.slug === newCategory)
    if (category) {
      selectedCategory.value = category.id.toString()
      loadProducts()
    }
  }
}, { immediate: true })

onMounted(async () => {
  await loadCategories()
  await loadProducts()
})
</script> 