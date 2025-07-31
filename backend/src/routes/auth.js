const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../../models'); // Assurez-vous que le modèle User est correctement importé
const { authenticate } = require('../middlewares/auth');
const emailService = require('../services/emailService'); // À configurer plus tard
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP par heure
  message: {
    success: false,
    error: 'Trop de tentatives d\'inscription. Réessayez dans 1 heure.'
  }
});

// Validation des données d'inscription (simplifiée pour Sequelize)
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),

  body('gdprConsent')
    .equals('true')
    .withMessage('Vous devez accepter les conditions générales et la politique de confidentialité')
];

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, gdprConsent } = req.body;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email déjà utilisé.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Génération du token de vérification email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Création de l'utilisateur (adapté pour Sequelize)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gdprConsent,
      isEmailVerified: false,
      isActive: true,
      emailVerificationToken // Assure-toi que ce champ existe dans ton modèle et ta migration
    });

    // Envoi de l'email de vérification
    logger.info('Appel de sendVerificationEmail pour', user.email);
    await emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user
    );

    return res.status(201).json({ success: true, message: 'Utilisateur créé. Vérifiez votre email.' });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
});


// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Recherche de l'utilisateur (Sequelize)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification que l'email est vérifié
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Veuillez valider votre adresse email avant de vous connecter.'
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Failed login attempt', {
        email,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification que le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    logger.info('User logged in', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        },
        token
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

// @desc    Déconnexion
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
});

// @desc    Profil utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        isActive: req.user.isActive
      }
    }
  });
});

// @desc    Demande de réinitialisation de mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Aucun compte trouvé avec cet email.' });
    }

    // Génère un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1h

    await user.save();

    // Envoie l'email avec le lien de réinitialisation
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({ success: true, message: 'Un email de réinitialisation a été envoyé.' });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
});

// @desc    Renouvellement de mot de passe
// @route   POST /api/auth/renew-password
// @access  Private
router.post('/renew-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Récupération de l'utilisateur avec le mot de passe
    const user = await User.findByPk(req.user.id);

    // Vérification du mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    // Hashage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mise à jour du mot de passe
    await user.update({ password: hashedPassword });


    logger.info('Password renewed', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Mot de passe renouvelé avec succès'
    });

  } catch (error) {
    logger.error('Password renewal error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du renouvellement du mot de passe'
    });
  }
});


// @desc    reinitialisation du mot de passe
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Lien invalide ou expiré.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({ success: true, message: 'Mot de passe modifié.' });
});

// @desc    Vérification de l'email
// @route   GET /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token manquant.' });
  }
  const user = await User.findOne({ where: { emailVerificationToken: token } });
  if (!user) {
    return res.status(400).json({ success: false, error: 'Token invalide.' });
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();
  res.json({ success: true, message: 'Email vérifié !' });
});

// Route temporaire de développement pour activer les comptes
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/activate-email', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
      }
      
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save();
      
      res.json({ success: true, message: `Email activé pour ${email}` });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  });
}

module.exports = router;