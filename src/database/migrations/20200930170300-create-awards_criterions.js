'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('awards_criterions', 'awards_criterions_ibfk_2')
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
