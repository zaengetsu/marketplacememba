const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Product, Order } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/admin/dashboard - Statistiques dashboard
router.get('/dashboard', authenticate, requirePermission('analytics:read'), async (req, res) => {
  try {
    // Statistiques basiques
    const stats = {
      users: {
        total: await User.count(),
        active: await User.count({ where: { isActive: true } }),
        newThisWeek: await User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      },
      products: {
        total: await Product.count(),
        active: await Product.count({ where: { isActive: true } }),
        lowStock: await Product.count({
          where: {
            stockQuantity: { [Op.lt]: 10 }
          }
        })
      },
      orders: {
        total: await Order.count(),
        pending: await Order.count({ where: { status: 'pending' } }),
        thisMonth: await Order.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/admin/users - Gestion utilisateurs
router.get('/users', authenticate, requirePermission('users:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

// PATCH /api/admin/users/:id/toggle-status - Activer/Désactiver un utilisateur
router.patch('/users/:id/toggle-status', authenticate, requirePermission('users:write'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.update({
      isActive: !user.isActive
    });

    logger.info(`User status toggled: ${req.params.id}`, { 
      adminId: req.user.id,
      newStatus: user.isActive 
    });

    res.json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive: user.isActive }
    });

  } catch (error) {
    logger.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
});

module.exports = router; 