const mongoose = require('mongoose');

const productSearchSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: true,
    index: true
  },
  salePrice: {
    type: Number,
    index: true
  },
  isOnSale: {
    type: Boolean,
    default: false,
    index: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    index: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  category: {
    id: Number,
    name: String,
    slug: String
  },
  searchTerms: [{
    type: String,
    index: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Index de recherche textuelle
productSearchSchema.index({
  name: 'text',
  description: 'text',
  'category.name': 'text',
  searchTerms: 'text'
}, {
  weights: {
    name: 10,
    'category.name': 5,
    searchTerms: 3,
    description: 1
  },
  name: 'product_text_search'
});

// Index composé pour les filtres
productSearchSchema.index({ isActive: 1, isOnSale: 1, price: 1 });
productSearchSchema.index({ 'category.id': 1, isActive: 1 });
productSearchSchema.index({ stockQuantity: 1, isActive: 1 });

module.exports = mongoose.model('ProductSearch', productSearchSchema); 