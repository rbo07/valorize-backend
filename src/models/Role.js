const { Model, DataTypes } = require('sequelize');

//Define os atributos que irão ser ocultados
const PROTECTED_ATTRIBUTES = ['createdAt', 'updatedAt']

class Role extends Model{

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
            role_name: DataTypes.STRING,
            role_access: DataTypes.INTEGER,
            role_description: DataTypes.STRING,
            status: DataTypes.BOOLEAN
        }, {
            sequelize
        })
    }
    static associate(models){
        this.hasMany(models.User, { foreignKey: 'role_id', as: 'user'});
    }
}

module.exports = Role;