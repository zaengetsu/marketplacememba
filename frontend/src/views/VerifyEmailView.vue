<!-- filepath: frontend/src/views/VerifyEmailView.vue -->
<template>
  <div class="container mx-auto py-16 text-center">
    <div v-if="loading">Vérification en cours...</div>
    <div v-else-if="success" class="text-green-600 text-xl font-bold">✅ Compte confirmé !</div>
    <div v-else class="text-red-600 text-xl font-bold">❌ {{ errorMsg }}</div>
    <router-link to="/" class="btn btn-primary mt-6">Retour à l'accueil</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    loading.value = false
    errorMsg.value = 'Lien de confirmation invalide.'
    return
  }
  try {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    const data = await res.json()
    loading.value = false
    if (data.success) {
      success.value = true
    } else {
      errorMsg.value = data.error || 'Erreur lors de la confirmation.'
    }
  } catch {
    loading.value = false
    errorMsg.value = 'Erreur serveur.'
  }
})
</script>