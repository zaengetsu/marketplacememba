import { ref, reactive, computed } from 'vue'
import { z, type ZodSchema } from 'zod'

export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isLoading: boolean
  isValid: boolean
  isDirty: boolean
  serverError: string | null
}

export interface UseFormOptions<T> {
  initialData: T
  validationSchema: ZodSchema<T>
  onSubmit: (data: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialData, validationSchema, onSubmit } = options

  // État du formulaire
  const data = reactive<T>({ ...initialData })
  const errors = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const serverError = ref<string | null>(null)
  const isDirty = ref(false)

  // Calculé pour vérifier si le formulaire est valide
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0 && !serverError.value
  })

  // Actions du formulaire
  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }
  
  const setServerError = (message: string) => {
    serverError.value = message
  }
  
  const clearErrors = () => {
    errors.value = {}
    serverError.value = null
  }
  
  const reset = () => {
    Object.assign(data, { ...initialData })
    errors.value = {}
    serverError.value = null
    isDirty.value = false
  }

  // Validation de tous les champs
  const validateAll = (): boolean => {
    try {
      validationSchema.parse(data)
      errors.value = {}
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        
        error.errors.forEach(err => {
          const field = err.path[0] as string
          if (field && !newErrors[field]) {
            newErrors[field] = err.message
          }
        })
        
        errors.value = newErrors
      }
      return false
    }
  }

  // Gestionnaire de soumission
  const handleSubmit = async (event?: Event) => {
    if (event) {
      event.preventDefault()
    }

    serverError.value = null

    if (!validateAll()) {
      return
    }

    try {
      isLoading.value = true
      await onSubmit(data as T)
    } catch (error) {
      if (error instanceof Error) {
        serverError.value = error.message
      } else {
        serverError.value = 'Une erreur inattendue est survenue'
      }
    } finally {
      isLoading.value = false
    }
  }

  // État du formulaire pour les composants
  const formState = computed(() => ({
    data,
    errors: errors.value,
    isLoading: isLoading.value,
    isValid: isValid.value,
    isDirty: isDirty.value,
    serverError: serverError.value
  }))

  return {
    data,
    errors,
    isLoading,
    isValid,
    isDirty,
    serverError,
    formState,
    setError,
    setServerError,
    clearErrors,
    reset,
    validateAll,
    handleSubmit
  }
}

// Schémas de validation courants avec Zod
export const commonSchemas = {
  email: z.string()
    .email('Adresse email invalide')
    .min(1, 'Email requis'),
    
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, 
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole'),
      
  name: z.string()
    .min(2, 'Au moins 2 caractères requis')
    .max(50, 'Maximum 50 caractères'),
    
  required: z.string().min(1, 'Ce champ est requis')
} 