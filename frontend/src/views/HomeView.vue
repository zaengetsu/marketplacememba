<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-4">Bienvenue chez MambaFit</h1>
        <p class="text-xl mb-8">Votre partenaire pour une vie sportive épanouie</p>
        <router-link to="/products" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Découvrir nos produits
        </router-link>
      </div>
    </section>

    <!-- Products Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Nos Produits Phares</h2>
        
        <div v-if="loading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2">Chargement des produits...</p>
        </div>

        <div v-else-if="error" class="text-center text-red-600">
          <p>{{ error }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="product in products" :key="product.id" class="card hover:shadow-lg transition-shadow">
            <div class="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name"
                class="w-full h-48 object-cover"
              >
            </div>
            <div class="card-body">
              <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span v-if="product.isOnSale" class="text-red-500 font-bold">
                    {{ product.salePrice }}€
                  </span>
                  <span :class="product.isOnSale ? 'line-through text-gray-400' : 'font-bold text-gray-900'">
                    {{ product.price }}€
                  </span>
                </div>
                <button 
                  @click="addToCart(product)"
                  :disabled="!product.stockQuantity"
                  class="btn btn-primary btn-sm"
                  :class="{ 'opacity-50 cursor-not-allowed': !product.stockQuantity }"
                >
                  {{ product.stockQuantity ? 'Ajouter' : 'Rupture' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Voir plus -->
        <div class="text-center mt-12">
          <router-link to="/products" class="btn btn-outline">
            Voir tous nos produits
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { productService } from '@/services/api'
import { useToast } from 'vue-toastification'
import type { Product } from '@/types/product'

const cartStore = useCartStore()
const toast = useToast()
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Mapping des images par catégorie
const categoryImages: Record<string, string> = {
  'chaussures': '/images/categories/chaussures.jpg',
  'musculation': '/images/categories/musculation.jpg',
  'yoga-pilates': '/images/categories/yoga.jpg',
  'electronique-sport': '/images/categories/electronique.jpg',
  'accessoires': '/images/categories/accessoires.jpg',
  'nutrition': '/images/categories/nutrition.jpg',
  'cardio': '/images/categories/cardio.jpg',
  'sports-combat': '/images/categories/combat.jpg'
}

const getProductImage = (product: Product) => {
  if (product.category?.slug) {
    return categoryImages[product.category.slug] || '/placeholder.jpg'
  }
  return '/placeholder.jpg'
}

const addToCart = async (product: Product) => {
  try {
    // Convertir le produit au format attendu par le cart store
    const cartProduct = {
      ...product,
      _id: product.id.toString(),
      stock: {
        quantity: product.stockQuantity,
        reserved: 0,
        lowStockThreshold: 5
      },
      images: [{ url: getProductImage(product), alt: product.name, isPrimary: true }]
    }
    
    await cartStore.addItem(cartProduct as any, 1)
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    toast.error('Erreur lors de l\'ajout au panier')
  }
}

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Charger les produits phares (en promotion ou les plus populaires)
    const response = await productService.getProducts({
      limit: 8,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    if (response.success && response.data && response.data.products) {
      products.value = response.data.products
    } else {
      error.value = 'Erreur lors du chargement des produits'
    }
  } catch (err) {
    console.error('Erreur lors du chargement des produits:', err)
    error.value = 'Erreur lors du chargement des produits'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script> 