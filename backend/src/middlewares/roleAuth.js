const logger = require('../utils/logger');

// Middleware de vérification des rôles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        });
      }

      // Vérifier le rôle
      if (!allowedRoles.includes(req.user.role)) {
        logger.security('Unauthorized role access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          route: req.originalUrl,
          method: req.method,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Permissions insuffisantes.',
          required: allowedRoles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      logger.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur de vérification des permissions'
      });
    }
  };
};

// Middlewares spécifiques par rôle
const requireAdmin = requireRole(['ROLE_ADMIN']);
const requireStoreKeeper = requireRole(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']);
const requireCompta = requireRole(['ROLE_ADMIN', 'ROLE_COMPTA']);
const requireUser = requireRole(['ROLE_ADMIN', 'ROLE_STORE_KEEPER', 'ROLE_COMPTA', 'ROLE_USER']);

// Middleware pour les ressources propres à l'utilisateur
const requireOwnershipOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    // Admin peut tout faire
    if (req.user.role === 'ROLE_ADMIN') {
      return next();
    }

    // Vérifier que l'utilisateur accède à ses propres données
    const resourceUserId = req.params.userId || req.body.userId || req.user.id;
    
    if (req.user.id !== parseInt(resourceUserId)) {
      logger.security('Unauthorized ownership access attempt', {
        userId: req.user.id,
        targetUserId: resourceUserId,
        route: req.originalUrl,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres données.'
      });
    }

    next();
  } catch (error) {
    logger.error('Ownership authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de vérification des permissions'
    });
  }
};

// Middleware pour les permissions de lecture/écriture
const requirePermission = (permission) => {
  const permissions = {
    'products:read': ['ROLE_ADMIN', 'ROLE_STORE_KEEPER', 'ROLE_USER'],
    'products:write': ['ROLE_ADMIN', 'ROLE_STORE_KEEPER'],
    'products:delete': ['ROLE_ADMIN'],
    'users:read': ['ROLE_ADMIN'],
    'users:write': ['ROLE_ADMIN'],
    'users:delete': ['ROLE_ADMIN'],
    'orders:read': ['ROLE_ADMIN', 'ROLE_COMPTA', 'ROLE_STORE_KEEPER'],
    'orders:write': ['ROLE_ADMIN', 'ROLE_STORE_KEEPER'],
    'invoices:read': ['ROLE_ADMIN', 'ROLE_COMPTA'],
    'invoices:write': ['ROLE_ADMIN', 'ROLE_COMPTA'],
    'analytics:read': ['ROLE_ADMIN', 'ROLE_COMPTA']
  };

  const allowedRoles = permissions[permission];
  if (!allowedRoles) {
    throw new Error(`Permission inconnue: ${permission}`);
  }

  return requireRole(allowedRoles);
};

module.exports = {
  requireRole,
  requireAdmin,
  requireStoreKeeper,
  requireCompta,
  requireUser,
  requireOwnershipOrAdmin,
  requirePermission
}; 