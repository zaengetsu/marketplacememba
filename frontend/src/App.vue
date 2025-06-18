<template>
  <!-- <AccountConfirmPopup v-if="showPopup && token" :token="token" @close="handleClose" /> -->
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
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, /*useRouter*/ } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieConsent from '@/components/rgpd/CookieConsent.vue'
import GdprModal from '@/components/rgpd/GdprModal.vue'
// import AccountConfirmPopup from '@/components/ui/AccountConfirmPopup.vue'

// Initialisation des stores
const authStore = useAuthStore()
const cartStore = useCartStore()

// Ajout pour le popup de confirmation de compte
const route = useRoute()
// const router = useRouter()
const token = computed(() => route.query.token as string | null)
const showPopup = ref(!!token.value)

// Ajoute ce watcher :
watch(
  () => route.query.token,
  (newToken) => {
    showPopup.value = !!newToken
  }
)

// function handleClose() {
//   showPopup.value = false
//   // Optionnel : retire le token de l'URL
//   router.replace({ query: { ...route.query, token: undefined } })
// }

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