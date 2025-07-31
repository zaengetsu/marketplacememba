
<template>
  <div class="container mx-auto max-w-2xl py-12 px-4">
    <h1 class="text-3xl font-bold mb-6">Contact</h1>
    <p class="mb-4">Une question ? Besoin d'aide ? Remplissez le formulaire ci-dessous ou contactez-nous à <a href="mailto:iouahabi1@myges.fr" class="text-orange-600 underline">iouahabi1@myges.fr</a>.</p>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block mb-1 font-medium">Nom</label>
        <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" placeholder="Votre nom" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Email</label>
        <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2" placeholder="Votre email" required />
      </div>
      <div>
        <label class="block mb-1 font-medium">Message</label>
        <textarea v-model="form.message" class="w-full border rounded px-3 py-2" rows="4" placeholder="Votre message" required></textarea>
      </div>
      <button type="submit" :disabled="loading" class="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-60">
        {{ loading ? 'Envoi en cours...' : 'Envoyer' }}
      </button>
      <p v-if="success" class="text-green-600 mt-2">Votre message a bien été envoyé !</p>
      <p v-if="error" class="text-red-600 mt-2">Une erreur est survenue. Veuillez réessayer.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  message: ''
})
const loading = ref(false)
const success = ref(false)
const error = ref(false)

const handleSubmit = async () => {
  loading.value = true
  success.value = false
  error.value = false
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (res.ok) {
      success.value = true
      form.value = { name: '', email: '', message: '' }
    } else {
      error.value = true
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>
