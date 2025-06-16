import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useToast } from 'vue-toastification'

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Instance Axios avec configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies de session
})

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Redirection vers login si nécessaire
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    // Gestion des erreurs de limite de taux
    if (error.response?.status === 429) {
      console.warn('Trop de requêtes, veuillez patienter...')
    }

    return Promise.reject(error)
  }
)

// Types pour l'authentification
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  gdprConsent: boolean
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'ROLE_USER' | 'ROLE_STORE_KEEPER' | 'ROLE_COMPTA' | 'ROLE_ADMIN'
  isActive: boolean
  isEmailVerified: boolean
  lastLoginAt?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    token: string
  }
  error?: string
  details?: any[]
}

// API d'authentification
export const authAPI = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur de connexion au serveur')
    }
  },

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        gdprConsent: userData.gdprConsent.toString()
      })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur lors de l\'inscription')
    }
  },

  // Profil utilisateur
  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>('/auth/me')
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur lors de la récupération du profil')
    }
  },

  // Déconnexion
  async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/logout')
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur lors de la déconnexion')
    }
  },

  // Mot de passe oublié
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur lors de l\'envoi du lien de réinitialisation')
    }
  },

  // Réinitialisation mot de passe
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      throw new Error('Erreur lors de la réinitialisation')
    }
  }
}

// API générale (pour les autres entités)
export const api = {
  // Produits
  products: {
    getAll: (params?: any) => apiClient.get('/products', { params }),
    getById: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post('/products', data),
    update: (id: string, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`)
  },

  // Catégories
  categories: {
    getAll: () => apiClient.get('/categories'),
    getById: (id: string) => apiClient.get(`/categories/${id}`),
    create: (data: any) => apiClient.post('/categories', data),
    update: (id: string, data: any) => apiClient.put(`/categories/${id}`, data),
    delete: (id: string) => apiClient.delete(`/categories/${id}`)
  },

  // Panier
  cart: {
    get: () => apiClient.get('/cart'),
    add: (productId: string, quantity: number) => 
      apiClient.post('/cart/add', { productId, quantity }),
    update: (productId: string, quantity: number) => 
      apiClient.put('/cart/update', { productId, quantity }),
    remove: (productId: string) => apiClient.delete(`/cart/remove/${productId}`),
    clear: () => apiClient.delete('/cart/clear')
  },

  // Commandes
  orders: {
    getAll: (params?: any) => apiClient.get('/orders', { params }),
    getById: (id: string) => apiClient.get(`/orders/${id}`),
    create: (data: any) => apiClient.post('/orders', data),
    updateStatus: (id: string, status: string) => 
      apiClient.patch(`/orders/${id}/status`, { status })
  },

  // Factures
  invoices: {
    getAll: (params?: any) => apiClient.get('/invoices', { params }),
    getById: (id: string) => apiClient.get(`/invoices/${id}`),
    updateStatus: (id: string, status: string) => 
      apiClient.patch(`/invoices/${id}/status`, { status })
  },

  // Paiements
  payments: {
    createIntent: (data: { amount: number; currency: string; orderId: number }) => 
      apiClient.post('/payments/create-intent', data),
    confirm: (data: { paymentIntentId: string; orderId?: number }) => 
      apiClient.post('/payments/confirm', data),
    getHistory: () => apiClient.get('/payments/history')
  }
}

// Services simplifiés pour la compatibilité avec les vues existantes
export const productService = {
  getProducts: async (params?: any) => {
    try {
      const response = await api.products.getAll(params)
      return response.data // Retourner directement la structure du backend
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des produits')
    }
  },
  getProduct: async (id: string) => {
    try {
      const response = await api.products.getById(id)
      return response.data // Retourner directement la structure du backend
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du produit')
    }
  },
  createProduct: (data: any) => api.products.create(data),
  updateProduct: (id: string, data: any) => api.products.update(id, data),
  deleteProduct: (id: string) => api.products.delete(id)
}

export const categoryService = {
  getCategories: async () => {
    try {
      const response = await api.categories.getAll()
      return response.data // Retourner directement la structure du backend
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des catégories')
    }
  },
  getCategory: async (id: string) => {
    try {
      const response = await api.categories.getById(id)
      return response.data // Retourner directement la structure du backend
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la catégorie')
    }
  },
  createCategory: (data: any) => api.categories.create(data),
  updateCategory: (id: string, data: any) => api.categories.update(id, data),
  deleteCategory: (id: string) => api.categories.delete(id)
}

export default apiClient 