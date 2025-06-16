<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <AppNavigation />
    
    <!-- Contenu principal -->
    <main class="flex-1">
      <RouterView />
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Modules RGPD -->
    <CookieConsent />
    <GdprModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieConsent from '@/components/rgpd/CookieConsent.vue'
import GdprModal from '@/components/rgpd/GdprModal.vue'

// Initialisation des stores
const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(async () => {
  // Vérifier l'authentification au démarrage
  await authStore.checkAuth()
  
  // Charger le panier depuis le localStorage
  cartStore.loadFromStorage()
  
  // Nettoyer les réservations expirées
  cartStore.cleanExpiredReservations()
})
</script>

<style>
/* Styles globaux déjà définis dans style.css */
</style> 