// const { Model, DataTypes } = require('sequelize');

// class AwardCriterion extends Model{
//     static init(sequelize){
//         super.init({
//             award_id: DataTypes.INTEGER,
//             criterion_id: DataTypes.INTEGER
//         }, {
//             sequelize,
//             tableName: 'awards_criterions'
//         })
//     }
//     static associate(models){
//         this.hasMany(models.Rating, { foreignKey: 'award_id', as: 'ratings_award'});
//         this.hasMany(models.Rating, { foreignKey: 'criterion_id', as: 'ratings_criterions'});
//     }
// }

// module.exports = AwardCriterion;