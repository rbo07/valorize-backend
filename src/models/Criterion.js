const { Model, DataTypes } = require('sequelize');

class Criterion extends Model{
    static init(sequelize){
        super.init({
            criterion_name: DataTypes.STRING,
            criterion_description: DataTypes.STRING,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'criterions'
        })
    }
    static associate(models){
        this.hasOne(models.Award, { foreignKey: 'criterion_id', as: 'awards'});
        this.belongsTo(models.Period, { foreignKey: 'period_id', as: 'periods'});
    }
}

module.exports = Criterion;