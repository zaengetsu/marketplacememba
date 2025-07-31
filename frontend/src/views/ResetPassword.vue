<template>
  <div class="container mx-auto py-16 text-center">
    <form v-if="!success" @submit.prevent="handleReset" class="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 class="text-xl font-bold mb-4">Réinitialiser mon mot de passe</h2>
      <input
        v-model="password"
        type="password"
        placeholder="Nouveau mot de passe"
        class="border rounded px-3 py-2 w-full mb-4"
        required
      />
      <button type="submit" class="btn btn-primary w-full">Réinitialiser</button>
      <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
    </form>
    <div v-else class="text-green-600 text-xl font-bold">
      ✅ Mot de passe modifié avec succès !<br>
      <span>Redirection vers l'accueil...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const password = ref('')
const error = ref('')
const success = ref(false)

const token = route.params.token as string

const handleReset = async () => {
  error.value = ''
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })
    const data = await res.json()
    if (data.success) {
      success.value = true
      setTimeout(() => {
        router.push('/')
      }, 2000) // Redirige après 2 secondes
    } else {
      error.value = data.error || 'Erreur lors de la réinitialisation.'
    }
  } catch {
    error.value = 'Erreur serveur.'
  }
}
</script>