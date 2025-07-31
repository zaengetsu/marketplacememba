<!-- src/views/ForgotPassword.vue -->
<template>
  <div class="forgot-password">
    <h1>Mot de passe oublié</h1>
    <form @submit.prevent="submit">
      <input v-model="email" type="email" placeholder="Email" required />
      <button type="submit">Envoyer le lien</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const message = ref('');
const error = ref('');
const auth = useAuthStore();

const submit = async () => {
  message.value = '';
  error.value = '';
  try {
    const res = await auth.forgotPassword(email.value);
    message.value = res.message ?? '';
  } catch (err: any) {
    error.value = err.message || 'Erreur';
  }
};
</script>

<style scoped>
.forgot-password {
  max-width: 400px;
  margin: auto;
}
.error {
  color: red;
}
</style>
