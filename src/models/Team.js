const { Model, DataTypes } = require('sequelize');

class Team extends Model{
    static init(sequelize){
        super.init({
            lider_id: DataTypes.INTEGER,
            team_name: DataTypes.STRING,
            team_description: DataTypes.STRING,
            status: DataTypes.BOOLEAN
        }, {
            sequelize,
            tableName: 'teams'
        })
    }
    static associate(models){
        this.belongsTo(models.User, { foreignKey: 'lider_id', as: 'leader'});
        this.belongsToMany(models.User, { foreignKey: 'team_id', through: 'users_teams', as: 'user'});
    }
}

module.exports = Team;