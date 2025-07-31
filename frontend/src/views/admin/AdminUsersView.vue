<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
    <table class="min-w-full bg-white mt-6">
      <thead>
        <tr>
          <th class="py-2 px-4 border-b">ID</th>
          <th class="py-2 px-4 border-b">Nom</th>
          <th class="py-2 px-4 border-b">Email</th>
          <th class="py-2 px-4 border-b">Rôle</th>
          <th class="py-2 px-4 border-b">Statut</th>
          <th class="py-2 px-4 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="py-2 px-4 border-b">{{ user.id }}</td>
          <td class="py-2 px-4 border-b">{{ user.firstName }} {{ user.lastName }}</td>
          <td class="py-2 px-4 border-b">{{ user.email }}</td>
          <td class="py-2 px-4 border-b">{{ user.role }}</td>
          <td class="py-2 px-4 border-b">
            <span :class="user.isActive ? 'text-green-600' : 'text-red-600'">
              {{ user.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td class="py-2 px-4 border-b">
            <!-- Actions à développer -->
            <button class="btn btn-xs btn-outline">✏️</button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td class="py-2 px-4 border-b" colspan="6" align="center">Aucun utilisateur</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'

const users = ref<any[]>([])

const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users')
    if (response.data.success) {
      users.value = response.data.data.users
    }
  } catch (e) {
    users.value = []
  }
}

onMounted(fetchUsers)
</script>