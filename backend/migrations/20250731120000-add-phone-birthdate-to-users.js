"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajoute la colonne phone si elle n'existe pas
    const table = await queryInterface.describeTable('Users');
    if (!table.phone) {
      await queryInterface.addColumn('Users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    // Ajoute la colonne birthDate si elle n'existe pas
    if (!table.birthDate) {
      await queryInterface.addColumn('Users', 'birthDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "phone");
    await queryInterface.removeColumn("Users", "birthDate");
  }
};
