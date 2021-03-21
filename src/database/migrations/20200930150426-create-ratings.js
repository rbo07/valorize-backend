'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeConstraint('ratings', 'ratings_ibfk_4')
    queryInterface.removeConstraint('ratings', 'ratings_ibfk_5')
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
