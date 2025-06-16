'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association avec User
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Association avec Invoice
      Order.hasMany(models.Invoice, {
        foreignKey: 'orderId',
        as: 'invoices'
      });
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      defaultValue: 'pending'
    },
    total: DataTypes.DECIMAL,
    shippingAddress: DataTypes.JSON,
    billingAddress: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};