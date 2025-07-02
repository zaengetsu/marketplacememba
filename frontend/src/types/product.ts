export interface Product {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  isOnSale: boolean
  stockQuantity: number
  categoryId: number
  category?: Category
  images: string[]  // ← Images simples (URLs)
  slug?: string
  status?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Types pour l'affichage frontend (avec images et données supplémentaires)
export interface ProductDisplay {
  id: number
  name: string
  description: string
  price: number
  salePrice?: number
  isOnSale: boolean
  stockQuantity: number
  categoryId: number
  images: { url: string; alt: string; isPrimary: boolean }[]  // ← Images complexes
  stock: { quantity: number; reserved: number; lowStockThreshold: number }
  rating?: { average: number; count: number }
  salesCount?: number
  slug?: string
  status?: string
  isActive?: boolean
  _id?: string // Pour la clé du template
  createdAt: string
  updatedAt: string
  category: {
    id: number
    name: string
    slug: string
    description: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
}