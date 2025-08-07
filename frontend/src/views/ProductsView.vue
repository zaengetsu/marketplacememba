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
                <input v-model="searchQuery" type="text" placeholder="Nom du produit..." class="form-input"
                  @input="debouncedSearch">
              </div>

              <!-- Catégories -->
              <div>
                <label class="form-label">Catégorie</label>
                <select v-model="selectedCategory" class="form-select" @change="loadProducts">
                  <option value="">Toutes les catégories</option>
                  <option v-for="category in uniqueCategories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Prix -->
              <div>
                <label class="form-label">Prix maximum</label>
                <input v-model.number="maxPrice" type="range" min="0" max="2000" step="50" class="w-full"
                  @change="loadProducts">
                <div class="text-sm text-gray-600 mt-1">
                  Jusqu'à {{ maxPrice }}€
                </div>
              </div>

              <!-- Promotions -->
              <div>
                <label class="flex items-center">
                  <input v-model="onlyOnSale" type="checkbox" class="mr-2" @change="loadProducts">
                  <span class="text-sm">Promotions uniquement</span>
                </label>
              </div>

              <!-- Stock -->
              <div>
                <label class="flex items-center">
                  <input v-model="onlyInStock" type="checkbox" class="mr-2" @change="loadProducts">
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
          <div v-else-if="products.length > 0"
            class="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
            <div v-for="product in products" :key="product.id" class="group relative">
              <div class="relative">
                <img :src="getProductImage(product)" :alt="product.name"
                  class="aspect-[4/3] w-full rounded-lg bg-gray-100 object-cover" />
                <!-- Badge promotion -->
                <div v-if="product.isOnSale && product.salePrice"
                  class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{{ Math.round(((product.price - product.salePrice) / product.price) * 100) }}%
                </div>
                <!-- Badge stock -->
                <div v-if="product.stockQuantity <= 5 && product.stockQuantity > 0"
                  class="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                  Stock faible
                </div>
                <div v-else-if="product.stockQuantity === 0"
                  class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Rupture
                </div>
                <div aria-hidden="true"
                  class="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div @click="openProductModal(product)"
                    class="w-full rounded-md bg-white/75 px-4 py-2 text-center text-sm font-medium text-gray-900 backdrop-blur backdrop-filter cursor-pointer hover:bg-white/90">
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
                <div class="flex flex-col items-end space-y-1">
                  <span class="text-orange-600 font-bold">
                    {{ formatCurrency(product.isOnSale && product.salePrice ? product.salePrice : product.price) }} TTC
                  </span>
                  <span class="text-xs text-gray-500">
                    HT : {{ formatCurrency((product.isOnSale && product.salePrice ? product.salePrice : product.price) /
                    1.2) }}
                  </span>
                  <span v-if="product.isOnSale && product.salePrice" class="line-through text-gray-400 text-sm">
                    {{ formatCurrency(product.price) }}
                  </span>
                  <span v-if="product.isOnSale && product.salePrice" class="text-green-600 text-xs font-medium">
                    Économisez {{ formatCurrency(product.price - product.salePrice) }}
                  </span>
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">{{ product.category?.name || 'Sport' }}</p>

              <!-- Bouton d'ajout au panier -->
              <button @click.stop="addToCart(product)" :disabled="!product.stockQuantity"
                class="mt-3 w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
            <button @click="resetFilters"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all">
              Réinitialiser les filtres
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8">
            <div class="flex space-x-2">
              <button @click="previousPage" :disabled="currentPage === 1" class="btn btn-outline"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
                Précédent
              </button>

              <span class="flex items-center px-4 py-2 text-sm text-gray-600">
                Page {{ currentPage }} sur {{ totalPages }}
              </span>

              <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-outline"
                :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal détail produit -->
    <ProductModal v-if="selectedProduct" :product="selectedProduct" @close="selectedProduct = null"
      @add-to-cart="addToCart" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { categoryService } from '../services/api'
import axios from 'axios'
import type { Product, Category } from '../types/product'
import ProductModal from '../components/ProductModal.vue'
import { useToast } from 'vue-toastification'
import { getProductImageUrl } from '../utils/image'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// État
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const selectedProduct = ref<Product | null>(null)
const uniqueCategories = computed(() => {
  const seen = new Set<string>()
  return categories.value.filter(cat => {
    const key = cat.name.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

// Filtres
const searchQuery = ref('')
const selectedCategory = ref('')
const maxPrice = ref(2000)
const onlyOnSale = ref(false)
const onlyInStock = ref(false)
const sortBy = ref('name')

// Met à jour l'URL à chaque changement de filtre
const updateUrlQuery = () => {
  const query: any = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (searchQuery.value) query.search = searchQuery.value
  if (maxPrice.value < 2000) query.maxPrice = maxPrice.value
  if (onlyOnSale.value) query.onSale = 'true'
  if (onlyInStock.value) query.inStock = 'true'
  if (sortBy.value && sortBy.value !== 'name') query.sortBy = sortBy.value
  router.replace({ query })
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalProducts = ref(0)
const totalPages = ref(0)

// Debounce pour la recherche
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    updateUrlQuery()
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

    updateUrlQuery()

    // Appel direct à la route Mongo
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/search-mongo`, { params })

    if (response.data.success && response.data.data) {
      products.value = (response.data.data.products || []).map((prod: any) => {
        return {
          ...prod,
          id: prod.id || prod._id, // Compatibilité Mongo/SQL
          price: Number(prod.price) || 0,
          salePrice: prod.salePrice !== undefined ? Number(prod.salePrice) : undefined
        }
      })
      if (response.data.data.pagination) {
        totalProducts.value = response.data.data.pagination.total
        totalPages.value = response.data.data.pagination.pages
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

const addToCart = async (product: Product) => {
  // Convertir le produit au format attendu par le store (ancien format avec _id)
  const cartProduct: any = {
    _id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: product.isOnSale && product.salePrice ? product.salePrice : product.price,
    salePrice: product.salePrice,
    isOnSale: product.isOnSale,
    images: [{ url: getProductImageUrl(product), alt: product.name, isPrimary: true }],
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
  updateUrlQuery()
  loadProducts()
}
// Fonction utilitaire locale pour gérer les images MongoDB/SQL
// Remove trailing '/api' from API_URL for static asset URLs
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
const getProductImage = (product: any) => {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Cas MongoDB : tableau d'objets { url }
    if (typeof product.images[0] === 'object' && product.images[0] !== null) {
      const primary = product.images.find((img: any) => img.isPrimary && img.url)
      let url = (primary && primary.url) ? primary.url : (product.images.find((img: any) => img.url) || {}).url;
      if (url) return url.startsWith('/uploads') ? API_URL + url : url;
    }
    // Cas SQL : tableau de chaînes
    if (typeof product.images[0] === 'string') {
      const url = product.images[0];
      return url.startsWith('/uploads') ? API_URL + url : url;
    }
  }
  return '/placeholder.svg';
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


// Watcher pour synchroniser les filtres avec l'URL au chargement ou navigation
onMounted(() => {
  // Appliquer les filtres depuis l'URL si présents
  const q = route.query
  if (q.category) selectedCategory.value = String(q.category)
  if (q.search) searchQuery.value = String(q.search)
  if (q.maxPrice) maxPrice.value = Number(q.maxPrice)
  if (q.onSale) onlyOnSale.value = q.onSale === 'true'
  if (q.inStock) onlyInStock.value = q.inStock === 'true'
  if (q.sortBy) sortBy.value = String(q.sortBy)
  loadCategories()
  loadProducts()
})

onMounted(async () => {
  await loadCategories()
  await loadProducts()
})
</script>