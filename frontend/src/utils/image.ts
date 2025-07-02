export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/placeholder.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:4000${imagePath}`
}

export const getProductImageUrl = (product: any): string => {
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0])
  }
  return '/placeholder.svg'
}

export const getCategoryImageUrl = (categorySlug: string): string => {
  // Essayer d'abord l'image SVG locale
  return `/images/categories/${categorySlug}.svg`
}