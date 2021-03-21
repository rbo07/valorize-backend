const Average = require('../models/Average');
const User = require('../models/User');
const Period = require('../models/Period');
const UserTeam = require('../models/UserTeam');
const Team = require('../models/Team');


module.exports = {

    //Listar Médias
    async list(req, res) {

        try {
            const averages = await Average.findAll({
                where: { status: true },
                attributes: ['id', 'average'],
                include: [
                    {
                        attributes: ['user_name'],
                        as: 'users',
                        model: User,
                    },
                    {
                        attributes: ['period_name'],
                        as: 'periods',
                        model: Period,
                    }]
            });


            if (averages == '' || averages == null) {
                return res.status(200).send({ message: 'Nenhuma Média cadastrada!' })
            }

            return res.status(200).send({ averages });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Médias por Usuário em Todos os Períodos | Média Acumulada
    async listAveragesPeriods(req, res) {

        try {
            const { user_id } = req.params;

            const periods = await Period.findAll({
                where: { status: true },
            })

            // Verifica se tem periodod
            if (periods == '' || periods == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriod = await Period.findOne({
                where: { period_activated: true, status: true },
            })

            // Verifica se tem periodod
            if (lastPeriod == '' || lastPeriod == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriodName = lastPeriod.period_name

            const averagesPeriods = []
            const data = []

            for (let i = 0; i < periods.length; i++) {
                let temp = await Average.findOne({
                    where: { user_id: user_id, period_id: periods[i].id, status: true },
                });
                if (temp !== null) {
                    let temp_average = null

                    if (temp.average > 100) {
                        temp_average = 100
                    } else {
                        temp_average = temp.average
                    }
                    data.push([periods[i].period_name, temp_average])
                }
            }
            averagesPeriods.push({ label: 'Média', data: data })

            const averages = await Average.findAll({
                where: { user_id: user_id, status: true }
            });

            // Verifica se existem médias cadastradas
            if (averages.length == 0) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Nenhuma avaliação cadastrada.'
                })
            }

            function calculaMedia() {
                let soma = 0;
                let media = 0;
                let size = averages.length

                for (var i = 0; i < size; i++) {
                    let temp_score = null

                    if (averages[i].average > 100) {
                        temp_score = 100
                    } else {
                        temp_score = averages[i].average
                    }
                    soma += temp_score;
                }
                media = Math.round(soma / size)
                return media
            }

            const media = calculaMedia()

            return res.status(200).json({
                success: true,
                media,
                averagesPeriods,
                lastPeriodName
            });



        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Obtém média do Time no último período
    async getCumulativeAverageTeam(req, res) {

        try {
            const { data_id } = req.params;

            const result = data_id.split(':');

            const user_id = result[0]
            const period_id = result[1]

            // Acha o último período cadastrado
            const period_temp = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            // Verifica se tem periodod
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

            // Verifica se tem periodod
            if (period == '' || period == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriodName = period.period_name

            // Acha o Team do Usuário
            const team = await Team.findOne({
                where: { lider_id: user_id, status: true }
            });

            // Verifica se tem equipe
            if (team == '' || team == null) {
                return res.status(200).json({
                    lastPeriodName: lastPeriodName,
                    message: 'Líder sem equipe subordinada.'
                })
            }

            const teamId = team.id

            // Obtem todos os usuários pertencentes a sua equipe
            const usersTeam = await UserTeam.findAll({
                where: { team_id: teamId, status: true },
                attributes: ['user_id'],
            });

            // Verifica se todos possuem avaliação
            if (usersTeam == '' || usersTeam == null) {
                return res.status(200).json({
                    lastPeriodName: lastPeriodName,
                    message: 'Nenhuma avaliação cadastrada.'
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

            const idUsers = setToId()
            const myAveragesTeam = []

            // Remove do array o ID do Líder (user_id)
            const index = idUsers.indexOf(JSON.parse(user_id));
            if (index > -1) {
                idUsers.splice(index, 1);
            }

            // Obtem as médias de todos os usuários pertencentes a equipe
            for (var i = 0; i < idUsers.length; i++) {

                myAveragesTeam[i] = await Average.findOne({
                    where: {
                        user_id: idUsers[i],
                        period_id: lastPeriod,
                        status: true
                    },
                    attributes: ['average'],
                })
            }

            // Remove os usuários sem médias
            const myAveragesTeamFinal = myAveragesTeam.filter(function (el) {
                return el != null;
            });

            function calculaMedia() {
                let soma = 0;
                let media = 0;
                let size = myAveragesTeamFinal.length

                for (var i = 0; i < size; i++) {

                    let x = myAveragesTeamFinal[i].toJSON();
                    let y = JSON.parse(Object.values(x));
                    // Calcula a média considerando máximo 100%
                    if (y > 100) { y = 100 }
                    soma += y;
                }
                media = Math.round(soma / size)
                return media
            }

            const media = calculaMedia()

            return res.status(200).json({
                success: true,
                lastPeriodName,
                media,
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Cadastrar Médias
    async store(req, res) {

        try {
            const { user_id, period_id, average } = req.body;

            const user = await User.findOne({
                where: {
                    id: user_id,
                    status: true
                }
            });
            const period = await Period.findOne({
                where: {
                    id: period_id,
                    status: true
                }
            });

            const periodUserAverage = await Average.findOne({
                where: {
                    user_id: user_id,
                    period_id: period_id,
                    status: true
                }
            });

            if (user == '' || user == null) {
                return res.status(200).send({ message: 'Usuário não encontrado!' })
            }

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Período não encontrado!' })
            }

            if (periodUserAverage !== null) {
                return res.status(200).json({
                    message: 'Já existe uma média cadastrada para este usuário neste período!'
                })
            }

            const averages = await Average.create({ user_id, period_id, average, status: true });

            return res.status(200).send({
                status: 1,
                message: 'Média cadstrada com sucesso!',
                averages,
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar Médias
    async update(req, res) {

        try {

            const { user_id, period_id, average } = req.body;
            const { average_id } = req.params;

            const averages = await Average.findOne({
                where: {
                    id: average_id,
                    status: true
                }
            });
            const user = await User.findOne({
                where: {
                    id: user_id,
                    status: true
                }
            });
            const period = await Period.findOne({
                where: {
                    id: period_id,
                    status: true
                }
            });

            if (user == '' || user == null) {
                return res.status(200).send({ message: 'Usuário não encontrado!' })
            }

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Período não encontrado!' })
            }

            if (averages == '' || averages == null) {
                return res.status(200).send({ message: 'Média não encontrada!' })
            }

            await Average.update({
                user_id, period_id, average
            }, {
                where: {
                    id: average_id,
                    status: true
                }
            });

            return res.status(200).send({
                status: 1,
                message: 'Média atualizada com Sucesso!'
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Deletar Média
    async delete(req, res) {

        try {
            const { average_id } = req.params;

            const average = await Average.findOne({
                where: {
                    id: average_id,
                    status: true
                }
            });

            if (average == '' || average == null) {
                return res.status(200).send({ message: 'Média não encontrada!' })
            }

            await Average.update({ status: false }, {
                where: {
                    id: average_id,
                    status: true
                }
            });

            return res.status(200).send({
                status: 1,
                message: 'Média Deletada com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //REPORTS - Média Total no Período Ativo
    async totalAveragePeriod(req, res) {

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
                    message: 'Nenhum Período Ativo no momento!'
                })
            }

            const lastPeriodName = period.period_name

            const averages = await Average.findAll({
                where: { period_id: lastPeriod, status: true },
            });

            if (averages == '' || averages == null) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Nenhuma Média cadastrada!'
                })
            }

            // Calcula Média
            function calculaMedia(data) {
                let size = data.length
                let soma = 0;
                let average = 0;

                for (var j = 0; j < size; j++) {
                    let tem_score = null
                    if (data[j].average > 100) {
                        tem_score = 100
                    } else {
                        tem_score = data[j].average
                    }
                    soma += tem_score;
                }

                average = Math.round(soma / size)
                return average
            }

            const average = calculaMedia(averages)

            return res.status(200).json({
                success: true,
                average,
                lastPeriodName
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //REPORTS - Média Total em todos os períodos
    async totalAveragePerPeriod(req, res) {

        try {

            // Acha todos os períodos
            const period = await Period.findAll({
                where: { status: true },
            });

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Nenhuma Período Ativo no momento!' })
            }

            const averages = []
            const average = []
            for (let i = 0; i < period.length; i++) {

                average[i] = await Average.findAll({
                    where: { period_id: period[i].id, status: true },
                });
                averages.push({ average: average[i] })
            }

            const data = []
            const size1 = averages.length

            for (let j = 0; j < size1; j++) {
                let size2 = averages[j].average.length
                let media = null
                let soma = null

                for (let m = 0; m < size2; m++) {
                    let temp_score = null
                    if (averages[j].average[m].average > 100) {
                        temp_score = 100
                    } else {
                        temp_score = averages[j].average[m].average
                    }
                    soma += temp_score
                }
                media = Math.round(soma / size2)
                data.push([period[j].period_name, media])
            }

            const datePerPeriod = [{ label: 'Desempenho Geral', data }]

            return res.status(200).json({
                success: true,
                datePerPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //REPORTS - Média por Equipe no Período Ativo
    async totalAverageTeamPeriod(req, res) {

        try {

            // Acha o último período cadastrado
            const period = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Nenhuma Período Ativo no momento!' })
            }

            const lastPeriod = period.id
            const lastPeriodName = period.period_name

            // Acha todos os times
            const teams = await Team.findAll({
                where: { status: true }
            });

            if (teams == '' || teams == null) {
                return res.status(200).send({ message: 'Nenhuma Equipe encontrada!' })
            }
            // Encontra os usuários do Time
            const usersTeams = []
            for (let i = 0; i < teams.length; i++) {
                let users = await UserTeam.findAll({
                    where: { team_id: teams[i].id, status: true },
                })

                // Remove do usuário Líder
                let id = teams[i].lider_id
                for (let [m, user] of users.entries()) {
                    if (user.user_id == id) {
                        users.splice(m, 1);
                    }
                }


                if (users.length > 0) {
                    usersTeams.push({ name: teams[i].team_name, lider: teams[i].lider_id, team: users })
                }
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

                        if (average[m].average > 100) {
                            temp_score = 100
                        } else {
                            temp_score = average[m].average
                        }
                        soma += temp_score
                    }
                }
                media = Math.round(soma / size)
                averagesTeamsPeriod.push({ label: name, data: [[lastPeriodName, media]] })
            }

            return res.status(200).json({
                success: true,
                averagesTeamsPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //REPORTS - Média Total por Equipe em todos os períodos
    async totalAverageTeamPerPeriod(req, res) {
        try {

            // Acha todos os períodos
            const period = await Period.findAll({
                where: { status: true }
            });


            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Nenhuma Período Ativo no momento!' })
            }

            // Acha todos os times
            const teams = await Team.findAll({
                where: { status: true }
            });

            if (teams == '' || teams == null) {
                return res.status(200).send({ message: 'Nenhuma Equipe encontrada!' })
            }

            const usersTeams = []
            for (let i = 0; i < teams.length; i++) {
                let users = await UserTeam.findAll({
                    where: { team_id: teams[i].id, status: true },
                })

                // Remove do usuário Líder
                let id = teams[i].lider_id
                for (let [m, user] of users.entries()) {
                    if (user.user_id == id) {
                        users.splice(m, 1);
                    }
                }

                if (users.length > 0) {
                    usersTeams.push({ name: teams[i].team_name, team: users })
                }
            }
            const averagesTeamsPerPeriod = []
            const average = []

            for (let j = 0; j < usersTeams.length; j++) {
                let size = usersTeams[j].team.length
                let name = usersTeams[j].name
                let data = []

                for (let i = 0; i < period.length; i++) {
                    let media = null
                    let soma = null

                    for (let m = 0; m < size; m++) {
                        average[m] = await Average.findOne({
                            where: { user_id: usersTeams[j].team[m].user_id, period_id: period[i].id, status: true },
                        });
                        if (average[m] !== null) {
                            let temp_score = null
                            if (average[m].average > 100) {
                                temp_score = 100
                            } else {
                                temp_score = average[m].average
                            }
                            soma += temp_score
                        }
                    }
                    media = Math.round(soma / size)
                    data.push([period[i].period_name, media])
                }
                averagesTeamsPerPeriod.push({ label: name, data: data })
            }

            return res.status(200).json({
                success: true,
                averagesTeamsPerPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
}