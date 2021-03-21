'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // return queryInterface.createTable('awards_criterions', {

    //   id: {
    //     type: Sequelize.INTEGER,
    //     primaryKey: true,
    //     autoIncrement: true,
    //     allowNull: false,
    //   },
    //   award_id: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: { model: 'awards', key: 'id'},
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //   },
    //   criterion_id: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: { model: 'criterions', key: 'id'},
    //     onUpdate: 'CASCADE',
    //     onDelete: 'CASCADE',
    //   },
    //   created_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //   },
    //   updated_at: {
    //     type: Sequelize.DATE,
    //     allowNull: false,
    //   }

    // });

  },

  down: async (queryInterface, Sequelize) => {

    return queryInterface.dropTable('awards_criterions');

  }
};
