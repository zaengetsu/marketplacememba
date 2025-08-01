export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/placeholder.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}${imagePath}`
}

export const getProductImageUrl = (product: any): string => {
  if (product.images && product.images.length > 0) {
    // Cas 1 : tableau d'objets { url }
    if (typeof product.images[0] === 'object' && product.images[0] !== null) {
      const mainImg = product.images.find((img: any) => img.isPrimary) || product.images[0]
      if (mainImg && mainImg.url) {
        return getImageUrl(mainImg.url)
      }
    }
    // Cas 2 : tableau de chaînes (URLs)
    if (typeof product.images[0] === 'string') {
      return getImageUrl(product.images[0])
    }
  }
  // Fallback catégorie
  if (product.category?.slug) {
    return getCategoryImageUrl(product.category.slug)
  }
  // Fallback placeholder
  return '/placeholder.svg'
}

export const getCategoryImageUrl = (categorySlug: string): string => {
  // Essayer d'abord l'image SVG locale
  return `/images/categories/${categorySlug}.svg`
}