import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/product'
import { useToast } from 'vue-toastification'

interface CartItem {
  product: Product
  quantity: number
  reservedUntil?: Date
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const toast = useToast()

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() => 
    items.value.reduce((sum, item) => {
      const price = item.product.isOnSale && item.product.salePrice 
        ? item.product.salePrice 
        : item.product.price
      return sum + (price * item.quantity)
    }, 0)
  )

  const hasItems = computed(() => items.value.length > 0)

  // Actions
  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      isLoading.value = true
      
      // Vérifier le stock disponible
      const availableStock = product.stockQuantity
      if (availableStock < quantity) {
        toast.error(`Stock insuffisant. Il ne reste que ${availableStock} unité(s) disponible(s).`)
        return
      }

      // Vérifier si le produit est déjà dans le panier
      const existingItem = items.value.find(item => item.product.id === product.id)
      
      if (existingItem) {
        // Mettre à jour la quantité
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > availableStock) {
          toast.error(`Stock insuffisant. Il ne reste que ${availableStock} unité(s) disponible(s).`)
          return
        }
        existingItem.quantity = newQuantity
      } else {
        // Ajouter un nouvel item
        items.value.push({
          product,
          quantity,
          reservedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        })
      }

      // Sauvegarder dans le localStorage
      saveToStorage()
      
      toast.success('Produit ajouté au panier')
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier')
      console.error('Error adding to cart:', error)
    } finally {
      isLoading.value = false
    }
  }

  const removeItem = (productId: string) => {
    items.value = items.value.filter(item => item.product.id.toString() !== productId)
    saveToStorage()
    toast.success('Produit retiré du panier')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(item => item.product.id.toString() === productId)
    if (item) {
      const availableStock = item.product.stockQuantity
      if (quantity > availableStock) {
        toast.error(`Stock insuffisant. Il ne reste que ${availableStock} unité(s) disponible(s).`)
        return
      }
      item.quantity = quantity
      saveToStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    saveToStorage()
    toast.success('Panier vidé')
  }

  const saveToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const loadFromStorage = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Convertir les dates de réservation en objets Date
        items.value = parsedCart.map((item: any) => ({
          ...item,
          reservedUntil: item.reservedUntil ? new Date(item.reservedUntil) : undefined
        }))
      } catch (error) {
        console.error('Error loading cart from storage:', error)
        items.value = []
      }
    }
  }

  const cleanExpiredReservations = () => {
    const now = new Date()
    items.value = items.value.filter(item => {
      if (item.reservedUntil && item.reservedUntil < now) {
        toast.warning(`La réservation pour ${item.product.name} a expiré`)
        return false
      }
      return true
    })
    saveToStorage()
  }

  return {
    items,
    isLoading,
    totalItems,
    totalPrice,
    hasItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveToStorage,
    loadFromStorage,
    cleanExpiredReservations
  }
}) 