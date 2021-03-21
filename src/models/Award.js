const { Model, DataTypes } = require('sequelize');

class Award extends Model{
    static init(sequelize){
        super.init({
            award_name: DataTypes.STRING,
            award_description: DataTypes.STRING,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'awards'
        })
    }
    static associate(models){
        this.belongsTo(models.Period, { foreignKey: 'period_id', as: 'periods'});
        this.belongsTo(models.Criterion, { foreignKey: 'criterion_id', as: 'criterions'});

    }
}

module.exports = Award;