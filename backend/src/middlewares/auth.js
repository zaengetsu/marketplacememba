const jwt = require('jsonwebtoken');
const { User } = require('../../models'); // Import Sequelize
const logger = require('../utils/logger');

// Middleware d'authentification JWT (Version Sequelize)
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Récupération du token depuis l'en-tête Authorization ou les cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Token requis.'
      });
    }
    
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Récupération de l'utilisateur (Sequelize)
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide. Utilisateur non trouvé.'
      });
    }
    
    // Vérification que le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }
    
    // Attachement de l'utilisateur à la requête
    req.user = user;
    
    // Log de l'activité
    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: req.ip
    });
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expiré. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification.'
    });
  }
};

// Middleware optionnel (pour les routes qui fonctionnent avec ou sans auth)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

// Middleware de vérification des rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        route: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(403).json({
        success: false,
        error: 'Accès interdit. Privilèges insuffisants.'
      });
    }
    
    next();
  };
};

// Middleware pour vérifier que l'utilisateur accède à ses propres données
const authorizeSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise.'
    });
  }
  
  const targetUserId = req.params.userId || req.params.id;
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.id.toString() === targetUserId;
  
  if (!isAdmin && !isSelf) {
    logger.warn('Unauthorized data access attempt', {
      userId: req.user.id,
      targetUserId,
      route: req.originalUrl,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      error: 'Accès interdit. Vous ne pouvez accéder qu\'à vos propres données.'
    });
  }
  
  next();
};

// Middleware pour la connexion en tant qu'autre utilisateur (support)
const impersonateUser = async (req, res, next) => {
  try {
    // Seuls les admins peuvent se connecter en tant qu'autre utilisateur
    if (req.user.role !== 'ROLE_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Fonctionnalité réservée aux administrateurs.'
      });
    }
    
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur cible requis.'
      });
    }
    
    const targetUser = await User.findByPk(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur cible non trouvé.'
      });
    }
    
    // Log de la connexion en tant qu'autre utilisateur
          logger.warn('Admin impersonation started', {
        adminId: req.user.id,
        adminEmail: req.user.email,
        targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      ip: req.ip
    });
    
    // Génération d'un token spécial avec les informations d'impersonation
    const impersonationToken = jwt.sign({
      id: targetUser._id,
      email: targetUser.email,
      role: targetUser.role,
      impersonator: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Token d'impersonation valide 1h seulement
    });
    
    res.json({
      success: true,
      data: {
        token: impersonationToken,
        user: targetUser,
        impersonator: {
          id: req.user._id,
          email: req.user.email
        }
      }
    });
    
  } catch (error) {
    logger.error('Impersonation error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion en tant qu\'utilisateur.'
    });
  }
};

// Middleware simple pour vérifier les permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise.'
      });
    }
    
    // Simplification : seul admin peut tout faire
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Privilèges insuffisants.'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeSelfOrAdmin,
  requirePermission
}; 