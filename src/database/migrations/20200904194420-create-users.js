'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    queryInterface.changeColumn(
      'users',
      'user_islogged',
      {
        type: Sequelize.BOOLEAN,
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
