<template>
  <div>
    <!-- Bouton de déclenchement -->
    <button
      type="button"
      @click="openModal"
      :disabled="loading"
      :class="[
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'danger' 
          ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'
          : 'text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400',
        loading && 'cursor-not-allowed opacity-75'
      ]"
    >
      <TrashIcon v-if="!loading" class="w-4 h-4 mr-2" />
      <div v-else class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      {{ loading ? loadingText : buttonText }}
    </button>

    <!-- Modal de confirmation -->
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <!-- En-tête avec icône d'alerte -->
                <div class="flex items-center">
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div class="ml-4">
                    <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                      {{ title }}
                    </DialogTitle>
                  </div>
                </div>

                <!-- Contenu du message -->
                <div class="mt-4">
                  <p class="text-sm text-gray-500">
                    {{ message }}
                  </p>
                  
                  <!-- Message d'erreur si la requête échoue -->
                  <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div class="flex">
                      <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                          Erreur lors de la suppression
                        </h3>
                        <div class="mt-1 text-sm text-red-700">
                          {{ error }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Boutons d'action -->
                <div class="mt-6 flex space-x-3">
                  <button
                    type="button"
                    @click="closeModal"
                    :disabled="loading"
                    class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete"
                    :disabled="loading"
                    class="inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div v-if="loading" class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {{ loading ? 'Suppression...' : 'Supprimer' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  message?: string
  buttonText?: string
  loadingText?: string
  variant?: 'danger' | 'default'
  onConfirm: () => Promise<void> | void
  onSuccess?: () => void
  onError?: (error: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmer la suppression',
  message: 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  buttonText: 'Supprimer',
  loadingText: 'Suppression...',
  variant: 'danger'
})

const isOpen = ref(false)
const loading = ref(false)
const error = ref<string>('')

const openModal = () => {
  isOpen.value = true
  error.value = ''
}

const closeModal = () => {
  if (!loading.value) {
    isOpen.value = false
    error.value = ''
  }
}

const confirmDelete = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await props.onConfirm()
    
    // Succès - fermer la modale et exécuter le callback
    loading.value = false
    isOpen.value = false
    
    if (props.onSuccess) {
      props.onSuccess()
    }
  } catch (err) {
    loading.value = false
    const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue est survenue'
    error.value = errorMessage
    
    if (props.onError) {
      props.onError(errorMessage)
    }
  }
}
</script> 