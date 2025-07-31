<template>
  <div class="deals-view min-h-screen bg-gray-50">
    <!-- Flash Sale Banner -->
    <div class="bg-gradient-to-r from-red-600 to-orange-600 text-white">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold mb-4">⚡ FLASH SALE ⚡</h1>
          <p class="text-xl mb-6">Jusqu'à 70% de réduction sur une sélection de produits !</p>
          
          <!-- Countdown Timer -->
          <div class="flex justify-center items-center space-x-4 mb-6">
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div class="text-2xl font-bold">{{ timeLeft.hours.toString().padStart(2, '0') }}</div>
                <div class="text-sm">Heures</div>
              </div>
            </div>
            <div class="text-2xl">:</div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div class="text-2xl font-bold">{{ timeLeft.minutes.toString().padStart(2, '0') }}</div>
                <div class="text-sm">Minutes</div>
              </div>
            </div>
            <div class="text-2xl">:</div>
            <div class="text-center">
              <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div class="text-2xl font-bold">{{ timeLeft.seconds.toString().padStart(2, '0') }}</div>
                <div class="text-sm">Secondes</div>
              </div>
            </div>
          </div>
          
          <p class="text-lg opacity-90">Dépêchez-vous, les stocks sont limités !</p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Deal Categories Filter -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Filtrer par type d'offre</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="filter in dealFilters"
            :key="filter.id"
            @click="selectedFilter = filter.id; applyFilter()"
            :class="[
              'p-4 rounded-lg border-2 transition-all text-center',
              selectedFilter === filter.id
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
            ]"
          >
            <div class="font-semibold">{{ filter.label }}</div>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2">Chargement des offres...</p>
      </div>

      <!-- Deals Grid -->
      <div v-else-if="paginatedDeals.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="deal in paginatedDeals"
            :key="deal.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
          >
            <!-- Product Image -->
            <div class="relative aspect-square overflow-hidden">
              <img
                :src="getProductImage(deal)"
                :alt="deal.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              <!-- Discount Badge -->
              <div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{{ calculateDiscount(deal) }}%
              </div>

              <!-- Deal Type Badge -->
              <div
                v-if="getDealType(deal) !== 'Promotion'"
                :class="[
                  'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium',
                  getDealType(deal) === 'Flash Sale' ? 'bg-orange-500 text-white' :
                  getDealType(deal) === 'Liquidation' ? 'bg-purple-500 text-white' :
                  'bg-blue-500 text-white'
                ]"
              >
                {{ getDealType(deal) }}
              </div>

              <!-- Stock Warning -->
              <div
                v-if="deal.stockQuantity <= 5"
                class="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium"
              >
                Plus que {{ deal.stockQuantity }} en stock !
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <div class="mb-2">
                <span class="text-xs text-gray-500 uppercase tracking-wide">{{ deal.category?.name }}</span>
              </div>
              
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ deal.name }}</h3>

              <!-- Price -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <span class="text-lg font-bold text-red-600">
                    {{ formatCurrency(deal.isOnSale && deal.salePrice ? deal.salePrice : deal.price) }}
                  </span>
                  <span class="text-sm text-gray-500 line-through">
                    {{ formatCurrency(deal.price) }}
                  </span>
                </div>
                <div class="text-sm font-medium text-green-600">
                  Économie {{ formatCurrency(calculateSavings(deal)) }}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex space-x-2">
                <button
                  @click="addToCart(deal)"
                  :disabled="deal.stockQuantity === 0"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {{ deal.stockQuantity === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}
                </button>
                
                <button
                  @click="toggleFavorite(deal.id)"
                  :class="[
                    'px-3 py-2 rounded-lg border transition-colors',
                    isFavorite(deal.id)
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  ]"
                >
                  {{ isFavorite(deal.id) ? '❤️' : '🤍' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="currentPage < totalPages" class="text-center mt-8">
          <button
            @click="loadMore"
            :disabled="loading"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Chargement...' : 'Voir plus d\'offres' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <span class="text-4xl">🏷️</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
        <p class="text-gray-600 mb-6">Essayez un autre filtre ou revenez plus tard</p>
        <button
          @click="selectedFilter = 'all'; applyFilter()"
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all"
        >
          Voir toutes les offres
        </button>
      </div>

      <!-- Newsletter Section -->
      <div class="mt-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white p-8">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-4">Ne ratez aucune offre !</h2>
          <p class="text-lg mb-6 opacity-90">
            Inscrivez-vous à notre newsletter et soyez les premiers informés de nos promotions exclusives
          </p>
          
          <div class="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              v-model="email"
              type="email"
              placeholder="Votre adresse email"
              class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              @click="subscribeNewsletter"
              :disabled="!email || isSubscribing"
              class="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
            >
              {{ isSubscribing ? 'Inscription...' : 'S\'inscrire' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { productService } from '@/services/api'
import type { Product } from '@/types/product'
import { useToast } from 'vue-toastification'

const cartStore = useCartStore()
const toast = useToast()

const deals = ref<Product[]>([])
const filteredDeals = ref<Product[]>([])
const loading = ref(true)
const selectedFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 8
const totalPages = ref(0)

// Newsletter
const email = ref('')
const isSubscribing = ref(false)

// Flash sale countdown
const flashSaleEndTime = ref(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24h from now
const timeLeft = ref({
  hours: 0,
  minutes: 0,
  seconds: 0
})

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

const dealFilters = [
  { id: 'all', label: 'Toutes les offres' },
  { id: 'flash', label: 'Flash Sale' },
  { id: 'limited', label: 'Édition limitée' },
  { id: 'clearance', label: 'Liquidation' }
]

let countdownInterval: NodeJS.Timeout

const loadDeals = async () => {
  loading.value = true
  try {
    // Récupérer tous les produits en promotion
    const response = await productService.getProducts({
      onSale: true,
      limit: 50, // Récupérer plus de produits pour avoir du choix
      sortBy: 'price',
      sortOrder: 'desc'
    })
    
    if (response.success && response.data) {
      deals.value = response.data.products || []
      applyFilter()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des promotions:', error)
    toast.error('Erreur lors du chargement des promotions')
    deals.value = []
  } finally {
    loading.value = false
  }
}

const applyFilter = () => {
  let filtered = [...deals.value]
  
  switch (selectedFilter.value) {
    case 'flash':
      // Produits avec plus de 30% de réduction
      filtered = filtered.filter(deal => {
        if (deal.salePrice) {
          const discount = ((deal.price - deal.salePrice) / deal.price) * 100
          return discount >= 30
        }
        return false
      })
      break
    case 'limited':
      // Produits avec stock faible (moins de 10)
      filtered = filtered.filter(deal => deal.stockQuantity < 10 && deal.stockQuantity > 0)
      break
    case 'clearance':
      // Produits avec plus de 50% de réduction
      filtered = filtered.filter(deal => {
        if (deal.salePrice) {
          const discount = ((deal.price - deal.salePrice) / deal.price) * 100
          return discount >= 50
        }
        return false
      })
      break
    default:
      // Tous les produits en promotion
      break
  }
  
  filteredDeals.value = filtered
  totalPages.value = Math.ceil(filtered.length / itemsPerPage)
  currentPage.value = 1
}

const paginatedDeals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDeals.value.slice(start, end)
})

const getProductImage = (product: Product) => {
  const categorySlug = product.category?.slug || 'accessoires'
  return categoryImages[categorySlug] || categoryImages['accessoires']
}

const calculateDiscount = (product: Product) => {
  if (!product.salePrice) return 0
  return Math.round(((product.price - product.salePrice) / product.price) * 100)
}

const calculateSavings = (product: Product) => {
  if (!product.salePrice) return 0
  return product.price - product.salePrice
}

const getDealType = (product: Product) => {
  const discount = calculateDiscount(product)
  if (discount >= 50) return 'Liquidation'
  if (discount >= 30) return 'Flash Sale'
  if (product.stockQuantity < 10) return 'Édition limitée'
  return 'Promotion'
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

const toggleFavorite = (productId: number) => {
  try {
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]')
    const index = favorites.indexOf(productId)
    
    if (index > -1) {
      favorites.splice(index, 1)
      toast.success('Retiré des favoris')
    } else {
      favorites.push(productId)
      toast.success('Ajouté aux favoris')
    }
    
    localStorage.setItem('userFavorites', JSON.stringify(favorites))
  } catch (error) {
    toast.error('Erreur lors de la mise à jour des favoris')
  }
}

const isFavorite = (productId: number) => {
  try {
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]')
    return favorites.includes(productId)
  } catch {
    return false
  }
}

const subscribeNewsletter = async () => {
  if (!email.value) {
    toast.error('Veuillez saisir votre email')
    return
  }
  
  isSubscribing.value = true
  try {
    // Simuler l'inscription à la newsletter
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Inscription réussie ! Vous recevrez nos meilleures offres.')
    email.value = ''
  } catch (error) {
    toast.error('Erreur lors de l\'inscription')
  } finally {
    isSubscribing.value = false
  }
}

const loadMore = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = flashSaleEndTime.value.getTime() - now
  
  if (distance > 0) {
    timeLeft.value = {
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }
  } else {
    timeLeft.value = { hours: 0, minutes: 0, seconds: 0 }
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

onMounted(async () => {
  await loadDeals()
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
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