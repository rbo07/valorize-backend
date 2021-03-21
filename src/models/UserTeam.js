const { Model, DataTypes } = require('sequelize');

class UserTeam extends Model{
    static init(sequelize){
        super.init({
            user_id: DataTypes.INTEGER,
            team_id: DataTypes.INTEGER,
            status: DataTypes.BOOLEAN,
        }, {
            sequelize,
            tableName: 'users_teams'
        })
    }
    static associate(models){
        // this.hasMany(models.User, { foreignKey: 'user_id', as: 'users'});
        //this.hasMany(models.Team, { foreignKey: 'team_id', as: 'teams_users'});
    }
}

module.exports = UserTeam;