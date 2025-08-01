<template>
  <div class="profile-view min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p class="text-gray-600">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center mb-6">
              <div
                class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {{ userInitials }}
              </div>
              <div class="ml-4">
                <h3 class="font-semibold text-gray-900">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </h3>
                <p class="text-sm text-gray-600">{{ authStore.user?.email }}</p>
              </div>
            </div>

            <nav class="space-y-2">
              <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
                'w-full text-left px-4 py-3 rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-50'
              ]">
                <span class="mr-3">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Personal Information Tab -->
            <div v-if="activeTab === 'personal'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Informations personnelles</h2>

              <form @submit="handlePersonalInfoSubmit" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input v-model="personalForm.data.firstName" type="text"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      :class="{ 'border-red-500': personalForm.errors.value.firstName }" />
                    <p v-if="personalForm.errors.value.firstName" class="text-red-500 text-sm mt-1">
                      {{ personalForm.errors.value.firstName }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input v-model="personalForm.data.lastName" type="text"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      :class="{ 'border-red-500': personalForm.errors.value.lastName }" />
                    <p v-if="personalForm.errors.value.lastName" class="text-red-500 text-sm mt-1">
                      {{ personalForm.errors.value.lastName }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input v-model="personalForm.data.email" type="email"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    :class="{ 'border-red-500': personalForm.errors.value.email }" />
                  <p v-if="personalForm.errors.value.email" class="text-red-500 text-sm mt-1">
                    {{ personalForm.errors.value.email }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input v-model="personalForm.data.phone" type="tel"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    :class="{ 'border-red-500': personalForm.errors.value.phone }" />
                  <p v-if="personalForm.errors.value.phone" class="text-red-500 text-sm mt-1">
                    {{ personalForm.errors.value.phone }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <input v-model="personalForm.data.birthDate" type="date"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>

                <div class="flex justify-end">
                  <button type="button" @click="exportMyData"
                    class="flex items-center px-5 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 font-semibold rounded-lg border border-orange-300 hover:from-orange-200 hover:to-orange-300 hover:text-orange-800 shadow-sm transition-all mr-3">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8"/></svg>
                    Exporter mes données
                  </button>
                  <button type="button" @click="deleteMyAccount"
                    class="flex items-center px-5 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-700 font-semibold rounded-lg border border-red-300 hover:from-red-200 hover:to-red-300 hover:text-red-800 shadow-sm transition-all mr-3">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Supprimer mon compte
                  </button>
                  <button type="submit" :disabled="personalForm.isLoading.value"
                    class="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm transition-all disabled:opacity-50">
                    <svg v-if="personalForm.isLoading" class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    {{ personalForm.isLoading ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Password Tab -->
            <div v-if="activeTab === 'password'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Changer le mot de passe</h2>

              <form @submit="handlePasswordSubmit" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                  <input v-model="passwordForm.data.currentPassword" type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    :class="{ 'border-red-500': passwordForm.errors.value.currentPassword }" />
                  <p v-if="passwordForm.errors.value.currentPassword" class="text-red-500 text-sm mt-1">
                    {{ passwordForm.errors.value.currentPassword }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                  <input v-model="passwordForm.data.newPassword" type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    :class="{ 'border-red-500': passwordForm.errors.value.newPassword }" />
                  <p v-if="passwordForm.errors.value.newPassword" class="text-red-500 text-sm mt-1">
                    {{ passwordForm.errors.value.newPassword }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                  <input v-model="passwordForm.data.confirmPassword" type="password"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    :class="{ 'border-red-500': passwordForm.errors.value.confirmPassword }" />
                  <p v-if="passwordForm.errors.value.confirmPassword" class="text-red-500 text-sm mt-1">
                    {{ passwordForm.errors.value.confirmPassword }}
                  </p>
                </div>

                <div class="flex justify-end">
                  <button type="submit" :disabled="passwordForm.isLoading.value"
                    class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50">
                    {{ passwordForm.isLoading ? 'Modification...' : 'Modifier le mot de passe' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Orders Tab -->
            <div v-if="activeTab === 'orders'" class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Mes commandes</h2>
                <router-link to="/orders" class="text-orange-600 hover:text-orange-700 font-medium">
                  Voir toutes les commandes →
                </router-link>
              </div>

              <div class="space-y-4">
                <div v-for="order in recentOrders" :key="order.id"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h3 class="font-medium text-gray-900">Commande #{{ order.id }}</h3>
                      <p class="text-sm text-gray-600">{{ formatDate(new Date(order.createdAt)) }}</p>
                    </div>
                    <span :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    ]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-sm text-gray-600">1 article</p>
                    <p class="font-semibold text-gray-900">{{ formatCurrency(order.total) }}</p>
                  </div>
                </div>

                <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-500">
                  Aucune commande récente
                </div>
              </div>
            </div>

            <!-- Preferences Tab -->
            <div v-if="activeTab === 'preferences'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Préférences</h2>

              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input v-model="preferences.emailNotifications" type="checkbox"
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                      <span class="ml-3 text-gray-700">Recevoir les notifications par email</span>
                    </label>
                    <label class="flex items-center">
                      <input v-model="preferences.promotionalEmails" type="checkbox"
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                      <span class="ml-3 text-gray-700">Recevoir les offres promotionnelles</span>
                    </label>
                    <label class="flex items-center">
                      <input v-model="preferences.orderUpdates" type="checkbox"
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                      <span class="ml-3 text-gray-700">Notifications de suivi de commande</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Langue et région</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                      <select v-model="preferences.language"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                      <select v-model="preferences.currency"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                        <option value="GBP">Livre (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button @click="savePreferences" :disabled="isLoadingPreferences"
                    class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50">
                    {{ isLoadingPreferences ? 'Enregistrement...' : 'Enregistrer les préférences' }}
                  </button>
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
import { useAuthStore } from '@/stores/auth'
import { useForm, commonSchemas } from '@/composables/useForm'
import { useToast } from 'vue-toastification'
import { z } from 'zod'

const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref('personal')
const isLoadingPreferences = ref(false)

const tabs = [
  { id: 'personal', label: 'Informations personnelles', icon: '👤' },
  { id: 'password', label: 'Mot de passe', icon: '🔒' },
  { id: 'orders', label: 'Mes commandes', icon: '📦' },
  { id: 'preferences', label: 'Préférences', icon: '⚙️' }
]

const userInitials = computed(() => {
  const firstName = authStore.user?.firstName || ''
  const lastName = authStore.user?.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

// Personal Information Form
const personalInfoSchema = z.object({
  firstName: commonSchemas.name,
  lastName: commonSchemas.name,
  email: commonSchemas.email,
  phone: z.string().optional(),
  birthDate: z.string().optional()
})

const personalForm = useForm({
  initialData: {
    firstName: authStore.user?.firstName || '',
    lastName: authStore.user?.lastName || '',
    email: authStore.user?.email || '',
    phone: '',
    birthDate: ''
  },
  validationSchema: personalInfoSchema,
  onSubmit: async (data) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Informations personnelles mises à jour')
        // Mettre à jour le store utilisateur sans écraser l'id et en gardant les champs obligatoires
        if (authStore.user) {
          authStore.user = {
            ...authStore.user,
            ...data,
            id: authStore.user.id,
            role: authStore.user.role ?? 'ROLE_USER',
            isActive: authStore.user.isActive ?? true,
            isEmailVerified: authStore.user.isEmailVerified ?? false
          }
        }
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour')
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour')
    }
  }
})

// Charger les infos utilisateur à l'ouverture de la page
onMounted(async () => {
  try {
    const res = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const result = await res.json()
    if (result.success && result.data) {
      personalForm.data.firstName = result.data.firstName || ''
      personalForm.data.lastName = result.data.lastName || ''
      personalForm.data.email = result.data.email || ''
      personalForm.data.phone = result.data.phone || ''
      personalForm.data.birthDate = result.data.birthDate ? result.data.birthDate.slice(0, 10) : ''
    }
  } catch (e) {}
})

// Password Form
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: commonSchemas.password,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

const passwordForm = useForm({
  initialData: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  },
  validationSchema: passwordSchema,
  onSubmit: async (data) => {
    try {
      const res = await fetch('/api/auth/renew-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}` // <-- ajoute cette ligne
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Mot de passe modifié avec succès')
        passwordForm.reset()
      } else {
        toast.error(result.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (e) {
      toast.error('Erreur serveur')
    }
  }
})

// Recent Orders (chargées depuis l'API)
import type { Order } from '@/stores/orders'
const recentOrders = ref<Order[]>([])
const loadOrders = async () => {
  try {
    const res = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const result = await res.json()
    if (result.success && Array.isArray(result.data?.orders)) {
      recentOrders.value = result.data.orders.slice(0, 3) as Order[]
    } else {
      recentOrders.value = []
    }
  } catch (e) {
    recentOrders.value = []
  }
}
onMounted(() => {
  loadOrders()
})

// Preferences
const preferences = ref({
  emailNotifications: true,
  promotionalEmails: false,
  orderUpdates: true,
  language: 'fr',
  currency: 'EUR'
})

const handlePersonalInfoSubmit = (event: Event) => {
  personalForm.handleSubmit(event)
}

const handlePasswordSubmit = (event: Event) => {
  passwordForm.handleSubmit(event)
}

const savePreferences = async () => {
  isLoadingPreferences.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Préférences sauvegardées')
  } catch (error) {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    isLoadingPreferences.value = false
  }
}
// RGPD : Exporter mes données
const exportMyData = async () => {
  try {
    const res = await fetch('/api/users/me/export', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const result = await res.json()
    if (result.success) {
      // Téléchargement JSON
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mes-donnees-mambafit.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export des données réussi !')
    } else {
      toast.error(result.message || 'Erreur lors de l’export')
    }
  } catch (e) {
    toast.error('Erreur lors de l’export')
  }
}

// RGPD : Supprimer mon compte
const deleteMyAccount = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return
  try {
    const res = await fetch('/api/users/me', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const result = await res.json()
    if (result.success) {
      toast.success('Compte supprimé. Déconnexion...')
      setTimeout(() => {
        authStore.logout()
        window.location.href = '/'
      }, 1500)
    } else {
      toast.error(result.message || 'Erreur lors de la suppression')
    }
  } catch (e) {
    toast.error('Erreur lors de la suppression')
  }
}
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'En attente',
    'processing': 'En cours',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  }
  return labels[status] || status
}

onMounted(() => {
  // Load user preferences
  const savedPreferences = localStorage.getItem('userPreferences')
  if (savedPreferences) {
    try {
      preferences.value = { ...preferences.value, ...JSON.parse(savedPreferences) }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }
})
</script>