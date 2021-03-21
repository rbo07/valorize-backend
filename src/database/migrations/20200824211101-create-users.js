'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.createTable('users', { 
      
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'roles', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_islogged: {
        type: Sequelize.BOOLEAN,
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

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.dropTable('users');
    
  }
};
