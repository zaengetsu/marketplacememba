<template>
  <div v-if="showConsent" class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
      <div class="mb-4 md:mb-0">
        <p class="text-sm">
          Nous utilisons des cookies pour améliorer votre expérience. 
          En continuant, vous acceptez notre politique de cookies.
        </p>
      </div>
      <div class="flex space-x-3">
        <button @click="acceptAll" class="btn btn-primary btn-sm">
          Accepter tout
        </button>
        <button @click="acceptNecessary" class="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-gray-900">
          Nécessaires uniquement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showConsent = ref(false)

const acceptAll = () => {
  localStorage.setItem('cookieConsent', JSON.stringify({
    necessary: true,
    analytics: true,
    marketing: true,
    date: new Date().toISOString()
  }))
  showConsent.value = false
}

const acceptNecessary = () => {
  localStorage.setItem('cookieConsent', JSON.stringify({
    necessary: true,
    analytics: false,
    marketing: false,
    date: new Date().toISOString()
  }))
  showConsent.value = false
}

onMounted(() => {
  const consent = localStorage.getItem('cookieConsent')
  if (!consent) {
    showConsent.value = true
  }
})
</script> 