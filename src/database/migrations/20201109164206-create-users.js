'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // removeColumn(tableName: string, attributeName: string, options: Object)
    queryInterface.removeColumn(
      'users',
      'user_status'
    )
  },

  down: async (queryInterface, Sequelize) => {
      // logic for reverting the changes
      return queryInterface.removeColumn(
        'users',
        'user_status'
      );
    }
};
