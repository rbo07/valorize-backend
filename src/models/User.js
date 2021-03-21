const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

//Define os atributos que irão ser ocultados
const PROTECTED_ATTRIBUTES = ['user_password','createdAt', 'updatedAt']

class User extends Model{

    //Esconde os atributos
    toJSON () {
        let attributes = Object.assign({}, this.get())
        for (let a of PROTECTED_ATTRIBUTES) {
          delete attributes[a]
        }
        return attributes
      }

    static init(sequelize){
        super.init({
            user_name: DataTypes.STRING,
            user_email: DataTypes.STRING,
            user_password: DataTypes.STRING,
            user_address: DataTypes.STRING,
            user_phone: DataTypes.STRING,
            user_islogged: DataTypes.BOOLEAN,
            user_photo: DataTypes.STRING,
            status: DataTypes.BOOLEAN,
        }, {
            sequelize,
        })
    }

    static associate(models){
        this.hasMany(models.Average, { foreignKey: 'user_id', as: 'averages'});
        this.hasMany(models.Rating, { foreignKey: 'user_id', as: 'rating_user'});
        this.hasMany(models.Rating, { foreignKey: 'user_evaluator_id', as: 'rating_evaluator'});
        this.belongsTo(models.Role, { foreignKey: 'role_id', as: 'roles'});
        this.belongsToMany(models.Team, { foreignKey: 'user_id', through: 'users_teams', as: 'teams'});
    }
}

module.exports = User;