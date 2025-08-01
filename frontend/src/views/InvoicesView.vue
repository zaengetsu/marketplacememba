<template>
  <div class="invoices-view">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Mes Factures</h1>

      <!-- Loading -->
      <div v-if="orderStore.isLoading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-600">Chargement des factures...</p>
      </div>

      <!-- Aucune facture -->
      <div v-else-if="orderStore.invoices.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🧾</div>
        <h2 class="text-2xl font-semibold mb-4">Aucune facture</h2>
        <p class="text-gray-600 mb-8">Vous n'avez pas encore de facture disponible</p>
        <router-link to="/orders" class="btn btn-primary">
          Voir mes commandes
        </router-link>
      </div>

      <!-- Liste des factures -->
      <div v-else class="space-y-6">
        <div v-for="invoice in orderStore.invoices" :key="invoice.id" class="card">
          <div class="card-body">
            <!-- En-tête de facture -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold">{{ invoice.invoiceNumber }}</h3>
                <p class="text-gray-600 text-sm">
                  Émise le {{ formatDate(new Date(invoice.issuedAt)) }}
                </p>
                <p v-if="invoice.order" class="text-gray-600 text-sm">
                  Commande #{{ invoice.order.id }}
                </p>
              </div>
              <div class="mt-2 md:mt-0 flex items-center space-x-4">
                <span :class="getStatusClass(invoice.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(invoice.status) }}
                </span>
                <span class="text-lg font-semibold">
                  {{ (Number(invoice.amount) + Number(invoice.order?.shippingCost || 0)).toFixed(2) }}€
                </span>
              </div>
            </div>
            <div v-if="invoice.order?.shippingCost && invoice.order.shippingCost > 0" class="text-sm text-gray-500 mb-2">
              Livraison : {{ Number(invoice.order.shippingCost).toFixed(2) }}€ incluse
            </div>

            <!-- Informations détaillées -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span class="text-gray-500">Date d'échéance :</span>
                <span class="ml-2">{{ formatDate(new Date(invoice.dueAt)) }}</span>
              </div>
              <div v-if="invoice.paidAt">
                <span class="text-gray-500">Payée le :</span>
                <span class="ml-2 text-green-600 font-medium">{{ formatDate(new Date(invoice.paidAt)) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2">
              <button 
                @click="viewInvoiceDetails(invoice.id)"
                class="btn btn-outline btn-sm"
              >
                Voir détails
              </button>
              <button 
                @click="downloadPDF(invoice.id)"
                class="btn btn-primary btn-sm"
              >
                📄 Télécharger PDF
              </button>
              <button 
                v-if="invoice.status === 'draft'"
                @click="sendInvoice(invoice.id)"
                class="btn btn-outline btn-sm"
              >
                📧 Envoyer par email
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="flex justify-center mt-8">
          <div class="flex space-x-2">
            <button 
              v-for="page in pagination.pages" 
              :key="page"
              @click="loadPage(page)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium',
                page === pagination.page 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails -->
    <div v-if="selectedInvoice" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ selectedInvoice.invoiceNumber }}</h2>
            <button @click="selectedInvoice = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="font-medium mb-2">Statut</h3>
              <span :class="getStatusClass(selectedInvoice.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ getStatusText(selectedInvoice.status) }}
              </span>
            </div>

            <div>
              <h3 class="font-medium mb-2">Montant payé</h3>
              <span class="text-xl font-semibold">
                {{ (Number(selectedInvoice.amount) + Number(selectedInvoice.order?.shippingCost || 0)).toFixed(2) }}€
              </span>
              <div v-if="selectedInvoice.order?.shippingCost && selectedInvoice.order.shippingCost > 0" class="text-sm text-gray-500 mt-1">
                Livraison : {{ Number(selectedInvoice.order.shippingCost).toFixed(2) }}€ incluse
              </div>
            </div>

            <div>
              <h3 class="font-medium mb-2">Date d'émission</h3>
              <p class="text-gray-600">{{ formatDate(new Date(selectedInvoice.issuedAt)) }}</p>
            </div>

            <div>
              <h3 class="font-medium mb-2">Date d'échéance</h3>
              <p class="text-gray-600">{{ formatDate(new Date(selectedInvoice.dueAt)) }}</p>
            </div>

            <div v-if="selectedInvoice.paidAt">
              <h3 class="font-medium mb-2">Date de paiement</h3>
              <p class="text-green-600 font-medium">{{ formatDate(new Date(selectedInvoice.paidAt)) }}</p>
            </div>

            <div v-if="selectedInvoice.order">
              <h3 class="font-medium mb-2">Commande liée</h3>
              <p class="text-gray-600">
                Commande #{{ selectedInvoice.order.id }} 
                ({{ (Number(selectedInvoice.order.total) + Number(selectedInvoice.order.shippingCost || 0)).toFixed(2) }}€)
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-6">
            <button @click="downloadPDF(selectedInvoice.id)" class="btn btn-primary">
              📄 Télécharger PDF
            </button>
            <button @click="selectedInvoice = null" class="btn btn-outline">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore, type Invoice } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const selectedInvoice = ref<Invoice | null>(null)
const pagination = ref<any>(null)

onMounted(async () => {
  await loadInvoices()
})

const loadInvoices = async (page = 1) => {
  try {
    const result = await orderStore.fetchInvoices({ page, limit: 10 })
    pagination.value = result.pagination
  } catch (error: any) {
    console.error('Erreur lors du chargement des factures:', error)
    alert(`Erreur: ${error.message}`)
  }
}

const loadPage = (page: number) => {
  loadInvoices(page)
}

const viewInvoiceDetails = async (invoiceId: number) => {
  try {
    // Trouver la facture dans la liste
    const invoice = orderStore.invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      selectedInvoice.value = invoice
    } else {
      throw new Error('Facture non trouvée')
    }
  } catch (error: any) {
    console.error('Erreur lors du chargement des détails:', error)
    alert(`Erreur: ${error.message}`)
  }
}

const downloadPDF = async (invoiceId: number) => {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
    });
    if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Erreur lors du téléchargement:', error);
    alert(`Erreur: ${error.message}`);
  }
}
const sendInvoice = async (invoiceId: number) => {
  try {
    console.log('Envoyer facture par email:', invoiceId)
    alert('Facture envoyée par email (fonctionnalité à implémenter)')
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi:', error)
    alert(`Erreur: ${error.message}`)
  }
}

const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  }
  return texts[status as keyof typeof texts] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script> 