<template>
  <nav class="bg-white antialiased">
    <div class="max-w-screen-xl px-4 mx-auto 2xl:px-0 py-4">
      <div class="flex items-center justify-between">
        
        <div class="flex items-center space-x-8">
          <div class="shrink-0">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">M</span>
              </div>
              <span class="text-xl font-bold text-gray-900">MambaFit</span>
            </router-link>
          </div>

          <ul class="hidden lg:flex items-center justify-start gap-6 md:gap-8 py-3 sm:justify-center">
            <li>
              <router-link to="/" class="flex text-sm font-medium text-gray-900 hover:text-orange-600">
                Accueil
              </router-link>
            </li>
            <li class="shrink-0">
              <router-link to="/products" class="flex text-sm font-medium text-gray-900 hover:text-orange-600">
                Produits
              </router-link>
            </li>
            <!-- <li class="shrink-0">
              <router-link to="/categories" class="flex text-sm font-medium text-gray-900 hover:text-orange-600">
                Catégories
              </router-link>
            </li> -->
            <!-- <li class="shrink-0">
              <router-link to="/deals" class="text-sm font-medium text-gray-900 hover:text-orange-600">
                Promotions
              </router-link>
            </li> -->
            <li class="shrink-0">
              <router-link to="/about" class="text-sm font-medium text-gray-900 hover:text-orange-600">
                À propos
              </router-link>
            </li>
          </ul>
        </div>

        <div class="flex items-center lg:space-x-2">
          
          <!-- Panier -->
          <div class="relative">
            <button 
              @click="toggleCartDropdown" 
              class="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 text-sm font-medium leading-none text-gray-900"
            >
              <span class="sr-only">Cart</span>
              <svg class="w-5 h-5 lg:me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"/>
              </svg> 
              <span class="hidden sm:flex">Mon Panier</span>
              <span v-if="cartStore.totalItems > 0" class="ml-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.totalItems }}
              </span>
              <svg class="hidden sm:flex w-4 h-4 text-gray-900 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>              
            </button>

            <!-- Dropdown panier -->
            <div v-if="showCartDropdown" class="absolute right-0 z-10 mt-2 w-80 max-w-sm space-y-4 overflow-hidden rounded-lg bg-white p-4 shadow-lg border">
              <div v-if="cartStore.items.length === 0" class="text-center py-4 text-gray-500">
                Votre panier est vide
              </div>
              <div v-else>
                <div v-for="item in cartStore.items.slice(0, 3)" :key="item.product.id" class="grid grid-cols-2 gap-4">
                  <div>
                    <router-link :to="`/products/${item.product.id}`" class="truncate text-sm font-semibold leading-none text-gray-900 hover:underline">
                      {{ item.product.name }}
                    </router-link>
                    <p class="mt-0.5 truncate text-sm font-normal text-gray-500">{{ item.product.price }}€</p>
                  </div>
                  
                  <div class="flex items-center justify-end gap-6">
                    <p class="text-sm font-normal leading-none text-gray-500">Qté: {{ item.quantity }}</p>
                    
                    <button @click="cartStore.removeItem(item.product.id.toString())" class="text-red-600 hover:text-red-700">
                      <span class="sr-only">Supprimer</span>
                      <svg class="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm7.7-3.7a1 1 0 0 0-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 1 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L13.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L12 10.6 9.7 8.3Z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <router-link to="/cart" @click="showCartDropdown = false" class="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300">
                  Voir le panier ({{ cartStore.totalPrice.toFixed(2) }}€)
                </router-link>
              </div>
            </div>
          </div>

          <!-- Compte utilisateur -->
          <div class="relative">
            <button 
              @click="toggleUserDropdown"
              class="inline-flex items-center rounded-lg justify-center p-2 hover:bg-gray-100 text-sm font-medium leading-none text-gray-900"
            >
              <svg class="w-5 h-5 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-width="2" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>              
              <span v-if="authStore.isAuthenticated">{{ authStore.user?.firstName || 'Compte' }}</span>
              <span v-else>Compte</span>
              <svg class="w-4 h-4 text-gray-900 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg> 
            </button>

            <!-- Dropdown utilisateur -->
            <div v-if="showUserDropdown" class="absolute right-0 z-10 mt-2 w-56 divide-y divide-gray-100 overflow-hidden rounded-lg bg-white shadow border">
              <ul v-if="authStore.isAuthenticated" class="p-2 text-start text-sm font-medium text-gray-900">
                <li><router-link to="/profile" @click="showUserDropdown = false" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">Mon Compte</router-link></li>
                <li><router-link to="/orders" @click="showUserDropdown = false" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">Mes Commandes</router-link></li>
                <li><router-link to="/favorites" @click="showUserDropdown = false" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">Favoris</router-link></li>
                <li v-if="authStore.user?.role === 'ROLE_ADMIN'"><router-link to="/admin" @click="showUserDropdown = false" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">Administration</router-link></li>
              </ul>
              
              <div class="p-2 text-sm font-medium text-gray-900">
                <button v-if="authStore.isAuthenticated" @click="logout" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                  Déconnexion
                </button>
                <div v-else class="space-y-1">
                  <button @click="openLoginModal" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                    Connexion
                  </button>
                  <button @click="openRegisterModal" class="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100">
                    Inscription
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu mobile -->
          <button 
            @click="toggleMobileMenu"
            class="inline-flex lg:hidden items-center justify-center hover:bg-gray-100 rounded-md p-2 text-gray-900"
          >
            <span class="sr-only">Open Menu</span>
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/>
            </svg>                
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <div v-if="showMobileMenu" class="bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 mt-4 lg:hidden">
        <ul class="text-gray-900 text-sm font-medium space-y-3">
          <li><router-link to="/" @click="showMobileMenu = false" class="hover:text-orange-600">Accueil</router-link></li>
          <li><router-link to="/products" @click="showMobileMenu = false" class="hover:text-orange-600">Produits</router-link></li>
          <li><router-link to="/categories" @click="showMobileMenu = false" class="hover:text-orange-600">Catégories</router-link></li>
          <li><router-link to="/deals" @click="showMobileMenu = false" class="hover:text-orange-600">Promotions</router-link></li>
          <li><router-link to="/about" @click="showMobileMenu = false" class="hover:text-orange-600">À propos</router-link></li>
        </ul>
      </div>
    </div>

    <!-- Modales d'authentification -->
    <AuthModal 
      v-if="showAuthModal"
      :mode="authModalMode"
      @close="closeAuthModal"
      @switch-mode="switchAuthMode"
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AuthModal from '@/components/AuthModal.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

// États des dropdowns
const showCartDropdown = ref(false)
const showUserDropdown = ref(false)
const showMobileMenu = ref(false)

// États des modales
const showAuthModal = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

// Fonctions pour les dropdowns
const toggleCartDropdown = () => {
  showCartDropdown.value = !showCartDropdown.value
  showUserDropdown.value = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  showCartDropdown.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// Fonctions pour les modales
const openLoginModal = () => {
  authModalMode.value = 'login'
  showAuthModal.value = true
  showUserDropdown.value = false
}

const openRegisterModal = () => {
  authModalMode.value = 'register'
  showAuthModal.value = true
  showUserDropdown.value = false
}

const closeAuthModal = () => {
  showAuthModal.value = false
}

const switchAuthMode = (mode: 'login' | 'register') => {
  authModalMode.value = mode
}

// Déconnexion
const logout = async () => {
  await authStore.logout()
  showUserDropdown.value = false
  router.push('/')
}

// Fermer les dropdowns en cliquant ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showCartDropdown.value = false
    showUserDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  cartStore.loadFromStorage()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 