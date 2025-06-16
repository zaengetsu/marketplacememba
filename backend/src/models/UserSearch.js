const mongoose = require('mongoose');

const userSearchSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    index: true
  },
  lastName: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['ROLE_USER', 'ROLE_STORE_KEEPER', 'ROLE_COMPTA', 'ROLE_ADMIN'],
    default: 'ROLE_USER',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  searchTerms: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
});

// Index de recherche textuelle
userSearchSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  searchTerms: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 8,
    searchTerms: 5
  },
  name: 'user_text_search'
});

// Index composé pour les filtres admin
userSearchSchema.index({ role: 1, isActive: 1 });
userSearchSchema.index({ createdAt: -1, isActive: 1 });

module.exports = mongoose.model('UserSearch', userSearchSchema); 