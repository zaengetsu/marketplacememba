<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg shadow-lg p-8 text-center max-w-sm w-full">
      <div v-if="loading">Vérification en cours...</div>
      <div v-else-if="success" class="text-green-600 text-xl font-bold mb-2">✅ Compte confirmé !</div>
      <div v-else class="text-red-600 text-xl font-bold mb-2">❌ {{ errorMsg }}</div>
      <button class="btn btn-primary mt-4" @click="close">Fermer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ token: string | null }>()
const emit = defineEmits(['close'])

const show = ref(!!props.token)
const loading = ref(true)
const success = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  if (!props.token) {
    show.value = false
    return
  }
  try {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: props.token })
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

function close() {
  show.value = false
  emit('close')
}
</script>