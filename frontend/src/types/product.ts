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
  slug?: string
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
export interface ProductDisplay extends Product {
  images: {
    url: string
    alt: string
    isPrimary: boolean
  }[]
  stock: {
    quantity: number
    reserved: number
    lowStockThreshold: number
  }
  rating?: {
    average: number
    count: number
  }
  salesCount?: number
} 