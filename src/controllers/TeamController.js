const User = require('../models/User');
const Team = require('../models/Team');
const Period = require('../models/Period');
const Average = require('../models/Average');
const UserTeam = require('../models/UserTeam');

module.exports = {



    //Listar as Equipes CRUD
    async list(req, res) {

        try {

            const teams = await Team.findAll({
                where: { status: true },
                attributes: ['id', 'team_name', 'team_description'],
                include: [
                    {
                        attributes: ['user_name'],
                        as: 'leader',
                        model: User,
                    }]
            });

            if (teams == '' || teams == null) {
                return res.status(200).send({ message: 'Nenhuma equipe cadastrada!' })
            }

            return res.status(200).json({
                success: true,
                teams
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Controle de Rotas na API - Retorna os usuários por Equipe
    async getTeam(req, res) {

        try {
            const { user_id } = req.params;

            const team = await Team.findOne({
                where: { lider_id: user_id, status: true },
            });

            if (team == '' || team == null) {
                return res.status(200).send({ message: 'Nenhuma equipe cadastrada!' })
            }

            const users = await UserTeam.findAll({
                where: { team_id: team.id, status: true },
            })

            if (users == '' || users == null) {
                return res.status(200).send({ message: 'Nenhuma usuário encontrado!' })
            }

            const usersTeam = []

            for(let i = 0; i < users.length; i++){
                usersTeam.push(users[i].user_id)
            }

            return res.status(200).json({
                success: true,
                usersTeam
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar as Equipes e LÍDERES associados
    async listTeamLeader(req, res) {

        try {
            const { period_id } = req.params;

            // Acha o último período cadastrado
            const period_temp = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            if (period_temp == '' || period_temp == null) {
                return res.status(200).json({ 
                    message: 'Nenhum Período Ativo no momento!' 
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
                    message: 'Nenhuma Período Ativo no momento!' 
                })
            }
            
            // Acha todos os times
            const myteams = await Team.findAll({
                where: { status: true }
            });

            if (myteams == '' || myteams == null) {
                return res.status(200).send({ message: 'Nenhuma Equipe encontrada!' })
            }

            const usersTeams = []
            for (let i = 0; i < myteams.length; i++) {
                let users = await UserTeam.findAll({
                    where: { team_id: myteams[i].id, status: true },
                })

                // Remove do usuário Líder
                let id = myteams[i].lider_id
                for (let [m, user] of users.entries()) {
                    if (user.user_id == id) {
                        users.splice(m, 1);
                    } 
                 }

                // if (temp.length > 0) {
                    usersTeams.push({ name: myteams[i].team_name, team: users })
                // }
            }
            const averagesTeamsPeriod = []
            const average = []

            for (let j = 0; j < usersTeams.length; j++) {
                let size = usersTeams[j].team.length
                let media = null
                let soma = null
                let name = usersTeams[j].name

                for (let m = 0; m < size; m++) {
                    average[m] = await Average.findOne({
                        where: { user_id: usersTeams[j].team[m].user_id, period_id: lastPeriod, status: true },
                    });
                    if (average[m] !== null) {
                        let temp_score = null

                        if(average[m].average > 100){
                            temp_score = 100
                        } else {
                            temp_score = average[m].average
                        }
                        soma += temp_score
                    }
                }
                media = Math.round(soma / size)
                averagesTeamsPeriod.push( media )
            }

            const teams = await Team.findAll({
                where: { status: true },
                attributes: ['id', 'team_name', 'team_description'],
                include: [
                    {
                        attributes: ['id','user_name', 'user_photo'],
                        as: 'leader',
                        model: User,
                    }]
            });

            if (teams == '' || teams == null) {
                return res.status(200).send({ message: 'Nenhuma equipe cadastrada!' })
            }

            return res.status(200).json({
                success: true,
                teams,
                averagesTeamsPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Teams LookUp
    async listTeamLookUp(req, res) {

        try {

            const teams = await Team.findAll({
                where: { status: true },
                attributes: ['id', 'team_name'],
            });

            if (teams == '' || teams == null) {
                return res.status(200).send({ message: 'Nenhuma equipe cadastrada' })
            }

            return res.status(200).json({
                success: true,
                teams
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Listar Team por ID
    async listTeamID(req, res) {

        try {
            const { team_id } = req.params;

            const team = await Team.findOne({
                where: { id: team_id, status: true },
                attributes: ['team_name', 'lider_id', 'team_description'],
                include: [
                    {
                        attributes: ['user_name'],
                        as: 'leader',
                        model: User,
                    }]
            });

            if (team == '' || team == null) {
                return res.status(200).send({ message: 'Nenhuma equipe cadastrada' })
            }

            return res.json({ success: true, team });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },


    //Criar Equipe
    async store(req, res) {

        try {
            const { lider_id, team_name, team_description } = req.body;

            const leader = await Team.findOne({
                where: { lider_id, status: true },
                attributes: ['lider_id'],
            })

            // Checa se o usuário já está cadastrado em outra equipe
            function checkIfExist(id) {
                let idLeader = null
                if (id !== null) {
                    let x = id.toJSON();
                    idLeader = JSON.parse(Object.values(x));
                    return idLeader
                } else {
                    return id
                }
            }

            const idLeader = checkIfExist(leader);

            if (lider_id == idLeader) {

                return res.status(200).json({
                    message: 'Usuário já é Líder em outra Equipe!',
                })

            } else {
                await Team.create({ team_name, lider_id, team_description, status: true });
                return res.status(200).json({
                    success: true,
                    message: 'Equipe cadastrada com sucesso!'
                })

            }
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    // Cria Associação do Usuário com a Equipe
    async storeAssociationUser(req, res) {
        try {

            const { user_id } = req.params;
            const { team_name } = req.body;

            const user = await User.findByPk(user_id, { where: { status: true } });

            if (!user) {
                return res.status(400).json({
                    status: 0,
                    message: 'Usuário não encontrado'
                });
            }

            const [team] = await Team.findOrCreate({
                where: { team_name, status: true }
            });

            await user.addTeam(team);

            return res.status(200).json({
                status: 1,
                message: 'Equipe associada com Usuário com Sucesso!',
                team
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar
    async update(req, res) {

        try {

            const { lider_id, team_name, team_description } = req.body;
            const { team_id } = req.params;

            const leader = await Team.findOne({
                where: { lider_id, status: true },
                attributes: ['lider_id'],
            })

            const leaderIsCurrentTeam = await Team.findOne({
                where: {
                    id: team_id,
                    lider_id: lider_id,
                    status: true
                },
                attributes: ['lider_id'],
            })

            // Checa se o usuário já está cadastrado em outra equipe
            function checkIfExist(id) {
                let idLeader = null
                if (id !== null) {
                    let x = id.toJSON();
                    idLeader = JSON.parse(Object.values(x));
                    return idLeader
                } else {
                    return id
                }
            }

            const idLeader = checkIfExist(leader);

            if (lider_id == idLeader && leaderIsCurrentTeam == null) {

                return res.status(200).json({
                    success: false,
                    message: 'Usuário já é Líder em outra Equipe!',
                })

            } else {

                await Team.update({
                    lider_id, team_name, team_description
                }, {
                    where: {
                        id: team_id,
                        status: true
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Equipe atualizada com Sucesso!',
                });
            }

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Deletar o Relacionamento
    async deleteAssociationTeamsUsers(req, res) {

        try {

            const { user_id } = req.params;
            const { team_name } = req.body;

            const user = await User.findByPk(user_id, { where: { status: true } });

            if (!user) {
                return res.status(400).json({
                    status: 0,
                    message: 'Usuário não encontrado'
                });
            }

            const team = await Team.findOrCreate({
                where: { team_name, status: true }
            });

            await user.removeTeam(team);

            return res.status(200).json({
                status: 1,
                message: 'Relacionamento Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Deletar a Equipe
    async delete(req, res) {

        try {
            const { team_id } = req.params;
            const { datapost } = req.body;

            await Team.update({ lider_id: null, status: false }, {
                where: {
                    id: team_id,
                    status: true
                }
            });

            // Desabilitar as Associações com os Times
            await UserTeam.destroy({
                where: { team_id }
            });

            return res.status(200).json({
                success: true,
                message: 'Equipe Removida com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    // //Deletar a Equipe
    // async delete(req, res) {

    //     try {
    //         const { team_id } = req.params;

    //         await Team.destroy({
    //             where: {
    //                 id: team_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Equipe Deletada com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // },
}