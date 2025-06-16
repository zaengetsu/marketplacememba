const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [12, 'Le mot de passe doit contenir au moins 12 caractères'],
    validate: {
      validator: function(password) {
        // Validation CNIL: majuscule, minuscule, chiffre, symbole
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
      },
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole'
    },
    select: false
  },
  
  // Informations de contact
  phone: {
    type: String,
    trim: true,
    match: [/^(\+33|0)[0-9]{9}$/, 'Numéro de téléphone invalide']
  },
  
  // Adresses
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping', 'both'],
      default: 'both'
    },
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' },
    isDefault: { type: Boolean, default: false }
  }],
  
  // Rôles et permissions
  role: {
    type: String,
    enum: ['ROLE_USER', 'ROLE_STORE_KEEPER', 'ROLE_COMPTA', 'ROLE_ADMIN'],
    default: 'ROLE_USER'
  },
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Tokens de sécurité
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
  
  // Sécurité et authentification
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLoginAt: Date,
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  
  // Préférences utilisateur
  preferences: {
    newsletter: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
    newProductAlerts: { type: Boolean, default: false },
    priceChangeAlerts: { type: Boolean, default: false },
    restockAlerts: { type: Boolean, default: false }
  },
  
  // RGPD et données personnelles
  gdprConsent: {
    given: { type: Boolean, default: false },
    date: Date,
    version: String
  },
  cookieConsent: {
    necessary: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    date: Date
  },
  dataProcessingConsent: {
    type: Boolean,
    default: false
  },
  
  // Anonymisation (RGPD)
  isAnonymized: {
    type: Boolean,
    default: false
  },
  anonymizedAt: Date,
  originalId: String, // Pour lier les anciennes données anonymisées
  
  // Métadonnées
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.refreshToken;
      delete ret.__v;
      return ret;
    }
  }
});

// Index pour les recherches (email déjà indexé par unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Middleware de hashage du mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    this.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Vérification de la nécessité de renouveler le mot de passe (60 jours)
userSchema.virtual('needsPasswordRenewal').get(function() {
  const daysSinceLastChange = (Date.now() - this.lastPasswordChange) / (1000 * 60 * 60 * 24);
  return daysSinceLastChange > 60;
});

// Vérification si le compte est verrouillé
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Méthodes d'instance
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
  this.refreshToken = refreshToken;
  return refreshToken;
};

userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
  return token;
};

userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Gestion des tentatives de connexion
userSchema.methods.incLoginAttempts = function() {
  // Si nous avons une date de verrouillage précédente et qu'elle est expirée, recommencer
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Si nous avons atteint la limite et que nous ne sommes pas déjà verrouillés
  if (this.loginAttempts + 1 >= 3 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 heures
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Anonymisation RGPD
userSchema.methods.anonymize = function() {
  this.originalId = this._id.toString();
  this.firstName = 'Anonyme';
  this.lastName = 'Utilisateur';
  this.email = `anonyme-${Date.now()}@anonyme.com`;
  this.phone = null;
  this.addresses = [];
  this.isAnonymized = true;
  this.anonymizedAt = new Date();
  
  // Conserver uniquement les données nécessaires pour les commandes
  return this.save();
};

// Méthodes statiques
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isAnonymized: false });
};

module.exports = mongoose.model('User', userSchema); 