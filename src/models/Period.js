const { Model, DataTypes } = require('sequelize');

class Period extends Model{
    static init(sequelize){
        super.init({
            period_name: DataTypes.STRING,
            period_initial_date: DataTypes.DATE,
            period_final_date: DataTypes.DATE,
            period_activated: DataTypes.BOOLEAN,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'periods'
        })
    }
    static associate(models){
        this.hasMany(models.Award, { foreignKey: 'period_id', as: 'awards'});
        this.hasMany(models.Rating, { foreignKey: 'period_id', as: 'ratings'});
        this.hasMany(models.Criterion, { foreignKey: 'period_id', as: 'criterions'});
    }
}

module.exports = Period;