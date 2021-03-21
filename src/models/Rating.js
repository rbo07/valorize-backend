const { Model, DataTypes } = require('sequelize');

class Rating extends Model{
    static init(sequelize){
        super.init({
            user_id: DataTypes.INTEGER,
            user_evaluator_id: DataTypes.INTEGER,
            period_id: DataTypes.INTEGER,
            criterion_id: DataTypes.INTEGER,
            award_id: DataTypes.INTEGER,
            rating_score: DataTypes.INTEGER,
            tiebreak_id: DataTypes.INTEGER,
            final_score: DataTypes.INTEGER,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'ratings'
        })
    }
    static associate(models){
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user'});
        this.belongsTo(models.User, { foreignKey: 'user_evaluator_id', as: 'user_evaluator'});
        this.belongsTo(models.Tiebreaker, { foreignKey: 'tiebreak_id', as: 'tiebreakers'});
        this.belongsTo(models.Period, { foreignKey: 'period_id', as: 'periods'});
        this.belongsTo(models.Award, { foreignKey: 'award_id', as: 'awards'});
        this.belongsTo(models.Criterion, { foreignKey: 'criterion_id', as: 'criterions'});
        // this.belongsToMany(models.Criterion, { foreignKey: 'criterion_id', through: 'awards_criterions', as: 'criterions'});
        // this.belongsToMany(models.Award, { foreignKey: 'awards_id', through: 'awards_criterions', as: 'awards'});
    }
}

module.exports = Rating;