const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  category: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La catégorie est requise']
    },
    name: String,
    slug: String
  },
  brand: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    },
    name: String,
    slug: String
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  salePrice: Number,
  isOnSale: {
    type: Boolean,
    default: false
  },
  stock: {
    quantity: {
      type: Number,
      required: [true, 'La quantité en stock est requise'],
      min: [0, 'La quantité ne peut pas être négative'],
      default: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'category.id': 1 });
productSchema.index({ 'brand.id': 1 });
productSchema.index({ price: 1 });
productSchema.index({ isOnSale: 1 });

productSchema.virtual('currentPrice').get(function() {
  return this.isOnSale && this.salePrice ? this.salePrice : this.price;
});

productSchema.virtual('isInStock').get(function() {
  return (this.stock.quantity - this.stock.reserved) > 0;
});

productSchema.methods.reserveStock = function(quantity) {
  if ((this.stock.quantity - this.stock.reserved) < quantity) {
    throw new Error('Stock insuffisant');
  }
  this.stock.reserved += quantity;
  return this.save();
};

module.exports = mongoose.model('Product', productSchema); 