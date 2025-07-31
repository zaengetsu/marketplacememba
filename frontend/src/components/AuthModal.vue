<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              {{ showForgot ? 'Mot de passe oublié' : mode === 'login' ? 'Connexion' : 'Inscription' }}
            </h3>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Forgot Password -->
          <form v-if="mode === 'login' && showForgot" @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <label for="forgotEmail" class="block text-sm font-medium text-gray-700">Votre email</label>
              <input v-model="forgotEmail" type="email" id="forgotEmail" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': forgotError }" />
              <p v-if="forgotError" class="mt-1 text-sm text-red-600">{{ forgotError }}</p>
            </div>

            <div v-if="forgotSuccess" class="text-green-600 text-sm">{{ forgotSuccess }}</div>

            <div class="flex items-center justify-between">
              <button type="button" @click="showForgot = false" class="text-sm text-gray-600 hover:underline">Retour</button>
              <button type="submit"
                      class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                      :disabled="isLoading">
                {{ isLoading ? 'Envoi...' : 'Réinitialiser' }}
              </button>
            </div>
          </form>

          <!-- Login Form -->
          <form v-else-if="mode === 'login'" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="loginData.email" type="email" id="email" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': loginErrors.email }" />
              <p v-if="loginErrors.email" class="mt-1 text-sm text-red-600">{{ loginErrors.email }}</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input v-model="loginData.password" type="password" id="password" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': loginErrors.password }" />
              <p v-if="loginErrors.password" class="mt-1 text-sm text-red-600">{{ loginErrors.password }}</p>
            </div>

            <div v-if="loginError" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ loginError }}</p>
            </div>

            <div class="flex items-center justify-between">
              <button @click="$emit('switch-mode', 'register')" type="button" class="text-sm text-orange-600 hover:text-orange-500">
                Pas encore de compte ?
              </button>
              <button type="submit" :disabled="isLoading"
                      class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50">
                {{ isLoading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>

            <div class="text-right">
              <button type="button" class="text-sm text-orange-600 hover:underline" @click="showForgot = true">
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
                <input v-model="registerData.firstName" type="text" id="firstName" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                       :class="{ 'border-red-500': registerErrors.firstName }" />
                <p v-if="registerErrors.firstName" class="mt-1 text-sm text-red-600">{{ registerErrors.firstName }}</p>
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
                <input v-model="registerData.lastName" type="text" id="lastName" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                       :class="{ 'border-red-500': registerErrors.lastName }" />
                <p v-if="registerErrors.lastName" class="mt-1 text-sm text-red-600">{{ registerErrors.lastName }}</p>
              </div>
            </div>

            <div>
              <label for="registerEmail" class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="registerData.email" type="email" id="registerEmail" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': registerErrors.email }" />
              <p v-if="registerErrors.email" class="mt-1 text-sm text-red-600">{{ registerErrors.email }}</p>
            </div>

            <div>
              <label for="registerPassword" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input v-model="registerData.password" type="password" id="registerPassword" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': registerErrors.password }" />
              <p v-if="registerErrors.password" class="mt-1 text-sm text-red-600">{{ registerErrors.password }}</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input v-model="registerData.confirmPassword" type="password" id="confirmPassword" required
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                     :class="{ 'border-red-500': registerErrors.confirmPassword }" />
              <p v-if="registerErrors.confirmPassword" class="mt-1 text-sm text-red-600">{{ registerErrors.confirmPassword }}</p>
            </div>

            <div class="flex items-center">
              <input v-model="registerData.acceptTerms" type="checkbox" id="acceptTerms"
                     class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
              <label for="acceptTerms" class="ml-2 block text-sm text-gray-900">
                J'accepte la <a href="/privacy-policy" target="_blank" class="text-orange-600 hover:text-orange-500 underline">politique de confidentialité</a> et les <a href="#" class="text-orange-600 hover:text-orange-500 underline">conditions d'utilisation</a>
              </label>
            </div>
            <p v-if="registerErrors.acceptTerms" class="text-sm text-red-600">{{ registerErrors.acceptTerms }}</p>

            <div v-if="registerError" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ registerError }}</p>
            </div>

            <div class="flex items-center justify-between">
              <button @click="$emit('switch-mode', 'login')" type="button" class="text-sm text-orange-600 hover:text-orange-500">
                Déjà un compte ?
              </button>
              <button type="submit" :disabled="isLoading"
                      class="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50">
                {{ isLoading ? 'Inscription...' : "S'inscrire" }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useRouter, useRoute } from 'vue-router'

interface Props {
  mode: 'login' | 'register'
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  'switch-mode': [mode: 'login' | 'register']
}>()

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const loginError = ref('')
const registerError = ref('')
const showForgot = ref(false)
const forgotEmail = ref('')
const forgotError = ref('')
const forgotSuccess = ref('')

const loginData = reactive({ email: '', password: '' })
const registerData = reactive({
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptTerms: false
})

const loginErrors = reactive({ email: '', password: '' })
const registerErrors = reactive({
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptTerms: ''
})

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePassword = (password: string) => password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)

const validateLogin = () => {
  loginErrors.email = ''
  loginErrors.password = ''
  if (!loginData.email) loginErrors.email = 'Email requis'
  else if (!validateEmail(loginData.email)) loginErrors.email = 'Email invalide'
  if (!loginData.password) loginErrors.password = 'Mot de passe requis'
  return !loginErrors.email && !loginErrors.password
}

const validateRegister = () => {
  registerErrors.firstName = ''
  registerErrors.lastName = ''
  registerErrors.email = ''
  registerErrors.password = ''
  registerErrors.confirmPassword = ''
  registerErrors.acceptTerms = ''
  if (!registerData.firstName || registerData.firstName.length < 2) registerErrors.firstName = 'Prénom requis (min. 2 caractères)'
  if (!registerData.lastName || registerData.lastName.length < 2) registerErrors.lastName = 'Nom requis (min. 2 caractères)'
  if (!registerData.email) registerErrors.email = 'Email requis'
  else if (!validateEmail(registerData.email)) registerErrors.email = 'Email invalide'
  if (!registerData.password) registerErrors.password = 'Mot de passe requis'
  else if (!validatePassword(registerData.password)) registerErrors.password = 'Mot de passe trop faible'
  if (registerData.password !== registerData.confirmPassword) registerErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
  if (!registerData.acceptTerms) registerErrors.acceptTerms = 'Vous devez accepter les conditions'
  return !Object.values(registerErrors).some(error => error)
}

const handleLogin = async () => {
  if (!validateLogin()) return
  isLoading.value = true
  loginError.value = ''
  try {
    await authStore.login(loginData.email, loginData.password)
    toast.success('Connexion réussie !')
    emit('close')
    router.push(authStore.isAdmin ? '/admin' : (route.query.from as string || '/profile'))
  } catch (error: any) {
    loginError.value = error.message || 'Erreur de connexion'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!validateRegister()) return
  isLoading.value = true
  registerError.value = ''
  try {
    await authStore.register(registerData)
    toast.success('Inscription réussie ! Vérifiez votre email.')
    emit('close')
  } catch (error: any) {
    registerError.value = error.message || 'Erreur lors de l’inscription'
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  forgotError.value = ''
  forgotSuccess.value = ''
  isLoading.value = true
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur')
    forgotSuccess.value = 'Lien envoyé si l’email existe.'
    forgotEmail.value = ''
  } catch (error: any) {
    forgotError.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
