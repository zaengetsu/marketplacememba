<template>
  <div class="admin-products">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p class="text-gray-600">{{ products.length }} produit(s) au total</p>
        </div>
        <router-link to="/admin/products/new" class="btn btn-primary">
          ➕ Nouveau produit
        </router-link>
      </div>

      <!-- Filtres -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Rechercher un produit..."
                class="form-input"
              >
            </div>
            <div>
              <select v-model="selectedCategory" class="form-select">
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <select v-model="selectedStatus" class="form-select">
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
            <div>
              <button @click="resetFilters" class="btn btn-outline w-full">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2">Chargement des produits...</p>
      </div>

      <!-- Table des produits -->
      <div v-else class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in filteredProducts" :key="product._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img 
                        :src="product.images[0]?.url || '/placeholder.jpg'" 
                        :alt="product.name"
                        class="h-12 w-12 rounded-lg object-cover"
                      >
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-500">{{ product.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ product.category.name }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    <span v-if="product.isOnSale" class="text-red-500 font-bold">
                      {{ product.salePrice }}€
                    </span>
                    <span :class="product.isOnSale ? 'line-through text-gray-400 ml-2' : 'font-medium'">
                      {{ product.price }}€
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStockClass(product.stock.quantity)"
                  >
                    {{ product.stock.quantity }} unités
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusClass(product.status)"
                  >
                    {{ getStatusLabel(product.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="viewProduct(product)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Voir"
                    >
                      👁️
                    </button>
                    <router-link 
                      :to="`/admin/products/${product._id}/edit`"
                      class="text-indigo-600 hover:text-indigo-900"
                      title="Modifier"
                    >
                      ✏️
                    </router-link>
                    <button 
                      @click="toggleProductStatus(product)"
                      :class="product.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                      :title="product.isActive ? 'Désactiver' : 'Activer'"
                    >
                      {{ product.isActive ? '⏸️' : '▶️' }}
                    </button>
                    <button 
                      @click="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <div class="flex space-x-2">
          <button 
            @click="currentPage--"
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
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="btn btn-outline"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="productToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirmer la suppression</h3>
        <p class="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer le produit "{{ productToDelete.name }}" ? 
          Cette action est irréversible.
        </p>
        <div class="flex space-x-3">
          <button @click="productToDelete = null" class="btn btn-outline flex-1">
            Annuler
          </button>
          <button @click="confirmDelete" class="btn btn-danger flex-1">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de détail produit -->
    <ProductModal 
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import type { Product } from '../../types/product'
import ProductModal from '../../components/ProductModal.vue'

const toast = useToast()

// État
const products = ref<Product[]>([])
const categories = ref([
  { id: 1, name: 'Électronique' },
  { id: 2, name: 'Mode' },
  { id: 3, name: 'Maison & Jardin' }
])
const loading = ref(true)
const selectedProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

// Filtres
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Données de démonstration
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'iPhone 15 Pro',
    description: 'Le dernier smartphone Apple avec puce A17 Pro',
    price: 1229,
    salePrice: 1099,
    isOnSale: true,
    stock: { quantity: 50, reserved: 0, lowStockThreshold: 5 },
    images: [{ url: '/phone.jpg', alt: 'iPhone', isPrimary: true }],
    category: { id: '1', name: 'Électronique', slug: 'electronique' },
    slug: 'iphone-15-pro',
    status: 'active',
    isActive: true,
    rating: { average: 4.8, count: 120 },
    salesCount: 50,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    _id: '2',
    name: 'MacBook Air M3',
    description: 'Ordinateur portable ultra-fin avec puce M3',
    price: 1299,
    isOnSale: false,
    stock: { quantity: 3, reserved: 0, lowStockThreshold: 5 },
    images: [{ url: '/macbook.jpg', alt: 'MacBook', isPrimary: true }],
    category: { id: '1', name: 'Électronique', slug: 'electronique' },
    slug: 'macbook-air-m3',
    status: 'active',
    isActive: true,
    rating: { average: 4.6, count: 85 },
    salesCount: 30,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

// Produits filtrés
const filteredProducts = computed(() => {
  let filtered = products.value

  if (searchQuery.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category.id === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(product => product.status === selectedStatus.value)
  }

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

// Méthodes utilitaires
const getStockClass = (quantity: number) => {
  if (quantity === 0) return 'bg-red-100 text-red-800'
  if (quantity <= 5) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'inactive': return 'bg-red-100 text-red-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Actif'
    case 'inactive': return 'Inactif'
    case 'draft': return 'Brouillon'
    default: return status
  }
}

// Actions
const viewProduct = (product: Product) => {
  selectedProduct.value = product
}

const toggleProductStatus = async (product: Product) => {
  try {
    // Simuler l'appel API
    product.isActive = !product.isActive
    product.status = product.isActive ? 'active' : 'inactive'
    
    toast.success(`Produit ${product.isActive ? 'activé' : 'désactivé'} avec succès`)
  } catch (error) {
    toast.error('Erreur lors de la modification du statut')
  }
}

const deleteProduct = (product: Product) => {
  productToDelete.value = product
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  try {
    // Simuler l'appel API
    const index = products.value.findIndex(p => p._id === productToDelete.value!._id)
    if (index > -1) {
      products.value.splice(index, 1)
    }
    
    toast.success('Produit supprimé avec succès')
    productToDelete.value = null
  } catch (error) {
    toast.error('Erreur lors de la suppression')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

onMounted(() => {
  // Simuler le chargement des produits
  setTimeout(() => {
    products.value = mockProducts
    loading.value = false
  }, 1000)
})
</script> 