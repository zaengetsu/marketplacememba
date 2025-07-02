'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association avec Category
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    salePrice: DataTypes.DECIMAL,
    isOnSale: DataTypes.BOOLEAN,
    stockQuantity: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    images: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    // ↑ AJOUTEZ CETTE LIGNE ↑
    slug: DataTypes.STRING,
    status: DataTypes.ENUM('draft', 'active', 'inactive'),
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};