'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association avec Order
      Invoice.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }
  Invoice.init({
    orderId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    invoiceNumber: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    totalHT: DataTypes.DECIMAL,
    tva: DataTypes.DECIMAL,
    totalTTC: DataTypes.DECIMAL,
    pdfPath: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM,
      values: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      defaultValue: 'draft'
    },
    issuedAt: DataTypes.DATE,
    dueAt: DataTypes.DATE,
    paidAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};