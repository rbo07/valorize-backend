'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.createTable('periods', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      period_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      period_initial_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      period_final_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }

    });

  },

  down: async (queryInterface, Sequelize) => {

    return queryInterface.dropTable('periods');
    
  }
};
