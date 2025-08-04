'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // // Ajouter la colonne images
    // await queryInterface.addColumn('Products', 'images', {
    //   type: Sequelize.JSONB,
    //   allowNull: true,
    //   defaultValue: []
    // });

    // Ajouter la colonne slug
    await queryInterface.addColumn('Products', 'slug', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Ajouter la colonne status
    await queryInterface.addColumn('Products', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'draft'
    });

    // Ajouter la colonne isActive
    await queryInterface.addColumn('Products', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Products', 'images');
    await queryInterface.removeColumn('Products', 'slug');
    await queryInterface.removeColumn('Products', 'status');
    await queryInterface.removeColumn('Products', 'isActive');
  }
};