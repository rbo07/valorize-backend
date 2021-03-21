const { Model, DataTypes } = require('sequelize');

class Tiebreaker extends Model{
    static init(sequelize){
        super.init({
            tiebreaker_name: DataTypes.STRING,
            tiebreaker_weight: DataTypes.INTEGER,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'tiebreakers'
        })
    }
    static associate(models){
        this.hasMany(models.Rating, { foreignKey: 'tiebreak_id', as: 'ratings'});
        //this.belongsToMany(models.Criterion, { foreignKey: 'award_id', through: 'awards_criterions', as: 'criterions'});
    }
}

module.exports = Tiebreaker;