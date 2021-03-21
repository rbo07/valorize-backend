const Sequelize = require('sequelize');
const dbConfig = require('../config/database.js');

const Award = require('../models/Award');
const Average = require('../models/Average');
const Criterion = require('../models/Criterion');
const Period = require('../models/Period');
const Role = require('../models/Role');
const Team = require('../models/Team');
const User = require('../models/User');
const Tiebreaker = require('../models/Tiebreaker');
// const AwardCriterion = require('../models/AwardCriterion');
const Rating = require('../models/Rating');
const UserTeam = require('../models/UserTeam');


const { username } = require('../config/database.js');
const connection = new Sequelize(dbConfig);

Award.init(connection);
Average.init(connection);
Criterion.init(connection);
Period.init(connection);
Role.init(connection);
Team.init(connection);
User.init(connection);
Tiebreaker.init(connection);
// AwardCriterion.init(connection);
Rating.init(connection);
UserTeam.init(connection);


Award.associate(connection.models);
Average.associate(connection.models);
Criterion.associate(connection.models);
Period.associate(connection.models);
Role.associate(connection.models);
Team.associate(connection.models);
User.associate(connection.models);
Tiebreaker.associate(connection.models);
// AwardCriterion.associate(connection.models);
Rating.associate(connection.models);
UserTeam.associate(connection.models);



// try{
//     connection.authenticate();
//     console.log('Conexão estabelecida com sucesso!');

// } catch (error){
//     console.error('Conexão não estabelecida', error);
// }

module.exports = connection;