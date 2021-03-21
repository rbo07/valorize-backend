'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.createTable('criterions', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      period_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'periods', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      criterion_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      criterion_description: {
        type: Sequelize.STRING,
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

    return queryInterface.dropTable('criterions');
    
  }
};
