'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn(
      'ratings',
      'award_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'awards', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',      
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    
    // return queryInterface.dropTable('ratings');
  }
};