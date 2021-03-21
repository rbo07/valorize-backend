'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    return queryInterface.changeColumn(
      'ratings',
      'criterion_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'criterions', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',      
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    
    // return queryInterface.dropTable('ratings');
  }
};