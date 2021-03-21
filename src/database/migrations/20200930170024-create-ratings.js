'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('ratings', 'ratings_ibfk_4')
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
