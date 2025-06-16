<template>
  <div class="bg-white">
    <main class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2">Chargement des détails de la commande...</p>
      </div>

      <div v-else-if="!order" class="text-center">
        <div class="text-gray-400 text-6xl mb-4">❌</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Commande introuvable</h3>
        <p class="text-gray-500 mb-6">Cette commande n'existe pas ou vous n'y avez pas accès.</p>
        <router-link to="/orders" class="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700">
          Retour aux commandes
        </router-link>
      </div>

      <div v-else>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Détails de la commande</h1>

        <div class="mt-2 border-b border-gray-200 pb-5 text-sm sm:flex sm:justify-between">
          <dl class="flex">
            <dt class="text-gray-500">Numéro de commande&nbsp;</dt>
            <dd class="font-medium text-gray-900">{{ order.number }}</dd>
            <dt>
              <span class="sr-only">Date</span>
              <span aria-hidden="true" class="mx-2 text-gray-400">
                &middot;
              </span>
            </dt>
            <dd class="font-medium text-gray-900">
              <time :datetime="order.datetime">{{ order.date }}</time>
            </dd>
          </dl>
          <div class="mt-4 sm:mt-0">
            <a href="#" class="font-medium text-orange-600 hover:text-orange-500">
              Télécharger la facture
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>

        <section aria-labelledby="products-heading" class="mt-8">
          <h2 id="products-heading" class="sr-only">
            Produits achetés
          </h2>

          <div class="space-y-24">
            <div
              v-for="product in order.products"
              :key="product.id"
              class="grid grid-cols-1 text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-8"
            >
              <div class="sm:col-span-4 md:col-span-5 md:row-span-2 md:row-end-2">
                <img
                  :alt="product.imageAlt"
                  :src="product.imageSrc"
                  class="aspect-square w-full rounded-lg bg-gray-50 object-cover"
                />
              </div>
              <div class="mt-6 sm:col-span-7 sm:mt-0 md:row-end-1">
                <h3 class="text-lg font-medium text-gray-900">
                  <router-link :to="product.href">{{ product.name }}</router-link>
                </h3>
                <p class="mt-1 font-medium text-gray-900">{{ product.price }}</p>
                <p class="mt-3 text-gray-500">{{ product.description }}</p>
              </div>
              <div class="sm:col-span-12 md:col-span-7">
                <dl class="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
                  <div>
                    <dt class="font-medium text-gray-900">Adresse de livraison</dt>
                    <dd class="mt-3 text-gray-500">
                      <span class="block">{{ order.shippingAddress.name }}</span>
                      <span class="block">{{ order.shippingAddress.street }}</span>
                      <span class="block">{{ order.shippingAddress.city }}</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="font-medium text-gray-900">Mises à jour de livraison</dt>
                    <dd class="mt-3 space-y-3 text-gray-500">
                      <p>{{ order.contact.email }}</p>
                      <p>{{ order.contact.phone }}</p>
                      <button type="button" class="font-medium text-orange-600 hover:text-orange-500">
                        Modifier
                      </button>
                    </dd>
                  </div>
                </dl>
                <p class="mt-6 font-medium text-gray-900 md:mt-10">
                  {{ getStatusText(product.status) }} le <time :datetime="product.datetime">{{ product.date }}</time>
                </p>
                <div class="mt-6">
                  <div class="overflow-hidden rounded-full bg-gray-200">
                    <div
                      :style="{ width: `calc((${product.step} * 2 + 1) / 8 * 100%)` }"
                      class="h-2 rounded-full bg-orange-600"
                    />
                  </div>
                  <div class="mt-6 hidden grid-cols-4 font-medium text-gray-600 sm:grid">
                    <div class="text-orange-600">Commande passée</div>
                    <div :class="product.step > 0 ? 'text-orange-600' : ''" class="text-center">
                      En traitement
                    </div>
                    <div :class="product.step > 1 ? 'text-orange-600' : ''" class="text-center">
                      Expédié
                    </div>
                    <div :class="product.step > 2 ? 'text-orange-600' : ''" class="text-right">
                      Livré
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Résumé de facturation -->
        <section aria-labelledby="summary-heading" class="mt-24">
          <h2 id="summary-heading" class="sr-only">
            Résumé de facturation
          </h2>

          <div class="rounded-lg bg-gray-50 px-6 py-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-0 lg:py-8">
            <dl class="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-5 lg:pl-8">
              <div>
                <dt class="font-medium text-gray-900">Adresse de facturation</dt>
                <dd class="mt-3 text-gray-500">
                  <span class="block">{{ order.billingAddress.name }}</span>
                  <span class="block">{{ order.billingAddress.street }}</span>
                  <span class="block">{{ order.billingAddress.city }}</span>
                </dd>
              </div>
              <div>
                <dt class="font-medium text-gray-900">Informations de paiement</dt>
                <dd class="mt-3 flex">
                  <div>
                    <svg width="36" height="24" viewBox="0 0 36 24" aria-hidden="true" class="h-6 w-auto">
                      <rect rx="4" fill="#224DBA" width="36" height="24" />
                      <path
                        d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                        fill="#fff"
                      />
                    </svg>
                    <p class="sr-only">Visa</p>
                  </div>
                  <div class="ml-4">
                    <p class="text-gray-900">Se terminant par {{ order.payment.lastFour }}</p>
                    <p class="text-gray-600">Expire {{ order.payment.expiry }}</p>
                  </div>
                </dd>
              </div>
            </dl>

            <dl class="mt-8 divide-y divide-gray-200 text-sm lg:col-span-7 lg:mt-0 lg:pr-8">
              <div class="flex items-center justify-between pb-4">
                <dt class="text-gray-600">Sous-total</dt>
                <dd class="font-medium text-gray-900">{{ order.summary.subtotal }}</dd>
              </div>
              <div class="flex items-center justify-between py-4">
                <dt class="text-gray-600">Livraison</dt>
                <dd class="font-medium text-gray-900">{{ order.summary.shipping }}</dd>
              </div>
              <div class="flex items-center justify-between py-4">
                <dt class="text-gray-600">TVA</dt>
                <dd class="font-medium text-gray-900">{{ order.summary.tax }}</dd>
              </div>
              <div class="flex items-center justify-between pt-4">
                <dt class="font-medium text-gray-900">Total de la commande</dt>
                <dd class="font-medium text-orange-600">{{ order.summary.total }}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface OrderProduct {
  id: number
  name: string
  description: string
  href: string
  price: string
  status: 'processing' | 'shipped' | 'delivered'
  step: number
  date: string
  datetime: string
  imageSrc: string
  imageAlt: string
}

interface Order {
  number: string
  date: string
  datetime: string
  products: OrderProduct[]
  shippingAddress: {
    name: string
    street: string
    city: string
  }
  billingAddress: {
    name: string
    street: string
    city: string
  }
  contact: {
    email: string
    phone: string
  }
  payment: {
    lastFour: string
    expiry: string
  }
  summary: {
    subtotal: string
    shipping: string
    tax: string
    total: string
  }
}

const route = useRoute()
const loading = ref(true)
const order = ref<Order | null>(null)

// Données de démonstration
const mockOrder: Order = {
  number: 'MF088191111',
  date: '22 janvier 2024',
  datetime: '2024-01-22',
  products: [
    {
      id: 1,
      name: 'Chaussures de Running Nike Air Zoom',
      description: 'Chaussures de course haute performance avec technologie Zoom Air pour un amorti réactif. Parfaites pour vos sessions de running quotidiennes avec une semelle intermédiaire en mousse React.',
      href: '/products/1',
      price: '119,00€',
      status: 'delivered',
      step: 3,
      date: '25 janvier 2024',
      datetime: '2024-01-25',
      imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      imageAlt: 'Chaussures de running Nike Air Zoom noires et blanches avec détails orange'
    }
  ],
  shippingAddress: {
    name: 'Jean Dupont',
    street: '123 Rue de la Paix',
    city: '75001 Paris, France'
  },
  billingAddress: {
    name: 'Jean Dupont',
    street: '123 Rue de la Paix',
    city: '75001 Paris, France'
  },
  contact: {
    email: 'j•••@example.com',
    phone: '06•••••••40'
  },
  payment: {
    lastFour: '4242',
    expiry: '02 / 26'
  },
  summary: {
    subtotal: '119,00€',
    shipping: '5,99€',
    tax: '24,80€',
    total: '149,79€'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'processing':
      return 'En traitement'
    case 'shipped':
      return 'Expédié'
    case 'delivered':
      return 'Livré'
    default:
      return 'Statut inconnu'
  }
}

onMounted(() => {
  // Simuler le chargement des détails de la commande
  setTimeout(() => {
    const orderNumber = route.params.id as string
    if (orderNumber === 'MF088191111') {
      order.value = mockOrder
    }
    loading.value = false
  }, 1000)
})
</script> 