<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Créer un nouvel utilisateur</h1>
    <form class="max-w-lg space-y-4" @submit.prevent="handleSubmit">
      <input v-model="firstName" class="input input-bordered w-full" placeholder="Prénom" required />
      <input v-model="lastName" class="input input-bordered w-full" placeholder="Nom" required />
      <input v-model="email" class="input input-bordered w-full" placeholder="Email" type="email" required />
      <input v-model="password" class="input input-bordered w-full" placeholder="Mot de passe" type="password" required />
      <select v-model="role" class="input input-bordered w-full" required>
        <option value="ROLE_USER">ROLE_USER</option>
        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
        <option value="ROLE_STORE_KEEPER">ROLE_STORE_KEEPER</option>
        <option value="ROLE_COMPTA">ROLE_COMPTA</option>
      </select>
      <button class="btn btn-primary" type="submit">
        Créer
      </button>
      <div v-if="message" class="mt-2 text-green-600">{{ message }}</div>
      <div v-if="error" class="mt-2 text-red-600">{{ error }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/services/api'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const role = ref('ROLE_USER')
const message = ref('')
const error = ref('')

const handleSubmit = async () => {
  message.value = ''
  error.value = ''
  try {
    const response = await apiClient.post('/admin/users', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
    if (response.data.success) {
      message.value = 'Utilisateur créé avec succès !'
      // Optionnel : reset le formulaire
      firstName.value = ''
      lastName.value = ''
      email.value = ''
      password.value = ''
      role.value = 'ROLE_USER'
    } else {
      error.value = response.data.message || 'Erreur lors de la création'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création'
  }
}
</script>