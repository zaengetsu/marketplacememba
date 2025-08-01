import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export interface Order {
  id: number
  userId: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: any
  billingAddress: any
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: number
  orderId: number
  invoiceNumber: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issuedAt: string
  dueAt: string
  paidAt?: string
  order?: Order
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const invoices = ref<Invoice[]>([])
  const currentOrder = ref<Order | null>(null)
  const currentPaymentIntent = ref<PaymentIntent | null>(null)
  const isLoading = ref(false)

  // Computed
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )
  
  const completedOrders = computed(() => 
    orders.value.filter(order => ['delivered', 'completed'].includes(order.status))
  )

  // Actions
  const createOrder = async (orderData: {
    total: number
    shippingAddress: any
    billingAddress?: any
    items: any[]
  }) => {
    isLoading.value = true
    try {
      const response = await api.orders.create(orderData)
      if (response.data.success) {
        currentOrder.value = response.data.data
        orders.value.unshift(response.data.data)
        return response.data.data
      }
      throw new Error(response.data.message || 'Erreur lors de la création de la commande')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la commande')
    } finally {
      isLoading.value = false
    }
  }

  const createPaymentIntent = async (amount: number, orderId: number) => {
    isLoading.value = true
    try {
      const response = await api.payments.createIntent({
        amount: Math.round(amount * 100), // Montant en centimes
        currency: 'eur',
        orderId
      })
      
      if (response.data.success) {
        currentPaymentIntent.value = {
          id: response.data.data.paymentIntentId,
          clientSecret: response.data.data.clientSecret,
          amount: amount * 100, // Stripe utilise les centimes
          currency: 'eur',
          status: 'requires_payment_method'
        }
        return currentPaymentIntent.value
      }
      throw new Error(response.data.message || 'Erreur lors de la création du paiement')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du paiement')
    } finally {
      isLoading.value = false
    }
  }

  const confirmPayment = async (paymentIntentId: string, orderId?: number) => {
    isLoading.value = true
    try {
      const response = await api.payments.confirm({
        paymentIntentId,
        orderId
      })
      
      if (response.data.success) {
        // Mettre à jour le statut de la commande
        if (currentOrder.value) {
          currentOrder.value.status = 'confirmed'
          const orderIndex = orders.value.findIndex(o => o.id === currentOrder.value!.id)
          if (orderIndex !== -1) {
            orders.value[orderIndex] = { ...currentOrder.value }
          }
        }
        return response.data.data
      }
      throw new Error(response.data.message || 'Erreur lors de la confirmation du paiement')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la confirmation du paiement')
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrders = async (params?: any) => {
    isLoading.value = true
    try {
      const response = await api.orders.getAll(params)
      if (response.data.success) {
        orders.value = response.data.data.orders
        return response.data.data
      }
      throw new Error(response.data.message || 'Erreur lors de la récupération des commandes')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des commandes')
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrderById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await api.orders.getById(id)
      if (response.data.success) {
        currentOrder.value = response.data.data
        return response.data.data
      }
      throw new Error(response.data.message || 'Commande non trouvée')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la commande')
    } finally {
      isLoading.value = false
    }
  }

  const fetchInvoices = async (params?: any) => {
    isLoading.value = true
    try {
      const response = await api.invoices.getAll(params)
      if (response.data.success) {
        invoices.value = response.data.data.invoices
        return response.data.data
      }
      throw new Error(response.data.message || 'Erreur lors de la récupération des factures')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des factures')
    } finally {
      isLoading.value = false
    }
  }

  const processCheckout = async (cartItems: any[], shippingAddress: any, billingAddress?: any, shippingCost?: number) => {
    try {
      // 1. Calculer le total TTC des produits
      const totalTTC = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      // Ajoute le coût de livraison
      const totalToPay = shippingCost !== undefined ? totalTTC + shippingCost : totalTTC

      // 2. Créer la commande
      const order = await createOrder({
        total: totalToPay,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: cartItems
      })

      // 3. Créer l'intention de paiement
      const paymentIntent = await createPaymentIntent(totalToPay, order.id)

      return {
        order,
        paymentIntent
      }
    } catch (error) {
      throw error
    }
  }

  const clearCurrentOrder = () => {
    currentOrder.value = null
    currentPaymentIntent.value = null
  }

  return {
    // State
    orders,
    invoices,
    currentOrder,
    currentPaymentIntent,
    isLoading,
    
    // Computed
    pendingOrders,
    completedOrders,
    
    // Actions
    createOrder,
    createPaymentIntent,
    confirmPayment,
    fetchOrders,
    fetchOrderById,
    fetchInvoices,
    processCheckout,
    clearCurrentOrder
  }
}) 