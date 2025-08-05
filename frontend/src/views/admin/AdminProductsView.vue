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
              <input v-model="searchQuery" type="text" placeholder="Rechercher un produit..." class="form-input">
            </div>
            <div>
              <select v-model="selectedCategory" class="form-select">
                <option value="">Toutes les catégories</option>
                <option v-for="category in filteredCategories" :key="category.id" :value="category.id">
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
              <tr v-for="product in paginatedProducts" :key="product._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img :src="getProductImageUrl(product)" :alt="product.name"
                        class="h-12 w-12 rounded-lg object-cover">
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
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStockClass(product.stock.quantity)">
                    {{ product.stock.quantity }} unités
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStatusClass(product.status ?? '')">
                    {{ getStatusLabel(product.status ?? '') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button @click="viewProduct(product)" class="text-blue-600 hover:text-blue-900" title="Voir">
                      👁️
                    </button>
                    <router-link :to="`/admin/products/${product._id}/edit`"
                      class="text-indigo-600 hover:text-indigo-900" title="Modifier">
                      ✏️
                    </router-link>
                    <button @click="toggleProductStatus(product)"
                      :class="product.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                      :title="product.isActive ? 'Désactiver' : 'Activer'">
                      {{ product.isActive ? '⏸️' : '▶️' }}
                    </button>
                    <button @click="deleteProduct(product)" class="text-red-600 hover:text-red-900" title="Supprimer">
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
          <button @click="currentPage--" :disabled="currentPage === 1" class="btn btn-outline"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
            Précédent
          </button>

          <span class="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>

          <button @click="currentPage++" :disabled="currentPage === totalPages" class="btn btn-outline"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
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
    <ProductModal v-if="selectedProduct" :product="selectedProduct" @close="selectedProduct = null"
      @add-to-cart="() => { }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
// import type { Product } from '../../types/product'
import type { ProductDisplay } from '../../types/product'
import ProductModal from '../../components/ProductModal.vue'
import { productService } from '@/services/api'
import { categoryService } from '@/services/api'
import { getProductImageUrl } from '../../utils/image'

const toast = useToast()

// État
const products = ref<ProductDisplay[]>([])
const categories = ref<{ id: number | string, name: string, isActive?: boolean }[]>([])
const loading = ref(true)
const selectedProduct = ref<ProductDisplay | null>(null)
const productToDelete = ref<ProductDisplay | null>(null)

// Filtres
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const filteredCategories = computed(() => {
  const usedCategoryIds = new Set(products.value.map(p => String(p.category.id)))
  return categories.value.filter(cat => {
    const isActive = cat.isActive !== false // true si undefined ou true
    return isActive && usedCategoryIds.has(String(cat.id))
  })
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Mapping pour adapter la structure backend -> front
function mapProductFromApi(apiProduct: any): ProductDisplay {
  // On force images à être un tableau de string (URL) pour compatibilité ProductModal
  let images: string[] = [];
  if (Array.isArray(apiProduct.images)) {
    if (typeof apiProduct.images[0] === 'string') {
      images = apiProduct.images;
    } else if (typeof apiProduct.images[0] === 'object' && apiProduct.images[0]?.url) {
      images = apiProduct.images.map((img: any) => img.url);
    }
  }
  return {
    ...apiProduct,
    _id: apiProduct.id?.toString() ?? '', // pour la clé du template
    images,
    price: Number(apiProduct.price) || 0,
    salePrice: apiProduct.salePrice !== undefined ? Number(apiProduct.salePrice) : undefined,
    stock: {
      quantity: apiProduct.stockQuantity ?? 0,
      reserved: apiProduct.stock?.reserved ?? 0,
      lowStockThreshold: apiProduct.stock?.lowStockThreshold ?? 5
    },
    category: apiProduct.category
      ? {
        id: apiProduct.category.id?.toString() ?? '',
        name: apiProduct.category.name ?? '',
        slug: apiProduct.category.slug ?? '',
        description: apiProduct.category.description ?? '',
        isActive: apiProduct.category.isActive ?? true,
        createdAt: apiProduct.category.createdAt ?? '',
        updatedAt: apiProduct.category.updatedAt ?? ''
      }
      : {
        id: apiProduct.categoryId?.toString() ?? '',
        name: '',
        slug: '',
        description: '',
        isActive: true,
        createdAt: '',
        updatedAt: ''
      },
    status: apiProduct.status ?? 'active',
    isActive: apiProduct.isActive ?? true,
    rating: apiProduct.rating ?? { average: 0, count: 0 },
    salesCount: apiProduct.salesCount ?? 0,
  }
}

// Chargement des catégories et produits
const loadProducts = async () => {
  loading.value = true
  try {
    const response = await productService.getProducts()
    products.value = (response.data?.products || []).map(mapProductFromApi)
  } catch (error) {
    toast.error('Erreur lors du chargement des produits')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoryService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    toast.error('Erreur lors du chargement des catégories')
  }
}

onMounted(async () => {
  await loadCategories()
  await loadProducts()
})

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
    filtered = filtered.filter(product => String(product.category.id) === String(selectedCategory.value))
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
const viewProduct = (product: ProductDisplay) => {
  selectedProduct.value = product
}

const toggleProductStatus = async (product: ProductDisplay) => {
  try {
    const newStatus = !product.isActive
    const statusValue = newStatus ? 'active' : 'inactive'
    
    // Appel API réel pour mettre à jour le produit
    const productId = product._id || product.id?.toString() || ''
    if (!productId) {
      throw new Error('ID du produit manquant')
    }
    
    await productService.updateProduct(productId, {
      isActive: newStatus,
      status: statusValue
    })
    
    // Mise à jour locale après succès de l'API
    product.isActive = newStatus
    product.status = statusValue
    
    toast.success(`Produit ${newStatus ? 'activé' : 'désactivé'} avec succès`)
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error)
    toast.error('Erreur lors de la modification du statut')
  }
}

const deleteProduct = (product: ProductDisplay) => {
  productToDelete.value = product
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  try {
    const productId = productToDelete.value._id || productToDelete.value.id?.toString() || ''
    if (!productId) {
      throw new Error('ID du produit manquant')
    }
    await productService.deleteProduct(productId)
    await loadProducts() // Recharge la liste des produits
    await loadCategories() // Recharge la liste des catégories pour éviter les catégories orphelines
    toast.success('Produit supprimé avec succès')
    productToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    toast.error('Erreur lors de la suppression')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}
</script>