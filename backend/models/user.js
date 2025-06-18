'use strict';
const {
  Model
} = require('sequelize');
const crypto = require('crypto');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association avec Order
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      });
    }

    generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM,
      values: ['ROLE_USER', 'ROLE_STORE_KEEPER', 'ROLE_COMPTA', 'ROLE_ADMIN'],
      defaultValue: 'ROLE_USER'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};