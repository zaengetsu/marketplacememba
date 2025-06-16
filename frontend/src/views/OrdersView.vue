<template>
  <div class="bg-white">
    <div class="mx-auto max-w-4xl py-16 sm:px-6 sm:py-24">
      <div class="px-4 sm:px-0">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Historique des commandes</h1>
        <p class="mt-2 text-sm text-gray-500">
          Consultez le statut de vos commandes récentes, gérez les retours et téléchargez les factures.
        </p>
      </div>

      <div v-if="loading" class="mt-16 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2">Chargement de vos commandes...</p>
      </div>

      <div v-else-if="orders.length === 0" class="mt-16 text-center">
        <div class="text-gray-400 text-6xl mb-4">📦</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
        <p class="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
        <router-link to="/products" class="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700">
          Découvrir nos produits
        </router-link>
      </div>

      <div v-else class="mt-16">
        <h2 class="sr-only">Commandes récentes</h2>

        <div class="space-y-16 sm:space-y-24">
          <div v-for="order in orders" :key="order.number">
            <h3 class="sr-only">
              Commande passée le <time :datetime="order.datetime">{{ order.date }}</time>
            </h3>

            <div class="bg-gray-50 px-4 py-6 sm:rounded-lg sm:p-6 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8">
              <dl class="flex-auto divide-y divide-gray-200 text-sm text-gray-600 md:grid md:grid-cols-3 md:gap-x-6 md:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
                <div class="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                  <dt class="font-medium text-gray-900">Numéro de commande</dt>
                  <dd class="md:mt-1">{{ order.number }}</dd>
                </div>
                <div class="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                  <dt class="font-medium text-gray-900">Date de commande</dt>
                  <dd class="md:mt-1">
                    <time :datetime="order.datetime">{{ order.date }}</time>
                  </dd>
                </div>
                <div class="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                  <dt class="font-medium text-gray-900">Montant total</dt>
                  <dd class="font-medium text-gray-900 md:mt-1">{{ order.total }}</dd>
                </div>
              </dl>
              <div class="mt-6 space-y-4 sm:flex sm:space-x-4 sm:space-y-0 md:mt-0">
                <router-link
                  :to="`/orders/${order.number}`"
                  class="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 md:w-auto"
                >
                  Voir la commande
                  <span class="sr-only">{{ order.number }}</span>
                </router-link>
                <a
                  :href="order.invoiceHref"
                  class="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 md:w-auto"
                >
                  Télécharger la facture
                  <span class="sr-only">pour la commande {{ order.number }}</span>
                </a>
              </div>
            </div>

            <div class="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
              <div class="-my-6 divide-y divide-gray-200 sm:-my-10">
                <div v-for="product in order.products" :key="product.id" class="flex py-6 sm:py-10">
                  <div class="min-w-0 flex-1 lg:flex lg:flex-col">
                    <div class="lg:flex-1">
                      <div class="sm:flex">
                        <div>
                          <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
                          <p class="mt-2 hidden text-sm text-gray-500 sm:block">{{ product.description }}</p>
                        </div>
                        <p class="mt-1 font-medium text-gray-900 sm:ml-6 sm:mt-0">{{ product.price }}</p>
                      </div>
                      <div class="mt-2 flex text-sm font-medium sm:mt-4">
                        <router-link :to="product.href" class="text-orange-600 hover:text-orange-500">
                          Voir le produit
                        </router-link>
                        <div class="ml-4 border-l border-gray-200 pl-4 sm:ml-6 sm:pl-6">
                          <button @click="buyAgain(product)" class="text-orange-600 hover:text-orange-500">
                            Racheter
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="mt-6 font-medium">
                      <div v-if="product.status === 'delivered'" class="flex space-x-2">
                        <svg class="size-6 flex-none text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>
                          Livré
                          <span class="hidden sm:inline">
                            le <time :datetime="product.datetime">{{ product.date }}</time>
                          </span>
                        </p>
                      </div>
                      <div v-else-if="product.status === 'out-for-delivery'" class="flex space-x-2">
                        <svg class="size-6 flex-none text-orange-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM19.5 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM3 7.5h18l-2 13.5H5L3 7.5z" />
                        </svg>
                        <p>En cours de livraison</p>
                      </div>
                      <div v-else-if="product.status === 'processing'" class="flex space-x-2">
                        <svg class="size-6 flex-none text-blue-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>En cours de traitement</p>
                      </div>
                      <div v-else-if="product.status === 'cancelled'" class="flex space-x-2">
                        <svg class="size-6 flex-none text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-gray-500">Annulé</p>
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                    <img
                      :alt="product.imageAlt"
                      :src="product.imageSrc"
                      class="col-start-2 col-end-3 size-20 rounded-lg object-cover sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:size-40 lg:size-52"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from 'vue-toastification'

interface OrderProduct {
  id: number
  name: string
  description: string
  href: string
  price: string
  status: 'delivered' | 'out-for-delivery' | 'processing' | 'cancelled'
  date: string
  datetime: string
  imageSrc: string
  imageAlt: string
}

interface Order {
  number: string
  date: string
  datetime: string
  href: string
  invoiceHref: string
  total: string
  products: OrderProduct[]
}

const cartStore = useCartStore()
const toast = useToast()

const loading = ref(true)
const orders = ref<Order[]>([])

// Données de démonstration
const mockOrders: Order[] = [
  {
    number: 'MF088191111',
    date: '22 janvier 2024',
    datetime: '2024-01-22',
    href: '#',
    invoiceHref: '#',
    total: '347,00€',
    products: [
      {
        id: 1,
        name: 'Chaussures de Running Nike Air Zoom',
        description: 'Chaussures de course haute performance avec technologie Zoom Air pour un amorti réactif. Parfaites pour vos sessions de running quotidiennes.',
        href: '/products/1',
        price: '119,00€',
        status: 'delivered',
        date: '25 janvier 2024',
        datetime: '2024-01-25',
        imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        imageAlt: 'Chaussures de running Nike Air Zoom noires et blanches'
      },
      {
        id: 2,
        name: 'Montre Connectée Fitness',
        description: 'Montre intelligente avec suivi GPS, cardiofréquencemètre et plus de 50 modes sport pour un suivi complet de vos activités.',
        href: '/products/4',
        price: '249,00€',
        status: 'delivered',
        date: '25 janvier 2024',
        datetime: '2024-01-25',
        imageSrc: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        imageAlt: 'Montre connectée fitness avec écran tactile'
      }
    ]
  },
  {
    number: 'MF088191112',
    date: '15 janvier 2024',
    datetime: '2024-01-15',
    href: '#',
    invoiceHref: '#',
    total: '158,00€',
    products: [
      {
        id: 3,
        name: 'Tapis de Yoga Premium',
        description: 'Tapis de yoga antidérapant en caoutchouc naturel, épaisseur 6mm. Idéal pour toutes vos séances de yoga et pilates.',
        href: '/products/3',
        price: '59,00€',
        status: 'out-for-delivery',
        date: '16 janvier 2024',
        datetime: '2024-01-16',
        imageSrc: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300',
        imageAlt: 'Tapis de yoga violet déroulé'
      },
      {
        id: 4,
        name: 'Protéine Whey Isolate 2kg',
        description: 'Protéine en poudre haute qualité, 90% de protéines, saveur vanille. Parfait pour la récupération musculaire.',
        href: '/products/6',
        price: '69,00€',
        status: 'processing',
        date: '16 janvier 2024',
        datetime: '2024-01-16',
        imageSrc: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300',
        imageAlt: 'Pot de protéine en poudre'
      }
    ]
  }
]

const buyAgain = async (product: OrderProduct) => {
  // Simuler l'ajout au panier
  toast.success(`${product.name} ajouté au panier !`)
}

onMounted(() => {
  // Simuler le chargement des commandes
  setTimeout(() => {
    orders.value = mockOrders
    loading.value = false
  }, 1000)
})
</script> 