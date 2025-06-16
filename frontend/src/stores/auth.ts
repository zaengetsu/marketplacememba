import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, type User } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')
  const isStoreKeeper = computed(() => user.value?.role === 'ROLE_STORE_KEEPER')
  const isCompta = computed(() => user.value?.role === 'ROLE_COMPTA')

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Appel API réel vers le backend
      const response = await authAPI.login({ email, password })
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur de connexion')
      }

      if (response.data) {
        user.value = response.data.user
        token.value = response.data.token
        
        // Stockage local pour persistance
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
    } catch (error) {
      // Nettoyage en cas d'erreur
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }) => {
    isLoading.value = true
    try {
      // Appel API réel vers le backend
      const response = await authAPI.register({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        gdprConsent: userData.acceptTerms
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de l\'inscription')
      }

      // Note: Pas de connexion automatique après inscription
      // L'utilisateur doit confirmer son email avant de se connecter
      console.log('Inscription réussie:', response.message)
      
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Appel API pour déconnexion côté serveur
      await authAPI.logout()
    } catch (error) {
      console.warn('Erreur lors de la déconnexion API:', error)
    } finally {
      // Nettoyage local dans tous les cas
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser) {
      try {
        // Vérifier le token avec le backend
        const response = await authAPI.getProfile()
        
        if (response.success && response.data) {
          user.value = response.data.user
          token.value = savedToken
        } else {
          // Token invalide, nettoyer
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      } catch (error) {
        // Token invalide ou erreur réseau
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        console.warn('Échec de la vérification du token:', error)
      }
    }
  }

  // Fonction utilitaire pour récupérer les informations utilisateur
  const refreshUserProfile = async () => {
    if (!token.value) return

    try {
      const response = await authAPI.getProfile()
      if (response.success && response.data) {
        user.value = response.data.user
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération du profil:', error)
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isStoreKeeper,
    isCompta,
    login,
    register,
    logout,
    checkAuth,
    refreshUserProfile
  }
}) 