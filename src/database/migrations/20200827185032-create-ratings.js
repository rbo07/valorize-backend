'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.createTable('ratings', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_evaluator_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      period_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'periods', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      criterion_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'awards_criterions', key: 'criterion_id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      award_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'awards_criterions', key: 'award_id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      rating_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tiebreak_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tiebreakers', key: 'id'},
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      final_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

  down: async (queryInterface, Sequelize) => {

    return queryInterface.dropTable('ratings');
    
  }
};
