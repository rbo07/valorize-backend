'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    queryInterface.changeColumn(
      'users',
      'user_password',
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
