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
                  <input 
                    v-model="data.name"
                    type="text" 
                    class="form-input"
                    :class="{ 'border-red-500': errors.name }"
                    placeholder="Ex: iPhone 15 Pro"
                  >
                  <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
                </div>

                <div>
                  <label class="form-label">Slug</label>
                  <input 
                    v-model="data.slug"
                    type="text" 
                    class="form-input"
                    :class="{ 'border-red-500': errors.slug }"
                    placeholder="Ex: iphone-15-pro"
                  >
                  <p class="text-gray-500 text-sm mt-1">Généré automatiquement si vide</p>
                  <p v-if="errors.slug" class="text-red-500 text-sm mt-1">{{ errors.slug }}</p>
                </div>

                <div>
                  <label class="form-label">Description *</label>
                  <textarea 
                    v-model="data.description"
                    rows="4"
                    class="form-input"
                    :class="{ 'border-red-500': errors.description }"
                    placeholder="Description détaillée du produit..."
                  ></textarea>
                  <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
                </div>

                <div>
                  <label class="form-label">Catégorie *</label>
                  <select 
                    v-model="data.categoryId"
                    class="form-select"
                    :class="{ 'border-red-500': errors.categoryId }"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
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
                    <input 
                      v-model.number="data.price"
                      type="number" 
                      step="0.01"
                      min="0"
                      class="form-input"
                      :class="{ 'border-red-500': errors.price }"
                      placeholder="0.00"
                    >
                    <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
                  </div>

                  <div>
                    <label class="form-label">Prix promotionnel (€)</label>
                    <input 
                      v-model.number="data.salePrice"
                      type="number" 
                      step="0.01"
                      min="0"
                      class="form-input"
                      :class="{ 'border-red-500': errors.salePrice }"
                      placeholder="0.00"
                    >
                    <p v-if="errors.salePrice" class="text-red-500 text-sm mt-1">{{ errors.salePrice }}</p>
                  </div>
                </div>

                <div>
                  <label class="flex items-center">
                    <input 
                      v-model="data.isOnSale"
                      type="checkbox" 
                      class="mr-2"
                    >
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
                    <input 
                      v-model.number="data.stock.quantity"
                      type="number" 
                      min="0"
                      class="form-input"
                      :class="{ 'border-red-500': errors['stock.quantity'] }"
                      placeholder="0"
                    >
                    <p v-if="errors['stock.quantity']" class="text-red-500 text-sm mt-1">{{ errors['stock.quantity'] }}</p>
                  </div>

                  <div>
                    <label class="form-label">Seuil de stock faible</label>
                    <input 
                      v-model.number="data.stock.lowStockThreshold"
                      type="number" 
                      min="0"
                      class="form-input"
                      placeholder="5"
                    >
                    <p class="text-gray-500 text-sm mt-1">Alerte quand le stock descend sous ce seuil</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="card">
              <div class="card-header">
                <h2 class="text-xl font-semibold">Images du produit</h2>
              </div>
              <div class="card-body space-y-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    v-for="(image, index) in data.images" 
                    :key="index"
                    class="relative group"
                  >
                    <img 
                      :src="image.url" 
                      :alt="image.alt"
                      class="w-full h-24 object-cover rounded border"
                    >
                    <button 
                      @click="removeImage(index)"
                      type="button"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div v-if="image.isPrimary" class="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Principal
                    </div>
                  </div>
                  
                  <!-- Bouton d'ajout d'image -->
                  <div class="border-2 border-dashed border-gray-300 rounded flex items-center justify-center h-24 hover:border-gray-400 cursor-pointer">
                    <input 
                      type="file" 
                      @change="addImage"
                      accept="image/*"
                      class="hidden"
                      ref="imageInput"
                    >
                    <button 
                      @click="triggerImageUpload"
                      type="button"
                      class="text-gray-500 hover:text-gray-700"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
                <p class="text-gray-500 text-sm">
                  Formats acceptés: JPG, PNG, WebP. Taille max: 2MB par image.
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
                <button 
                  type="submit"
                  :disabled="isLoading"
                  class="btn btn-primary w-full"
                >
                  <span v-if="isLoading" class="flex items-center justify-center">
                    <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {{ isEditing ? 'Modification...' : 'Création...' }}
                  </span>
                  <span v-else>
                    {{ isEditing ? 'Modifier le produit' : 'Créer le produit' }}
                  </span>
                </button>

                <button 
                  @click="saveDraft"
                  type="button"
                  class="btn btn-outline w-full"
                  :disabled="isLoading"
                >
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
                    <input 
                      v-model="data.isActive"
                      type="checkbox" 
                      class="mr-2"
                    >
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useForm, commonSchemas } from '../../composables/useForm'
import { z } from 'zod'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const imageInput = ref<HTMLInputElement>()

// Catégories
const categories = ref([
  { id: 1, name: 'Électronique' },
  { id: 2, name: 'Mode' },
  { id: 3, name: 'Maison & Jardin' }
])

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
        // Simuler la modification
        console.log('Modification du produit:', formData)
        toast.success('Produit modifié avec succès')
      } else {
        // Simuler la création
        console.log('Création du produit:', formData)
        toast.success('Produit créé avec succès')
      }
      
      router.push('/admin/products')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }
})

// Actions
const saveDraft = async () => {
  data.status = 'draft'
  data.isActive = false
  await handleSubmit()
}

const addImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // Simuler l'upload d'image
    const reader = new FileReader()
    reader.onload = (e) => {
      data.images.push({
        url: e.target?.result as string,
        alt: data.name || 'Image produit',
        isPrimary: data.images.length === 0
      })
    }
    reader.readAsDataURL(file)
  }
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const removeImage = (index: number) => {
  const removedImage = data.images[index]
  data.images.splice(index, 1)
  
  // Si on supprime l'image principale, définir la première comme principale
  if (removedImage.isPrimary && data.images.length > 0) {
    data.images[0].isPrimary = true
  }
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

// Watcher pour générer le slug automatiquement
const unwatchName = () => {
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name)
  }
}

onMounted(async () => {
  if (isEditing.value) {
    // Simuler le chargement du produit existant
    const productId = route.params.id
    console.log('Chargement du produit:', productId)
    
    // Données de démonstration
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
</script> 