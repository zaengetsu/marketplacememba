'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Invoices', 'userId', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('Invoices', 'totalHT', {
      type: Sequelize.DECIMAL(10,2)
    });
    await queryInterface.addColumn('Invoices', 'tva', {
      type: Sequelize.DECIMAL(10,2)
    });
    await queryInterface.addColumn('Invoices', 'totalTTC', {
      type: Sequelize.DECIMAL(10,2)
    });
    await queryInterface.addColumn('Invoices', 'pdfPath', {
      type: Sequelize.STRING
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Invoices', 'userId');
    await queryInterface.removeColumn('Invoices', 'totalHT');
    await queryInterface.removeColumn('Invoices', 'tva');
    await queryInterface.removeColumn('Invoices', 'totalTTC');
    await queryInterface.removeColumn('Invoices', 'pdfPath');
  }
};
