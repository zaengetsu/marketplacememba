export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:4000${imagePath}`
}

export const getProductImageUrl = (product: any): string => {
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0])
  }
  return 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'
}

export const getCategoryImageUrl = (categorySlug: string): string => {
  return `http://localhost:4000/images/categories/${categorySlug}.jpg`
}