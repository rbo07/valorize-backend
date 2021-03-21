const { Model, DataTypes } = require('sequelize');

class Average extends Model{
    static init(sequelize){
        super.init({
            user_id: DataTypes.INTEGER,
            period_id: DataTypes.INTEGER,
            average: DataTypes.INTEGER,
            status: DataTypes.BOOLEAN,
        }, {
            sequelize,
            tableName: 'averages'
        })
    }
    static associate(models){
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'users'});
        this.belongsTo(models.Period, { foreignKey: 'period_id', as: 'periods'});
    }
}

module.exports = Average;