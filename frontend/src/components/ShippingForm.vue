<template>
  <div class="shipping-form">
    <h3 class="text-lg font-semibold mb-4">Informations de livraison</h3>
    
    <form @submit.prevent="$emit('submit', formData)" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input 
            v-model="formData.firstName" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input 
            v-model="formData.lastName" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
        <input 
          v-model="formData.street" 
          type="text" 
          required 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
          <input 
            v-model="formData.postalCode" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
          <input 
            v-model="formData.city" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
          <select 
            v-model="formData.country" 
            required 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input 
          v-model="formData.phone" 
          type="tel" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Instructions de livraison (optionnel)</label>
        <textarea 
          v-model="formData.instructions" 
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Digicode, étage, interphone..."
        ></textarea>
      </div>

      <button type="submit" class="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500">
        Valider les informations de livraison
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

defineEmits<{
  submit: [data: any]
}>()

const formData = ref({
  firstName: '',
  lastName: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  instructions: ''
})

// Validation simple
const validateForm = () => {
  return formData.value.firstName.trim() && 
         formData.value.lastName.trim() && 
         formData.value.street.trim() && 
         formData.value.postalCode.trim() && 
         formData.value.city.trim()
}
</script>
