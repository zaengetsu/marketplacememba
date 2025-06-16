import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

// Styles
import './style.css'

// Plugins
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Configuration Toast
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Création de l'application
const app = createApp(App)

// Installation des plugins
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Initialisation de l'authentification
const authStore = useAuthStore()
authStore.checkAuth().catch(console.warn)

// Configuration globale pour le développement
if (import.meta.env.DEV) {
  app.config.performance = true
}

// Gestion des erreurs globales
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  // En production, on pourrait envoyer l'erreur à un service de monitoring
  if (import.meta.env.PROD) {
    // Envoyer à Sentry, LogRocket, etc.
  }
}

// Montage de l'application
app.mount('#app') 