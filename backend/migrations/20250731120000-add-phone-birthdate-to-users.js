"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "phone", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Users", "birthDate", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "phone");
    await queryInterface.removeColumn("Users", "birthDate");
  }
};
