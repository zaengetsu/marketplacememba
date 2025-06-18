<!-- src/views/ResetPassword.vue -->
<template>
  <div class="reset-password">
    <h1>Réinitialiser le mot de passe</h1>
    <form @submit.prevent="submit">
      <input v-model="password" type="password" placeholder="Nouveau mot de passe" required />
      <button type="submit">Changer le mot de passe</button>
    </form>
    <p v-if="message">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const password = ref('');
const message = ref('');
const error = ref('');

const token = route.params.token as string;
const auth = useAuthStore();

const submit = async () => {
  message.value = '';
  error.value = '';
  try {
    const res = await auth.resetPassword(token, password.value);
    message.value = res.message;
    setTimeout(() => router.push('/login'), 2000);
  } catch (err: any) {
    error.value = err.message || 'Erreur';
  }
};
</script>

<style scoped>
.reset-password {
  max-width: 400px;
  margin: auto;
}
.error {
  color: red;
}
</style>
