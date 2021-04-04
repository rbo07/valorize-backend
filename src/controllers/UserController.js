const Average = require('../models/Average');
const Award = require('../models/Award');
const User = require('../models/User');
const Criterion = require('../models/Criterion');
const Team = require('../models/Team');
const Role = require('../models/Role');
const Rating = require('../models/Rating');
const Period = require('../models/Period');
const UserTeam = require('../models/UserTeam');
const { cloudinary } = require('../cloudinary');

const bcrypt = require('bcryptjs');



// JWT Authentication
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        // valor em segundos (21,75 Horas)
        expiresIn: 78300,
    });
}

module.exports = {
    //Login
    async login(req, res) {

        try {

            const { user_email, user_password } = req.body;

            const user = await User.findOne({
                where: { user_email, status: true }
            });

            if (user == null) {
                return res.json({
                    success: false,
                    message: 'Email ou senha incorreto!'
                });
            }

            const role = await User.findOne({
                where: { user_email, status: true },
                include: [
                    {
                        attributes: ['role_access'],
                        as: 'roles',
                        model: Role,
                    }]
            });

            function checkRole(data) {
                if (data == null) {
                    return null
                } else {
                    return data.role_access
                }
            }

            //Pega o valor de acesso de acordo com a função
            const role_access = checkRole(role.roles)


            //Validação da Senha Criptografada
            if (!bcrypt.compareSync(user_password, user.user_password)) {
                return res.json({
                    success: false,
                    message: 'Senha incorreta!',
                    user: {}
                });
            }

            const user_id = user.id;

            // Atualiza a coluna isLogged na tabela, caso o usuário esteja logado 
            await User.update({ user_islogged: true }, { where: { id: user_id, status: true } });

            // esconde a senha no retorno
            user.user_password = undefined

            // JWT - Passando objeto com o ID do usuário
            const token = generateToken({ id: user_id })

            return res.json({
                success: true,
                message: 'Usuário logado com Sucesso!',
                // user,
                user_id,
                token,
                role_access
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Logout
    async logout(req, res) {

        try {
            const { user_id, user_islogged } = req.body;

            // Atualiza a coluna isLogged no banco 
            await User.update({ user_islogged: false }, { where: { id: user_id, status: true } });

            return res.json({
                success: true,
                message: 'Usuário Deslogado com Sucesso!'
            });

        } catch (error) {
            return res.json({
                error: 'Algo de errado ocorreu no servidor!'
            });
        }
    },
    // Login Google oAuth
    async loginGoogle(req, res) {

        try {
            const { user_email, user_name } = req.body;

            const user = await User.findOne({
                where: { user_email },
                include: [
                    {
                        attributes: ['role_access'],
                        as: 'roles',
                        model: Role,
                    }]
            });

            function checkRole(data) {
                if (data == null) {
                    return null
                } else {
                    return data.role_access
                }
            }

            // Se o usuário existir no banco ou existir desabilitado
            if (user !== null) {
                const user_id = user.id;


                //Pega o valor de acesso de acordo com a função
                const role_access = checkRole(user.roles)

                // Atualiza a coluna isLogged na tabela, caso o usuário esteja logado 
                await User.update({ user_islogged: true, status: true }, { where: { id: user_id } });

                // JWT - Passando objeto com o ID do usuário
                const token = generateToken({ id: user_id })


                return res.json({
                    success: true,
                    message: 'Usuário Logado com Sucesso!',
                    user_id,
                    token,
                    role_access
                });

            } else {

                let new_user = await User.create({ user_email, user_name, status: true })
                const user_id = new_user.id;

                // JWT - Passando objeto com o ID do usuário
                const token = generateToken({ id: user_id })

                role_access = null

                return res.json({
                    success: true,
                    message: 'Usuário Cadastrado com Sucesso!',
                    user_id,
                    token,
                    role_access
                });
            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    // Dados Header
    async getDataHeader(req, res) {

        try {
            const { user_id } = req.params;

            const leader = await Team.findOne({ where: { lider_id: user_id, status: true } })

            function checkTeam(data) {
                if (data == null) { return null }
                else { return data.team_name }
            }

            const teamLeader = checkTeam(leader)

            const dataHeader = await User.findOne({
                where: { id: user_id, status: true },
                include: [
                    {
                        attributes: ['role_name'],
                        as: 'roles',
                        model: Role,
                    },
                    {
                        attributes: ['team_name'],
                        as: 'teams',
                        model: Team,
                    }
                ]
            });

            if (dataHeader == '' || dataHeader == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            return res.json({
                success: true,
                dataHeader,
                teamLeader,
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Telas de CRUD
    async listUsersData(req, res) {

        try {

            const { user_id } = req.params;

            //Verifica se o usuário existe
            const user = await User.findOne({
                where: { id: user_id, status: true },
            });

            if (user == '' || user == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            //Verifica se o usuário tem função
            if (user.role_id == '' || user.role_id == null) {
                return res.status(200).send({ message: 'Usuário sem função cadastrada!' })
            }

            const roleId = user.role_id

            // Acha o nível de acesso do usuário
            const role = await Role.findOne({
                where: { id: roleId, status: true },
            });

            const roleAccess = role.role_access

            if (roleAccess == 1) {

                const allUsers = await User.findAll({
                    where: { status: true },
                    include: [
                        {
                            attributes: ['role_name'],
                            as: 'roles',
                            model: Role,
                        },
                        {
                            attributes: ['team_name'],
                            as: 'teams',
                            model: Team,
                        }]
                });

                return res.json({ success: true, allUsers });

            } else if (roleAccess == 2) {

                // Acha o Team do Usuário
                const team = await Team.findOne({
                    where: { lider_id: user_id, status: true },
                });

                // Retorna se não houver equipe subordinada
                if (team == '' || team == null) {
                    return res.status(200).send({ message: 'Líder sem equipe subordinada.' })
                }

                const teamId = team.id

                const usersTeamIds = await UserTeam.findAll({
                    where: { team_id: teamId, status: true },
                    attributes: ['user_id'],
                });

                // // Transforma em Array de IDs apenas
                function setToId() {
                    let size = usersTeamIds.length
                    let usersId = []

                    for (var i = 0; i < size; i++) {

                        let x = usersTeamIds[i].toJSON();
                        let y = JSON.parse(Object.values(x));
                        usersId[i] = y;
                    }
                    return usersId
                }

                // Busca no modelo Averages as Médias e Nomes dos Usuários
                const idUsers = setToId()
                const usersTeam1 = []

                // Remove do array o ID do próprio usuário (user_id)
                const index = idUsers.indexOf(JSON.parse(user_id));
                if (index > -1) {
                    idUsers.splice(index, 1);
                }

                for (var i = 0; i < idUsers.length; i++) {

                    usersTeam1[i] = await User.findOne({
                        where: {
                            id: idUsers[i],
                            status: true
                        },
                        attributes: ['id', 'user_name', 'user_email', 'user_address', 'user_phone'],
                        include: [
                            {
                                attributes: ['role_name'],
                                as: 'roles',
                                model: Role,
                            }]
                    })
                }

                // Remove os usuários nulos
                const usersTeam = usersTeam1.filter(function (el) {
                    return el != null;
                });

                if (usersTeam.length == 0) {
                    return res.status(200).json({
                        success: false,
                        teamId,
                        message: 'Nenhum subordinado cadastrado na minha equipe.'
                    })

                } else {
                    return res.json({
                        success: true,
                        teamId,
                        usersTeam
                    });
                }


            } else if (roleAccess == 3) {

                return res.json({
                    success: false,
                    message: 'Acesso não permitido!'
                });

            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //LookUp de Usuários
    async listUserLookUp(req, res) {

        try {

            const users = await User.findAll({
                where: {
                    status: true
                },
                attributes: ['id', 'user_name'],
            });

            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhuma usuário cadastrado' })
            }

            return res.status(200).json({
                success: true,
                users
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //LookUp de Usuários Líderes
    async listUserLookUpLeader(req, res) {

        try {

            const roles = await Role.findAll({
                where: { role_access: 2, status: true }
            });

            const getUsers = []
            for (i = 0; i < roles.length; i++) {
                let temp = await User.findAll({
                    attributes: ['id', 'user_name'],
                    where: { role_id: roles[i].id, status: true }
                });

                if (temp !== null) {
                    getUsers.push({ users: temp })
                }
            }

            if (getUsers.length == 0) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            // Monta o objeto de retorno
            const users = []
            for (i = 0; i < getUsers.length; i++) {
                let size = getUsers[i].users.length
                for (j = 0; j < size; j++) {
                    let temp = getUsers[i].users[j]
                    users.push(temp)
                }
            }

            if (users.length == 0) {
                return res.status(200).send({ message: 'Nenhum líder cadastrado' })
            }

            return res.status(200).json({
                success: true,
                users
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Listar Usuários por ID - Tela de Edição
    async listUserID(req, res) {

        try {
            const { user_id } = req.params;
            const users = await User.findOne({
                where: { id: user_id, status: true },
                attributes: ['user_name', 'user_email', 'user_address', 'user_phone', 'user_photo'],
                include: [
                    {
                        attributes: ['id', 'role_name'],
                        as: 'roles',
                        model: Role,
                    },
                    {
                        attributes: ['id', 'team_name'],
                        as: 'teams',
                        model: Team,
                    }
                ]
            });

            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            return res.json({ success: true, users });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Lista a Equipe do Usuário Líder e suas Funções - DASHBOARD LÍDER
    async listUsersRolesTeam(req, res) {

        try {

            const { data_id } = req.params;

            const result = data_id.split(':');

            const user_id = result[0]
            const period_id = result[1]

            // Acha o último período cadastrado
            const period_temp = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            if (period_temp == '' || period_temp == null) {
                return res.status(200).send({ message: 'Nenhum período ativo no momento.' })
            }

            function setFilter(dataId, dataPeriod) {
                if (dataId == 0) {
                    return dataPeriod.id
                } else { return dataId }
            }
            const lastPeriod = setFilter(period_id, period_temp)

            // Acha o período enviado pelo filtro
            const period = await Period.findOne({
                where: { id: lastPeriod, status: true }
            });

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Nenhum período encontrado.' })
            }

            // Verifica se o usuário existe
            const user = await User.findOne({
                where: { id: user_id, status: true }
            });

            if (user == '' || user == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            const userName = user.user_name

            // Acha o Team do Usuário
            const team = await Team.findOne({
                where: { lider_id: user_id, status: true },
            });

            if (team == '' || team == null) {
                return res.status(200).send({ message: 'Líder sem equipe subordinada.' })
            }

            const teamName = team.team_name
            const teamId = team.id

            //Acha os usuário do time
            const usersTeam = await UserTeam.findAll({
                where: { team_id: teamId, status: true },
                attributes: ['user_id'],
            });

            if (usersTeam == '' || usersTeam == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado na minha equipe.' })
            }

            // // Transforma em Array de IDs apenas
            function setToId() {
                let size = usersTeam.length
                let usersId = []

                for (var i = 0; i < size; i++) {

                    let x = usersTeam[i].toJSON();
                    let y = JSON.parse(Object.values(x));
                    usersId[i] = y;

                }
                return usersId
            }

            // // Busca os Usuários do Team e suas funções
            const idUsers = setToId()
            const myTeam = []

            // Remove do array o ID do Líder (user_id)
            const index = idUsers.indexOf(JSON.parse(user_id));
            if (index > -1) {
                idUsers.splice(index, 1);
            }

            for (var i = 0; i < idUsers.length; i++) {
                let user = []
                let average = []

                user = await User.findOne({
                    where: {
                        id: idUsers[i],
                        status: true
                    },
                    attributes: ['id', 'user_name', 'user_photo'],
                    include: [
                        {
                            attributes: ['role_name'],
                            as: 'roles',
                            model: Role,
                        }]
                })

                average = await Average.findOne({
                    where: {
                        user_id: idUsers[i],
                        period_id: lastPeriod,
                        status: true
                    },
                    attributes: ['average'],
                })

                myTeam.push({ user, average })
            }

            return res.status(200).json({
                success: true,
                userName,
                teamName,
                myTeam,
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //LISTA EQUIPE E CRITÉRIOS DE AVALIAÇÃO NO PERÍODO ATIVO - TELA DE AVALIAÇÃO - LÍDER
    async evaluation(req, res) {

        try {

            const { user_id } = req.params;

            // Acha o Período Ativo
            const period = await Period.findOne({
                where: { period_activated: true, status: true },
            });

            if (period == '' || period == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriod = period.id
            const lastPeriodName = period.period_name

            // Acha o Team do Usuário
            const team = await Team.findOne({
                where: { lider_id: user_id, status: true },
            });


            if (team == '' || team == null) {
                return res.status(200).json({
                    success: 0,
                    lastPeriodName,
                    message: 'Líder sem equipe subordinada.'
                })
            }
            const teamID = team.id

            const usersTeam = await UserTeam.findAll({
                where: { team_id: teamID, status: true }
            });

            if (usersTeam == '' || usersTeam == null) {
                return res.status(200).json({
                    success: 0,
                    lastPeriodName,
                    message: 'Nenhum usuário cadastrado na minha equipe.'
                })
            }

            // // Transforma em Array de IDs apenas
            function setToId() {
                let size = usersTeam.length
                let usersId = []

                for (var i = 0; i < size; i++) {
                    usersId[i] = usersTeam[i].user_id;
                }
                return usersId
            }

            const idUsers = setToId()
            const myTeam = []

            // Remove do array o ID do Líder (user_id)
            const index = idUsers.indexOf(JSON.parse(user_id));
            if (index > -1) {
                idUsers.splice(index, 1);
            }

            // Verifica se avaliação já existe e retorna avaliação já cadastrada previamente
            const usersAverages = []

            // let rating = await Rating.findAll({
            const usersEvaluated = await Rating.findAll({
                where: { user_evaluator_id: user_id, period_id: lastPeriod, status: true },
                attributes: ['rating_score'],
                include: [
                    {
                        attributes: ['id', 'user_name', 'user_photo'],
                        as: 'user',
                        model: User,
                    },
                    {
                        attributes: ['criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            })

            // Busca as médias dos usuários
            for (i = 0; i < idUsers.length; i++) {
                let average = await Average.findOne({
                    where: { user_id: idUsers[i], period_id: lastPeriod, status: true },
                })
                if (average !== null) {
                    usersAverages.push(average.average)
                } else {
                    usersAverages.push(0)
                }
            }

            // Remove os usuários sem médias
            const usersEvaluatedFinal = usersEvaluated.filter(function (el) {
                return el != null;
            });

            // Verifica usuários não avaliados
            function getUnrated(data, ids) {
                if (data.length > 0) {
                    let size = data.length
                    let result = ids
                    for (let i = 0; i < size; i++) {
                        if (result.includes(data[i].user.id)) {

                            let index = result.indexOf(data[i].user.id);
                            result.splice(index, 1);
                        }
                    }
                    return result
                } else {
                    return result = []
                }

            }

            const unratedUsers = getUnrated(usersEvaluatedFinal, idUsers)

            // Busca os nomes dos usuários que não foram avaliados
            const unratedUsersFinal = []

            if (unratedUsers.length > 0) {
                for (let i = 0; i < unratedUsers.length; i++) {
                    let temp = await User.findOne({
                        where: { id: unratedUsers[i], status: true },
                        attributes: ['user_name']
                    });
                    unratedUsersFinal.push(temp)
                }
            }

            // Faz a verificação se os usuários foram avaliados e retorna ou tela de avaliação ou notas dos usuários
            if (usersEvaluatedFinal.length > 0) {

                return res.status(200).json({
                    success: 1,
                    lastPeriodName,
                    usersEvaluatedFinal,
                    usersAverages,
                    unratedUsersFinal,
                });

            } else {

                // Acha Critérios do Período Ativo
                const criterionsLastPeriod = await Criterion.findAll({
                    where: { period_id: lastPeriod, status: true },
                    attributes: ['id', 'criterion_name']
                });

                if (criterionsLastPeriod == '' || criterionsLastPeriod == null) {
                    return res.status(200).json({
                        success: 0,
                        lastPeriodName,
                        message: 'Nenhum Critério cadastrado para este período!'
                    })
                }

                for (var i = 0; i < idUsers.length; i++) {

                    myTeam[i] = await User.findOne({
                        where: { id: idUsers[i], status: true },
                        attributes: ['id', 'user_name', 'user_photo'],
                        include: [
                            {
                                attributes: ['role_name'],
                                as: 'roles',
                                model: Role,
                            }]
                    })
                }

                return res.status(200).json({
                    success: 2,
                    myTeam,
                    criterionsLastPeriod,
                    lastPeriodName,
                    lastPeriod
                });
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }


    },
    //Listar Usuários e Médias Associadas - DASHBOARD LÍDER
    async listUsersAverages(req, res) {

        try {

            const users = await User.findAll({
                where: { status: true },
                attributes: ['user_name'],
                include: [
                    {
                        attributes: ['user_id', 'period_id', 'average'],
                        as: 'averages',
                        model: Average,
                    }]
            });

            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            return res.status(200).send(users);

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Usuários e Avaliações - DASHBOARD LÍDER
    async listUsersRatings(req, res) {

        try {

            const users = await User.findAll({
                where: { status: true },
                attributes: ['user_name', 'user_email'],
                include: [
                    {
                        attributes: ['user_evaluator_id', 'period_id', 'criterion_id', 'rating_score'],
                        as: 'rating_user',
                        model: Rating,
                    }]
            });

            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            return res.status(200).send(users);

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Premiações de Usuário Específico ID - DASHBOARD USUÁRIO BÁSICO
    async listUsersAwards(req, res) {

        try {
            const { user_id } = req.params;

            //Busca usuários e premiações (IDs) associadas
            const users = await User.findOne({
                where: { id: user_id, status: true },
                attributes: [],
                include: [
                    {
                        attributes: ['award_id'],
                        as: 'rating_user',
                        model: Rating,
                    }]
            });

            //Verifica se existe usuário cadastrado
            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhum usuário cadastrado' })
            }

            //Pega os IDs no objeto Users
            const awardsId = users.rating_user.filter(function (el) {
                return JSON.parse(el.award_id)
            });

            // Transforma em Array de IDs apenas
            function getAwards() {
                let size = awardsId.length
                let awards = []

                for (var i = 0; i < size; i++) {

                    let x = awardsId[i].toJSON();
                    let y = JSON.parse(Object.values(x));
                    awards[i] = y;
                }
                return awards
            }

            // Busca no modelo Awards os nomes dos prêmios
            const idAwards = getAwards()
            const awards = []

            for (var i = 0; i < idAwards.length; i++) {

                let temp = await Award.findOne({
                    where: { id: idAwards[i], status: true },
                    attributes: ['award_name']
                })
                if (temp !== null) {
                    awards.push(temp)
                }
            }

            //Verifica se existe premiação
            if (awards.length == 0) {
                return res.status(200).send({ message: 'Nenhuma premiação cadastrada' })

            } else {
                // Retorna premiações do usuário
                return res.status(200).json({
                    success: true,
                    awards
                });
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Listar Ranking Equipe e Geral - DASHBOARD LÍDER E SUPER
    async listRanking(req, res) {

        try {
            const { data_id } = req.params;

            const result = data_id.split(':');

            const user_id = result[0]
            const period_id = result[1]

            // Acha o último período cadastrado
            const period_temp = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            if (period_temp == '' || period_temp == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            function setFilter(dataId, dataPeriod) {
                if (dataId == 0) {
                    return dataPeriod.id
                } else { return dataId }
            }
            const lastPeriod = setFilter(period_id, period_temp)

            // Acha o período enviado pelo filtro
            const period = await Period.findOne({
                where: { id: lastPeriod, status: true }
            });

            if (period == '' || period == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriodName = period.period_name


            // Acha o ID da função do usuário
            const role = await User.findOne({ where: { id: user_id, status: true } });
            const roleId = role.role_id

            const roleAccess = await Role.findOne({ where: { id: roleId, status: true } });

            function checkRole(data) {
                if (data == null) {
                    return null
                } else { return data.role_access }
            }
            const role_access = checkRole(roleAccess)

            //Função de Super Usuário - Envia Ranking Geral
            if (role_access == 1) {

                const rankingInicial = await Average.findAll({
                    where: { period_id: lastPeriod, status: true },
                    attributes: ['average'],
                    order: [
                        ['average', 'DESC']
                    ],
                    include: [
                        {
                            attributes: ['user_name'],
                            as: 'users',
                            model: User,
                        }]
                });

                if (rankingInicial == '' || rankingInicial == null) {
                    return res.status(200).json({
                        lastPeriodName,
                        message: 'Nenhum usuário encontrado!'
                    })
                }

                // Remove os usuários sem médias
                const rankingMeso = rankingInicial.filter(function (el) {
                    return el.average != null;
                });

                // Remove os usuários nulos
                const newRanking = rankingMeso.filter(function (el) {
                    return el.users != null;
                });

                const ranking = []

                for (let i = 0; i < newRanking.length; i++) {
                    let temp_score = null
                    if (newRanking[i].average > 100) {
                        temp_score = 100
                    } else {
                        temp_score = newRanking[i].average
                    }
                    ranking.push({ position: i + 1 + 'º', name: newRanking[i].users.user_name, score: temp_score })
                }


                return res.status(200).json({
                    success: true,
                    lastPeriodName,
                    ranking,
                });

                //Função Básica de Usuário ou Função de Líder de Equipe
            } else if (role_access == 2) {

                // Acha o Team do Usuário
                const team = await Team.findOne({
                    where: { lider_id: user_id, status: true },
                    attributes: ['id'],
                });

                if (team == '' || team == null) {
                    return res.status(200).json({
                        lastPeriodName,
                        message: 'Líder sem equipe subordinada.'
                    })
                }
                const teamId = team.id


                const usersTeam = await UserTeam.findAll({
                    where: { team_id: teamId, status: true }
                });

                if (usersTeam == '' || usersTeam == null) {
                    return res.status(200).json({
                        lastPeriodName,
                        message: 'Nenhum usuário cadastrado na minha equipe.'
                    })
                }

                // Transforma em Array de IDs apenas
                function setToId() {
                    let size = usersTeam.length
                    let usersId = []
                    for (var i = 0; i < size; i++) {
                        usersId[i] = usersTeam[i].user_id;
                    }
                    return usersId
                }

                // Busca no modelo Averages as Médias e Nomes dos Usuários
                const idUsers = setToId()
                const averagesRanking = []

                // Remove do array o ID do próprio usuário (user_id)
                const index = idUsers.indexOf(JSON.parse(user_id));
                if (index > -1) {
                    idUsers.splice(index, 1);
                }

                for (var i = 0; i < idUsers.length; i++) {
                    averagesRanking[i] = await Average.findOne({
                        where: {
                            user_id: idUsers[i],
                            period_id: lastPeriod,
                            status: true
                        },
                        attributes: ['average'],
                        include: [
                            {
                                attributes: ['user_name'],
                                as: 'users',
                                model: User,
                            }]
                    })
                }

                if (averagesRanking == '' || averagesRanking == null) {
                    return res.status(200).json({
                        message: 'Nenhuma avaliação cadastrada neste período!',
                        lastPeriodName
                    })
                }

                // Remove os usuários sem médias
                const averagesRankingFinal = averagesRanking.filter(function (el) {
                    return el != null;
                });

                if (averagesRankingFinal == '' || averagesRankingFinal == null) {
                    return res.status(200).json({
                        message: 'Nenhuma média cadastrada neste período!',
                        lastPeriodName
                    })
                }

                // Ordena o Ranking pela maior nota
                const newRanking = averagesRankingFinal.slice().sort((a, b) => b.average - a.average);

                const ranking = []

                for (let i = 0; i < newRanking.length; i++) {
                    let temp_score = null
                    if (newRanking[i].average > 100) {
                        temp_score = 100
                    } else {
                        temp_score = newRanking[i].average
                    }
                    ranking.push({ position: i + 1 + 'º', name: newRanking[i].users.user_name, score: temp_score })
                }

                return res.status(200).json({
                    success: true,
                    ranking,
                    lastPeriodName
                });

            } else if (role_access == 3 || role_access == null) {

                // Acha o Usuário
                const user = await User.findOne({ where: { id: user_id, status: true } });
                const userName = user.user_name

                // Acha o Team do Usuário
                const team = await UserTeam.findOne({ where: { user_id, status: true } });

                if (team == '' || team == null) {
                    return res.status(200).json({
                        lastPeriodName,
                        message: 'Usuário não está cadastrado a uma equipe!'
                    })
                }

                const teamId = team.team_id;

                const usersTeam = await UserTeam.findAll({
                    where: { team_id: teamId, status: true },
                    attributes: ['user_id'],
                });

                // Transforma em Array de IDs apenas
                function setToId() {
                    let size = usersTeam.length
                    let usersId = []
                    for (var i = 0; i < size; i++) { usersId[i] = usersTeam[i].user_id; }
                    return usersId
                }

                // Busca no modelo Averages as Médias e Nomes dos Usuários
                const idUsers = setToId()
                const averagesRanking = []

                for (var i = 0; i < idUsers.length; i++) {

                    averagesRanking[i] = await Average.findOne({
                        where: {
                            user_id: idUsers[i],
                            period_id: lastPeriod,
                            status: true
                        },
                        attributes: ['average', 'period_id'],
                        include: [
                            {
                                attributes: ['id', 'user_name'],
                                as: 'users',
                                model: User,
                            }]
                    });
                }
                // Remove os usuários sem médias
                const averagesRankingFinal = averagesRanking.filter(function (el) {
                    return el != null;
                });

                if (averagesRankingFinal == '' || averagesRankingFinal == null) {
                    return res.status(200).json({
                        lastPeriodName,
                        message: 'Nenhum usuário desta equipe possui avaliação neste período!'
                    })
                }

                // Ordena o Ranking pela maior nota
                const ranking = averagesRankingFinal.slice().sort((a, b) => b.average - a.average);


                //Acha o usuário e a colocação
                function getPosition() {
                    let position = '';

                    for (var i = 0; i < ranking.length; i++) {

                        if (ranking[i].users.id == JSON.parse(user_id)) {
                            position = i;
                        }
                    }
                    return position + 1 + 'º Colocado'

                }

                const position = getPosition();

                return res.status(200).json({
                    success: true,
                    lastPeriodName,
                    ranking,
                    position,
                    userName,
                });

            }

        } catch (err) {
            return res.status(400).json({
                error: err
            })
        }

    },

    //Criar Usuário através da Tela de Registro
    async register(req, res) {

        try {

            const { user_name, user_email, user_address, user_phone, password_user } = req.body;

            const userEmail = await User.findOne({
                where: { user_email, status: true },
                attributes: ['user_email'],
            })

            // Checa se o email existe
            function checkIfExist(email) {
                let emailString = ''
                if (email !== null) {
                    let x = email.toJSON();
                    emailString = String(Object.values(x));
                    return emailString
                } else {
                    return email
                }
            }

            const emaillUser = checkIfExist(userEmail);

            if (user_email == emaillUser) {

                return res.status(200).json({
                    message: 'Usuário já está cadastrado!'
                })

            } else {

                // VERIFICA FOTO
                function checkPhoto(data) {
                    let url = req.protocol + '://' + req.get('host')
                    if (data !== undefined) {
                        return url + '/' + req.file.path
                    } else {
                        return null
                    }
                }

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    //CRIPTOGRAFA A SENHA
                    const salt = bcrypt.genSaltSync();
                    const user_password = bcrypt.hashSync(password_user, salt);

                    // GRAVA NO BANCO COM FOTO
                    await User.create({ user_name, user_email, user_address, user_phone, user_password, user_photo, status: true });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuario cadastrado com sucesso!'
                    })

                } else {

                    //CRIPTOGRAFA A SENHA
                    const salt = bcrypt.genSaltSync();
                    const user_password = bcrypt.hashSync(password_user, salt);

                    // GRAVA NO BANCO SEM FOTO
                    await User.create({ user_name, user_email, user_address, user_phone, user_password, status: true });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuario cadastrado com sucesso!'
                    })

                }
            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    // Criar Usuário através da tela AddUser (Super Administrador)
    async addUser(req, res) {

        try {
            const { user_name, user_email, user_address, user_phone, id_team, role_id, password_user } = req.body;

            const userEmail = await User.findOne({
                where: { user_email, status: true },
                attributes: ['user_email'],
            })

            // // Checa se o email existe
            function checkIfExist(email) {
                let emailString = ''
                if (email !== null) {
                    let x = email.toJSON();
                    emailString = String(Object.values(x));
                    return emailString
                } else {
                    return email
                }
            }

            const emaillUser = checkIfExist(userEmail);

            if (user_email == emaillUser) {

                return res.status(200).json({
                    message: 'Usuário já está cadastrado!'
                })

            } else {

                // CRIPTOGRAFA A SENHA
                const salt = bcrypt.genSaltSync();
                const user_password = bcrypt.hashSync(password_user, salt);

                function checkRoleIDIsNull(role) {
                    if (role == 'null') {
                        return null
                    } else {
                        return JSON.parse(role)
                    }
                }

                const roleId = checkRoleIDIsNull(role_id)

                // VERIFICA FOTO
                function checkPhoto(data) {
                    let url = req.protocol + '://' + req.get('host')
                    if (data !== undefined) {
                        return url + '/' + req.file.path
                    } else {
                        return null
                    }
                }

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // GRAVA NO BANCO COM FOTO
                    let user = await User.create({ user_name, user_email, user_address, user_phone, role_id: roleId, user_password, user_photo, status: true, });

                    if (id_team !== 'null') {


                        const team_id = Number(id_team)
                        let user_id = user.id

                        await UserTeam.create({ user_id, team_id, status: true });

                        // Checa se o usuário é líder
                        const role = await Role.findOne({ where: { id: role_id, status: true }, })

                        function checkRoleIsNull(role) {
                            if (role == null) {
                                return null
                            } else {
                                return role.role_access
                            }
                        }

                        const roleAccess = checkRoleIsNull(role)

                        if (roleAccess == 2) {
                            await Team.update({ lider_id: user_id }, {
                                where: { id: team_id, status: true },
                            })
                        }

                        return res.status(200).json({
                            success: true,
                            roleAccess,
                            message: 'Usuario cadastrado com sucesso!',
                        })
                    }

                } else {

                    // GRAVA NO BANCO SEM FOTO
                    let user = await User.create({ user_name, user_email, user_address, user_phone, role_id: roleId, user_password, status: true, });

                    if (id_team !== 'null') {


                        const team_id = Number(id_team)
                        let user_id = user.id

                        await UserTeam.create({ user_id, team_id, status: true });

                        // Checa se o usuário é líder
                        const role = await Role.findOne({ where: { id: role_id, status: true }, })

                        function checkRoleIsNull(role) {
                            if (role == null) {
                                return null
                            } else {
                                return role.role_access
                            }
                        }

                        const roleAccess = checkRoleIsNull(role)

                        if (roleAccess == 2) {
                            await Team.update({ lider_id: user_id }, {
                                where: { id: team_id, status: true },
                            })
                        }

                        return res.status(200).json({
                            success: true,
                            roleAccess,
                            message: 'Usuario cadastrado com sucesso!',
                        })
                    }

                }

                return res.status(200).json({
                    success: true,
                    roleAccess: null,
                    message: 'Usuario cadastrado com sucesso!',
                })


            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar - Tela Meus Dados - View BÁSICO, LÍDER E SUPER
    async update(req, res) {

        try {

            const { user_name, user_email, user_address, user_phone, password_user } = req.body;
            const { user_id } = req.params;

            // VERIFICA SENHA
            function checkPassWord(data) {
                if (data == '' || data == 'undefined') {
                    return undefined

                } else {
                    // CRIPTOGRAFA A SENHA
                    let salt = bcrypt.genSaltSync();
                    let senha = bcrypt.hashSync(data, salt);
                    return senha
                }
            }

            const user_password = checkPassWord(password_user);

            // VERIFICA FOTO
            function checkPhoto(data) {
                let url = req.protocol + '://' + req.get('host')
                if (data !== undefined) {
                    return url + '/' + req.file.path
                } else {
                    return null
                }
            }

            const photo = checkPhoto(req.file)

            if (photo !== null) {
                const uploadedResponse = await cloudinary.uploader.upload(
                    photo, {
                    upload_preset: 'valorize_avatar'
                })
                const user_photo = uploadedResponse.secure_url

                // ATUALIZA NO BANCO COM FOTO
                const user = await User.update({ user_name, user_email, user_address, user_phone, user_password, user_photo }, {
                    where: {
                        id: user_id,
                        status: true
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Usuário Atualizado com Sucesso!',
                    user,
                });

            } else {
                // ATUALIZA NO BANCO SEM FOTO
                const user = await User.update({ user_name, user_email, user_address, user_phone, user_password }, {
                    where: {
                        id: user_id,
                        status: true
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Usuário Atualizado com Sucesso!',
                    user,
                });
            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Atualizar Usuário - View LÍDER e SUPER
    async editUser(req, res) {

        try {
            const { user_name, user_email, user_phone, user_address, role_id, team_id, team_current, role_current, password_user } = req.body;
            const { user_id } = req.params;

            // VERIFICA FOTO
            function checkPhoto(data) {
                let url = req.protocol + '://' + req.get('host')
                if (data !== undefined) {
                    return url + '/' + req.file.path
                } else {
                    return null
                }
            }

            // 1 - Checar se vem Função e Equipe retorna um objeto para ser usado nos parametros
            function checkData(role_id) {
                if (role_id == 'null') {
                    return {}
                } else {
                    return { role_id }
                }
            }

            // 1 - Checar se vem Função e Equipe retorna o dado ou nulo para verificação
            function checkDataNull(data) {
                if (data == 'null') {
                    return null
                } else {
                    return Number(data)
                }
            }
            function checkDataAccessNull(data) {
                if (data !== null) {
                    return data.role_access
                } else {
                    return null
                }
            }

            function checkPassWord(data) {
                if (data == '' || data == 'undefined') {
                    return undefined

                } else {
                    // CRIPTOGRAFA A SENHA
                    let salt = bcrypt.genSaltSync();
                    let senha = bcrypt.hashSync(data, salt);
                    return senha
                }
            }

            const user_password = checkPassWord(password_user);


            // Verifica se é nulo para usar nos parametros de atualização ( UPDATE USER )
            const role_params = checkData(role_id)

            // Verifica se é nulo para usar na verificação
            const team = checkDataNull(team_id)
            const teamCurrent = checkDataNull(team_current)

            const accessCurrent = await Role.findOne({ where: { id: role_current, status: true } })
            const role_access_current = checkDataAccessNull(accessCurrent);


            const access = await Role.findOne({ where: { id: role_id, status: true } })
            const role_access = checkDataAccessNull(access);

            // ////////// USUÁRIO SEM EQUIPE PERMANECE SEM EQUIPE ////////// //
            if (team == null && teamCurrent == null) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }

            }
            // ////////// USUÁRIO PERMANECE NA MESMA EQUIPE E É PROMOVIDO PRA LÍDER
            else if (team == teamCurrent && (role_access_current == 3 && role_access == 2 || role_access_current == null && role_access == 2)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }


                // ////////// USUÁRIO PERMANECE NA MESMA EQUIPE E É REBAIXADO
            } else if (team == teamCurrent && (role_access_current == 2 && role_access == 3)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }

                // ////////// USUÁRIO PERMANECE NA MESMA EQUIPE SEM MUDANÇA DE FUNÇÃO
            } else if (team == teamCurrent || team == null) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }


                // ////////// USUÁRIO MUDA DE EQUIPE SEM MUDANÇA DE FUNÇÃO OU ADERINDO A FUNÇÃO BÁSICA
            } else if (team !== teamCurrent && (role_access_current == null && role_access == null || role_access_current == 3 && role_access == 3 || role_access_current == null && role_access == 3)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });

                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });

                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });

                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });

                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })
                }


                // ////////// USUÁRIO MUDA DE EQUIPE SENDO PROMOVIDO A LÍDER OU ADQUIRE A FUNÇÃO DE LÍDER
            } else if (team !== teamCurrent && (role_access_current == 3 && role_access == 2 || role_access_current == null && role_access == 2)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }


                // ////////// USUÁRIO MUDA DE EQUIPE E PERMANECE NA FUNÇÃO DE LÍDER
            } else if (team !== teamCurrent && (role_access_current == 2 && role_access == 2)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })
    
                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })
    
                    // Atualiza na tabela de Team
                    await Team.update({ lider_id: user_id }, {
                        where: { id: team_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }


                // ////////// USUÁRIO MUDA DE EQUIPE E É REBAIXADO
            } else if (team !== teamCurrent && (role_access_current == 2 && role_access == 3)) {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    // Seta para Null na equipe anterior
                    await Team.update({ lider_id: null }, {
                        where: { lider_id: user_id, status: true },
                    })
    
                    // Remove a associação com os Time anterior
                    await UserTeam.destroy({
                        where: { user_id }
                    });
    
                    // Cria uma nova associação
                    await UserTeam.create({ user_id, team_id, status: true });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                }


            // ////////// QUALQUER OUTRA ALTERAÇÃO NOS DADOS DO USUÁRIO
            } else {

                const photo = checkPhoto(req.file)

                if (photo !== null) {
                    const uploadedResponse = await cloudinary.uploader.upload(
                        photo, {
                        upload_preset: 'valorize_avatar'
                    })
                    const user_photo = uploadedResponse.secure_url

                    // Atualizar os dados de usuário COM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, user_photo, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })

                } else {

                    // Atualizar os dados de usuário SEM FOTO
                    await User.update({ user_name, user_email, user_phone, user_password, user_address, ...role_params }, {
                        where: { id: user_id, status: true }
                    });
    
                    return res.status(200).json({
                        success: true,
                        message: 'Usuário Atualizado com Sucesso!',
                    })
                }
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Cadastra Usuário na Equipe - Cria associação usuário Equipe - CRUD LÍDER
    async storeAssociationUserTeam(req, res) {

        try {

            const { id_user, id_role, team_id } = req.body;

            const user_id = JSON.parse(id_user);
            const role_id = JSON.parse(id_role);

            const userAssociation = await UserTeam.findOne({
                where: { user_id, team_id, status: true },
                attributes: ['id']
            })

            if (userAssociation !== null) {

                return res.status(200).json({
                    message: 'Este Usuário já está cadastrado neste Time!',
                    userAssociation
                })

            } else {

                await User.update({ role_id }, {
                    where: { id: user_id, status: true }
                });

                await UserTeam.create({ user_id, team_id, status: true });

                return res.status(200).json({
                    success: true,
                    message: 'Usuário cadastrado na Equipe com Sucesso!',
                    userAssociation
                });
            }



        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Deletar Associação Usuário Team - CRUD LÍDER
    async deleteAssociationUsersTeams(req, res) {

        try {

            const { datapost } = req.params;

            const fields = datapost.split(':');

            var user_id = JSON.parse(fields[0]);
            var team_id = JSON.parse(fields[1]);

            const user = await UserTeam.findOne({
                where: { user_id: user_id, status: true }
            })

            const team = await UserTeam.findOne({
                where: { team_id: team_id, status: true }
            })

            if (user == '' || user == null) {
                return res.status(200).json({
                    message: 'Nenhum usuário encontrado!'
                })
            }

            if (team == '' || team == null) {
                return res.status(200).json({
                    message: 'Nenhuma equipe encontrada!'
                })
            }

            await UserTeam.destroy({
                where: {
                    user_id: user_id,
                    team_id: team_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Usuário Removido da Equipe com Sucesso!',
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    async delete(req, res) {

        try {

            const { user_id } = req.params;
            const { datapostDelete } = req.body;

            await User.update({ status: false }, {
                where: {
                    id: user_id,
                    status: true
                }
            });

            // Desabilitar as Avaliações
            await Rating.update({ status: false }, {
                where: {
                    user_id,
                    status: true
                }
            });

            // Desabilitar as Médias
            await Average.update({ status: false }, {
                where: {
                    user_id,
                    status: true
                }
            });

            // Remove as Associações com os Times
            await UserTeam.destroy({
                where: { user_id }
            });

            // Seta para Null em Teams se for líder
            await Team.update({ lider_id: null }, {
                where: {
                    lider_id: user_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Usuário Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    }

    //Deletar - CRUD SUPER
    // async delete(req, res) {

    //     try {

    //         const { user_id } = req.params;

    //         await User.destroy({
    //             where: {
    //                 id: user_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Usuário Deletado com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }

    // }

}