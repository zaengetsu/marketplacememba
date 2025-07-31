<template>
  <div class="admin-product-form">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center mb-8">
        <router-link to="/admin/products" class="mr-4 text-gray-600 hover:text-gray-900">
          ← Retour
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditing ? 'Modifier le produit' : 'Nouveau produit' }}
        </h1>
      </div>

      <form @submit="handleSubmit" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Informations principales -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Informations de base -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Informations de base</h2>
              </div>
              <div class="card-body space-y-4">
                <div>
                  <label class="form-label">Nom du produit *</label>
                  <input v-model="data.name" type="text" class="form-input" :class="{ 'border-red-500': errors.name }"
                    placeholder="Ex: iPhone 15 Pro">
                  <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
                </div>

                <div>
                  <label class="form-label">Slug</label>
                  <input v-model="data.slug" type="text" class="form-input" :class="{ 'border-red-500': errors.slug }"
                    placeholder="Ex: iphone-15-pro">
                  <p class="text-gray-500 text-sm mt-1">Généré automatiquement si vide</p>
                  <p v-if="errors.slug" class="text-red-500 text-sm mt-1">{{ errors.slug }}</p>
                </div>

                <div>
                  <label class="form-label">Description *</label>
                  <textarea v-model="data.description" rows="4" class="form-input"
                    :class="{ 'border-red-500': errors.description }"
                    placeholder="Description détaillée du produit..."></textarea>
                  <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
                </div>

                <div>
                  <label class="form-label">Catégorie *</label>
                  <select v-model="data.categoryId" class="form-select"
                    :class="{ 'border-red-500': errors.categoryId }">
                    <option value="">Sélectionner une catégorie</option>
                    <option v-for="category in categories" :key="category.id" :value="String(category.id)">
                      {{ category.name }}
                    </option>
                  </select>
                  <p v-if="errors.categoryId" class="text-red-500 text-sm mt-1">{{ errors.categoryId }}</p>
                </div>
              </div>
            </div>

            <!-- Prix et promotions -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Prix et promotions</h2>
              </div>
              <div class="card-body space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Prix de base (€) *</label>
                    <input v-model.number="data.price" type="number" step="0.01" min="0" class="form-input"
                      :class="{ 'border-red-500': errors.price }" placeholder="0.00">
                    <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
                  </div>

                  <div>
                    <label class="form-label">Prix promotionnel (€)</label>
                    <input v-model.number="data.salePrice" type="number" step="0.01" min="0" class="form-input"
                      :class="{ 'border-red-500': errors.salePrice }" placeholder="0.00">
                    <p v-if="errors.salePrice" class="text-red-500 text-sm mt-1">{{ errors.salePrice }}</p>
                  </div>
                </div>

                <div>
                  <label class="flex items-center">
                    <input v-model="data.isOnSale" type="checkbox" class="mr-2">
                    <span>Produit en promotion</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Stock -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Gestion du stock</h2>
              </div>
              <div class="card-body space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Quantité en stock *</label>
                    <input v-model.number="data.stock.quantity" type="number" min="0" class="form-input"
                      :class="{ 'border-red-500': errors['stock.quantity'] }" placeholder="0">
                    <p v-if="errors['stock.quantity']" class="text-red-500 text-sm mt-1">{{ errors['stock.quantity'] }}
                    </p>
                  </div>

                  <div>
                    <label class="form-label">Seuil de stock faible</label>
                    <input v-model.number="data.stock.lowStockThreshold" type="number" min="0" class="form-input"
                      placeholder="5">
                    <p class="text-gray-500 text-sm mt-1">Alerte quand le stock descend sous ce seuil</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <!-- Images -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Images du produit</h2>
              </div>
              <div class="card-body space-y-4">
                <!-- Zone d'upload -->
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <input ref="fileInput" type="file" multiple accept="image/*" @change="handleFileUpload"
                    class="hidden" />
                  <button type="button" @click="triggerImageUpload"
                    class="w-full flex flex-col items-center justify-center py-4 text-gray-600 hover:text-blue-600 transition-colors">
                    <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                      </path>
                    </svg>
                    <span class="text-lg font-medium">Cliquez pour ajouter des images</span>
                    <span class="text-sm text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB (max 5 images)</span>
                  </button>
                </div>

                <!-- Prévisualisation des images -->
                <div v-if="imageFiles.length > 0" class="mt-6">
                  <h3 class="text-sm font-medium text-gray-700 mb-3">Images sélectionnées ({{ imageFiles.length }}/5)
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="(file, index) in imageFiles" :key="index" class="relative group">
                      <img :src="file.preview" :alt="`Preview ${index + 1}`"
                        class="w-full h-24 object-cover rounded border shadow-sm">
                      <button type="button" @click="removeImage(index)"
                        class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <p class="text-gray-500 text-sm">
                  Formats acceptés: JPG, PNG, WebP. Taille max: 5MB par image.
                </p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Actions -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Actions</h2>
              </div>
              <div class="card-body space-y-3">
                <button type="submit" :disabled="isLoading" class="btn btn-primary w-full">
                  <span v-if="isLoading" class="flex items-center justify-center">
                    <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin">
                    </div>
                    {{ isEditing ? 'Modification...' : 'Création...' }}
                  </span>
                  <span v-else>
                    {{ isEditing ? 'Modifier le produit' : 'Créer le produit' }}
                  </span>
                </button>

                <button @click="saveDraft" type="button" class="btn btn-outline w-full" :disabled="isLoading">
                  Sauvegarder en brouillon
                </button>

                <router-link to="/admin/products" class="btn btn-outline w-full block text-center">
                  Annuler
                </router-link>
              </div>
            </div>

            <!-- Statut -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Statut</h2>
              </div>
              <div class="card-body space-y-3">
                <div>
                  <label class="form-label">Statut du produit</label>
                  <select v-model="data.status" class="form-select">
                    <option value="draft">Brouillon</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                <div>
                  <label class="flex items-center">
                    <input v-model="data.isActive" type="checkbox" class="mr-2">
                    <span>Produit visible sur le site</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Aperçu des prix -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Aperçu des prix</h2>
              </div>
              <div class="card-body">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Prix de base:</span>
                    <span class="font-medium">{{ data.price || 0 }}€</span>
                  </div>
                  <div v-if="data.isOnSale && data.salePrice" class="flex justify-between text-red-600">
                    <span>Prix promotionnel:</span>
                    <span class="font-medium">{{ data.salePrice }}€</span>
                  </div>
                  <div v-if="data.isOnSale && data.salePrice" class="flex justify-between text-green-600 text-sm">
                    <span>Économie:</span>
                    <span class="font-medium">{{ (data.price - data.salePrice).toFixed(2) }}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useForm, commonSchemas } from '../../composables/useForm'
import { z } from 'zod'
import { productService } from '@/services/api'
import { categoryService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'


const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const isEditing = computed(() => !!route.params.id)
const fileInput = ref<HTMLInputElement>()
const imageFiles = ref<Array<{ file: File, preview: string }>>([])

// Catégories
const categories = ref<{ id: number | string, name: string }[]>([])

// Schéma de validation
const productSchema = z.object({
  name: commonSchemas.required.min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().optional(),
  description: commonSchemas.required.min(10, 'La description doit contenir au moins 10 caractères'),
  categoryId: commonSchemas.required,
  price: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
  salePrice: z.number().optional(),
  isOnSale: z.boolean(),
  stock: z.object({
    quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
    lowStockThreshold: z.number().min(0).optional()
  }),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    isPrimary: z.boolean()
  })),
  status: z.enum(['draft', 'active', 'inactive']),
  isActive: z.boolean()
})

// Données initiales
const initialData = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  price: 0,
  salePrice: 0,
  isOnSale: false,
  stock: {
    quantity: 0,
    lowStockThreshold: 5
  },
  images: [],
  status: 'draft' as const,
  isActive: false
}

// Formulaire
const { data, errors, isLoading, handleSubmit } = useForm({
  initialData,
  validationSchema: productSchema,
  onSubmit: async (formData) => {
    try {
      if (isEditing.value) {
        // Mode édition - utiliser PUT classique
        const payload = {
          ...formData,
          categoryId: Number(formData.categoryId),
          stockQuantity: formData.stock.quantity,
          images: formData.images,
        }
        await productService.updateProduct(route.params.id as string, payload)
        toast.success('Produit modifié avec succès')
      } else {
        // Mode création - utiliser FormData pour l'upload
        const formDataToSend = new FormData()

        // Ajouter les données du produit
        formDataToSend.append('name', formData.name)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('categoryId', String(formData.categoryId))
        formDataToSend.append('price', String(formData.price))
        if (formData.salePrice) formDataToSend.append('salePrice', String(formData.salePrice))
        formDataToSend.append('isOnSale', String(formData.isOnSale))
        formDataToSend.append('stockQuantity', String(formData.stock.quantity))
        formDataToSend.append('status', formData.status)
        formDataToSend.append('isActive', String(formData.isActive))

        // Ajouter les images
        imageFiles.value.forEach(({ file }) => {
          formDataToSend.append('images', file)
        })

        // Appel direct à l'API pour gérer FormData
        // const token = localStorage.getItem('token')
        const token = authStore.token
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {  // ← URL complète
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Erreur lors de la création')
        }

        toast.success('Produit créé avec succès')
      }
      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }
})

// Fonctions pour les images
const handleFileUpload = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])

  // Limiter à 5 images max
  const remainingSlots = 5 - imageFiles.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    if (file.type.startsWith('image/')) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`L'image ${file.name} est trop volumineuse (max 5MB)`)
        return
      }

      const preview = URL.createObjectURL(file)
      imageFiles.value.push({ file, preview })
    } else {
      toast.error(`${file.name} n'est pas une image valide`)
    }
  })

  if (files.length > remainingSlots) {
    toast.warning(`Seulement ${remainingSlots} images peuvent être ajoutées (max 5 total)`)
  }

  // Reset input
  ; (event.target as HTMLInputElement).value = ''
}

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imageFiles.value[index].preview)
  imageFiles.value.splice(index, 1)
}

// Actions
const saveDraft = async () => {
  data.status = 'draft'
  data.isActive = false
  await handleSubmit()
}

// Génération automatique du slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Chargement des données
onMounted(async () => {
  // Charger les catégories
  const response = await categoryService.getCategories()
  if (response.success && response.data) {
    categories.value = response.data
  }

  // Charger le produit en mode édition
  if (isEditing.value) {
    const productId = route.params.id
    console.log('Chargement du produit:', productId)
    // Pour le moment, données simulées
    Object.assign(data, {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Le dernier smartphone Apple avec puce A17 Pro, appareil photo professionnel et écran Super Retina XDR',
      categoryId: '1',
      price: 1229,
      salePrice: 1099,
      isOnSale: true,
      stock: {
        quantity: 50,
        lowStockThreshold: 5
      },
      images: [
        { url: '/phone.jpg', alt: 'iPhone 15 Pro', isPrimary: true }
      ],
      status: 'active' as const,
      isActive: true
    })
  }
})

// Nettoyer les URLs des previews au démontage
onUnmounted(() => {
  imageFiles.value.forEach(({ preview }) => {
    URL.revokeObjectURL(preview)
  })
})
</script>