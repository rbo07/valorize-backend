const Rating = require('../models/Rating');
const User = require('../models/User');
const Period = require('../models/Period');
const Criterion = require('../models/Criterion');
const Tiebreaker = require('../models/Tiebreaker');
const Award = require('../models/Award');
const Average = require('../models/Average');
const UserTeam = require('../models/UserTeam');
const Team = require('../models/Team');
const Role = require('../models/Role');

module.exports = {

    //Listar Avaliação
    async list(req, res) {

        try {
            const { user_id } = req.params;
            const { period_id, criterion_id } = req.body;

            // FILTRO
            function filter(period_id, criterion_id) {

                if (period_id == null && criterion_id == null) {
                    return { status: true }

                } else if (period_id == null) {
                    return { criterion_id: criterion_id, status: true }

                } else if (criterion_id == null) {
                    return { period_id: period_id, status: true }

                } else {
                    return { criterion_id: criterion_id, period_id: period_id, status: true }
                }
            }

            const filtro = filter(period_id, criterion_id)

            const user = await User.findOne({
                where: { id: user_id, status: true },
            })

            const role_id = user.role_id

            const role = await Role.findOne({
                where: { id: role_id, status: true },
            })

            const role_access = role.role_access

            if (role_access == 1) {

                const ratings = await Rating.findAll({
                    attributes: ['id', 'rating_score', 'final_score'],
                    where: filtro,

                    include: [
                        {
                            attributes: ['user_name'],
                            as: 'user',
                            model: User,
                        },
                        {
                            attributes: ['user_name'],
                            as: 'user_evaluator',
                            model: User,
                        },
                        {
                            attributes: ['period_name'],
                            as: 'periods',
                            model: Period,
                        },
                        {
                            attributes: ['criterion_name'],
                            as: 'criterions',
                            model: Criterion,
                        },
                        {
                            attributes: ['award_name'],
                            as: 'awards',
                            model: Award,
                        },
                        {
                            attributes: ['tiebreaker_name', 'tiebreaker_weight'],
                            as: 'tiebreakers',
                            model: Tiebreaker,
                        }]
                });

                if (ratings == '' || ratings == null) {
                    return res.status(200).json({
                        message: 'Nenhuma Avaliação para o Período e Critério Selecionados!',
                    })
                }

                return res.status(200).json({
                    success: 1,
                    ratings,
                });

            } else if (role_access == 2) {

                const team = await Team.findOne({
                    where: { lider_id: user_id, status: true },
                })

                if (team == '' || team == null) {
                    return res.status(200).json({
                        message: 'Líder sem equipe subordinada.',
                    })
                }

                const usersTeam = await UserTeam.findAll({
                    where: { team_id: team.id, status: true },
                })

                const obj = []

                for (let i = 0; i < usersTeam.length; i++) {

                    let temp = await Rating.findAll({

                        where: { user_id: usersTeam[i].user_id, ...filtro },
                        attributes: ['id', 'user_id', 'rating_score', 'final_score'],

                        include: [
                            {
                                attributes: ['user_name'],
                                as: 'user',
                                model: User,
                            },
                            {
                                attributes: ['user_name'],
                                as: 'user_evaluator',
                                model: User,
                            },
                            {
                                attributes: ['period_name'],
                                as: 'periods',
                                model: Period,
                            },
                            {
                                attributes: ['criterion_name'],
                                as: 'criterions',
                                model: Criterion,
                            },
                            {
                                attributes: ['award_name'],
                                as: 'awards',
                                model: Award,
                            },
                            {
                                attributes: ['tiebreaker_name', 'tiebreaker_weight'],
                                as: 'tiebreakers',
                                model: Tiebreaker,
                            }]
                    });
                    obj.push({ user: temp })
                }

                if (obj.length == 0) {
                    return res.status(200).json({
                        message: 'Nenhuma Avaliação para o Período e Critério Selecionados!',
                    })
                }

                const ratingsTeam = []

                for (let i = 0; i < obj.length; i++) {
                    let size = obj[i].user.length
                    for (let j = 0; j < size; j++) {
                        if (obj[i].user[j].user_id !== Number(user_id)) {
                            ratingsTeam.push(obj[i].user[j])
                        }
                    }
                }

                if (ratingsTeam.length == 0) {
                    return res.status(200).json({
                        message: 'Nenhuma Avaliação para o Período e Critério Selecionados!',
                    })
                }

                return res.status(200).json({
                    success: 2,
                    ratingsTeam
                });

            }

        } catch (err) {
            alert('error server' + err)
        }

    },
    async listRatingID(req, res) {

        try {
            const { rating_id } = req.params;

            const rating = await Rating.findOne({
                where: { id: rating_id, status: true },
                attributes: ['id', 'rating_score', 'final_score'],

                include: [
                    {
                        attributes: ['id', 'user_name'],
                        as: 'user',
                        model: User,
                    },
                    {
                        attributes: ['id', 'user_name'],
                        as: 'user_evaluator',
                        model: User,
                    },
                    {
                        attributes: ['id', 'period_name'],
                        as: 'periods',
                        model: Period,
                    },
                    {
                        attributes: ['id', 'criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    },
                    {
                        attributes: ['id', 'award_name'],
                        as: 'awards',
                        model: Award,
                    },
                    {
                        attributes: ['id', 'tiebreaker_name', 'tiebreaker_weight'],
                        as: 'tiebreakers',
                        model: Tiebreaker,
                    }]
            });

            if (rating == '' || rating == null) {
                return res.status(200).send({ message: 'Nenhuma avaliação cadastrada!' })
            }

            return res.status(200).json({
                success: true,
                rating
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // TELA DE AVALIAÇÃO - GRAVA NOTAS E MÉDIAS
    async evaluation(req, res) {

        try {
            const { period_id } = req.params;
            const datapost = req.body;

            for (i = 0; i < datapost.length; i++) {

                let user_id = datapost[i].user_id
                let user_evaluator_id = datapost[i].user_evaluator_id
                let average = datapost[i].average_value
                let criterions = datapost[i].datapostCriterion.length

                let user = await User.findOne({ where: { id: user_id, status: true } })
                let period = await Period.findOne({ where: { id: period_id, status: true } })

                let userName = user.user_name
                let periodName = period.period_name

                for (j = 0; j < criterions; j++) {
                    let criterion_id = datapost[i].datapostCriterion[j].id_criterion
                    let rating_score = datapost[i].datapostCriterion[j].value_criterion
                    let final_score = rating_score
                    let criterion = await Criterion.findOne({ where: { id: criterion_id, status: true } })
                    let criterionName = criterion.criterion_name

                    let rating = await Rating.findOne({
                        where: { user_id, period_id, criterion_id, status: true }
                    })

                    if (rating !== null) {
                        return res.status(200).json({
                            message: 'O usuário, ' + userName.bold() + ', já possui avaliação cadastrada no período, ' + periodName.bold() + ', e critério, ' + criterionName.bold() + '!'
                        })
                    }

                    //Salva Avaliação
                    await Rating.create({ user_id, user_evaluator_id, period_id, criterion_id, rating_score, final_score, status: true });
                }
                //Salva Média
                await Average.create({ user_id, period_id, average, status: true });

            }

            return res.status(200).json({
                success: true,
                message: 'Avaliação Cadastrada com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Maiores Notas por Critério no Período ativo - TELA DE PREMIAÇÃO
    async finalistsWinners(req, res) {

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

            // Acha Critérios do Período Ativo
            const criterionsLastPeriod = await Criterion.findAll({
                where: { period_id: lastPeriod, status: true },
                attributes: ['id', 'criterion_name'],
                include: [
                    {
                        attributes: ['id', 'award_name'],
                        as: 'awards',
                        model: Award,
                    }
                ]
            });

            if (criterionsLastPeriod == '' || criterionsLastPeriod == null) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Nenhum Critério cadastrado para este período: ' + lastPeriodName
                })
            }

            function setToIdCriterions(data) {
                let size = data.length
                let ids = []

                for (var i = 0; i < size; i++) {
                    ids[i] = data[i].id;
                }
                return ids
            }
            const criterions = setToIdCriterions(criterionsLastPeriod)

            // Acha o Team do Usuário
            const team = await Team.findOne({
                where: { lider_id: user_id, status: true },
            });

            if (team == '' || team == null) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Líder sem equipe associada!'
                })
            }

            // Encontra todos os usuários que fazem parte da equipe
            const teamID = team.id
            const usersTeam = await UserTeam.findAll({
                where: { team_id: teamID, status: true }
            });

            if (usersTeam == '' || usersTeam == null) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Nenhum usuário cadastrado na minha equipe!'
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

            //Remove do array o ID do Líder (user_id)
            const index = idUsers.indexOf(JSON.parse(user_id));
            if (index > -1) {
                idUsers.splice(index, 1);
            }

            const myTeamScores = []

            // Encontra as avaliações da equipe e suas notas nos critérios do período ativo 
            for (var i = 0; i < idUsers.length; i++) {

                let userScore = []
                for (var j = 0; j < criterions.length; j++) {
                    userScore[j] = await Rating.findOne({
                        where: { user_id: idUsers[i], period_id: lastPeriod, criterion_id: criterions[j], status: true },
                        attributes: ['user_id', 'period_id', 'criterion_id', 'final_score'],
                    })
                }
                if (!userScore.includes(null)) {
                    myTeamScores.push({ userScore })
                }
            }

            // Verifica se existem avaliações cadastradas
            if (myTeamScores == '' || myTeamScores == null) {
                return res.status(200).json({
                    lastPeriodName,
                    message: 'Nenhuma avaliação cadastrada para esta equipe no período: ' + lastPeriodName
                })
            }

            // Seleciona as maiores notas por critério
            function findMajorScore(data) {
                let size1 = data[0].userScore.length // critérios
                let size2 = data.length // usuários
                let result = []

                for (let i = 0; i < size1; i++) {
                    let temp = []

                    for (let j = 0; j < size2; j++) {

                        let score = data[j].userScore[i].final_score

                        temp.push(score)
                    }
                    result.push(Math.max(...temp))
                }
                return result
            }

            const majorScore = findMajorScore(myTeamScores)


            //////////////////////// MONTA O OBJETO PARA BUSCAR OS FINALISTAS

            function mountUSers(data, notas) {
                let size1 = data[0].userScore.length // critérios
                let size2 = data.length // usuários
                let result = []

                for (let i = 0; i < size1; i++) {

                    for (let j = 0; j < size2; j++) {
                        let score = null
                        let temp = null
                        let user = null
                        let criterion = null

                        user = data[j].userScore[i].user_id
                        criterion = data[j].userScore[i].criterion_id
                        score = data[j].userScore[i].final_score
                        temp = notas[i]

                        if (temp == score) {
                            result.push({ user, score, criterion })
                        }
                    }
                }
                return result
            }

            const majorScoreFinal = mountUSers(myTeamScores, majorScore)


            // Encontra os finalistas ou vencedores
            const finalistsWinners = []
            const awardedUsers = []

            for (let m = 0; m < majorScoreFinal.length; m++) {
                let user = majorScoreFinal[m].user
                let criterion = majorScoreFinal[m].criterion
                let score = majorScoreFinal[m].score

                finalistsWinners[m] = await Rating.findOne({
                    where: { user_id: user, period_id: lastPeriod, criterion_id: criterion, final_score: score, status: true },
                    attributes: ['rating_score', 'user_evaluator_id', 'award_id'],

                    include: [
                        {
                            attributes: ['id', 'user_name', 'user_photo'],
                            as: 'user',
                            model: User,
                        },
                        {
                            attributes: ['id', 'user_name'],
                            as: 'user_evaluator',
                            model: User,
                        },
                        {
                            attributes: ['id', 'period_name'],
                            as: 'periods',
                            model: Period,
                        },
                        {
                            attributes: ['id', 'criterion_name'],
                            as: 'criterions',
                            model: Criterion,
                        },
                        {
                            attributes: ['id', 'award_name'],
                            as: 'awards',
                            model: Award,
                        },
                        {
                            attributes: ['tiebreaker_name', 'tiebreaker_weight'],
                            as: 'tiebreakers',
                            model: Tiebreaker,
                        }]
                })
                // Captura os usuários premiados
                let award = finalistsWinners[m].award_id

                if (award !== null) {
                    awardedUsers.push(finalistsWinners[m])
                }
            }

            if (awardedUsers.length > 0) {

                return res.status(200).json({
                    success: 2,
                    lastPeriodName,
                    awardedUsers
                });

            } else {
                return res.status(200).json({
                    success: 1,
                    lastPeriod,
                    lastPeriodName,
                    criterionsLastPeriod,
                    finalistsWinners,
                });
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Critérios do Último Período
    async criterionsView(req, res) {

        try {

            const period = await Period.findOne({
                where: { period_activated: true, status: true },
            });
            const lastPeriod = period.id

            await Rating.findAll({
                where: {
                    user_id: user_id,
                    period_id: lastPeriod,
                    status: true
                },

                attributes: ['rating_score'],

                include: [
                    {
                        attributes: ['period_name'],
                        as: 'periods',
                        model: Period,
                    },
                    {
                        attributes: ['criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            });



            if (ratingsPeriod == '' || ratingsPeriod == null) {
                return res.status(200).json({
                    success: false,
                    message: 'Nenhuma Avaliação cadastrada!'
                })
            }

            return res.status(200).json({
                success: true,
                ratingsPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Avaliações por Critério Último Período
    async ratingsPeriod(req, res) {

        try {
            const { user_id } = req.params;

            const period = await Period.findOne({
                where: { period_activated: true, status: true }
            });

            if (period == '' || period == null) {
                return res.status(200).json({
                    message: 'Nenhum período ativo no momento.'
                })
            }

            const lastPeriod = period.id
            const lastPeriodName = period.period_name

            const ratingsPeriod = await Rating.findAll({
                where: {
                    user_id: user_id,
                    period_id: lastPeriod,
                    status: true
                },

                attributes: ['rating_score'],

                include: [
                    {
                        attributes: ['period_name'],
                        as: 'periods',
                        model: Period,
                    },
                    {
                        attributes: ['criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            });



            if (ratingsPeriod == '' || ratingsPeriod == null) {
                return res.status(200).json({
                    success: false,
                    lastPeriodName,
                    message: 'Nenhuma Avaliação cadastrada!'
                })
            }

            return res.status(200).json({
                success: true,
                lastPeriodName,
                ratingsPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Criar Avaliação
    async store(req, res) {

        try {
            const { user_id, user_evaluator_id, period_id, criterion_id, rating_score } = req.body;

            await Rating.create({ user_id, user_evaluator_id, period_id, criterion_id, rating_score, status: true });

            return res.status(200).send({
                status: 1,
                message: 'Avaliação cadastrada com sucesso!',
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Cadastrar Desempate - TELA DESEMPATE
    async storeTiebreaker(req, res) {

        try {

            const datapost = req.body;

            const tiebreak = []
            const tiebreak_weight = []
            const ratingScore = []
            const score = []
            const final_score = []
            const ratingUpdate = []

            for (let i = 0; i < datapost.length; i++) {

                //Pega na avaliação o peso do Tiebreaker enviado
                tiebreak[i] = await Tiebreaker.findOne({ where: { id: datapost[i].tiebreak_id, status: true } });

                tiebreak_weight[i] = tiebreak[i].tiebreaker_weight

                //Pega na avaliação a nota atual do usuário
                ratingScore[i] = await Rating.findOne({
                    where: {
                        user_id: datapost[i].user_id,
                        period_id: datapost[i].period_id,
                        criterion_id: datapost[i].criterion_id,
                        user_evaluator_id: datapost[i].user_evaluator_id,
                        status: true
                    }
                });
                score[i] = ratingScore[i].rating_score

                // Calcula a nota final
                final_score[i] = tiebreak_weight[i] + score[i]

                // Atualiza a Nota Final e o Critério de Desempate na Avaliação do Usuário
                ratingUpdate[i] = await Rating.update({ tiebreak_id: datapost[i].tiebreak_id, final_score: final_score[i] }, {
                    where: {
                        user_id: datapost[i].user_id,
                        period_id: datapost[i].period_id,
                        criterion_id: datapost[i].criterion_id,
                        user_evaluator_id: datapost[i].user_evaluator_id,
                        status: true
                    }
                });

            }
            return res.status(200).json({
                success: true,
                message: 'Desempate cadastrado com sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Cadastrar Premiação
    async storeAward(req, res) {

        try {

            const datapost = req.body;

            for (let i = 0; i < datapost.length; i++) {

                await Rating.update({ award_id: datapost[i].award_id }, {
                    where: {
                        user_id: datapost[i].user_id,
                        user_evaluator_id: datapost[i].user_evaluator_id,
                        period_id: datapost[i].period_id,
                        criterion_id: datapost[i].criterion_id,
                        status: true
                    }
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuários premiados com Sucesso!'
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar Avaliação - EDIÇÃO DE AVALIAÇÃO ( ATUALIZA APENAS A NOTA )
    async update(req, res) {

        try {

            const { user_id, user_evaluator_id, rating_score, period_id } = req.body;
            const { rating_id } = req.params;

            ////////////////////// ATUALIZA A AVALIAÇÃO /////////////////////
            const rating = await Rating.findOne({
                where: {
                    id: rating_id,
                    status: true
                }
            });

            const tiebreak = await Tiebreaker.findOne({
                where: {
                    id: rating.tiebreak_id,
                    status: true
                }
            })

            function checkTiebreak(tiebreak){
                if(tiebreak == null){
                    return 0 
                } else {
                    return tiebreak.tiebreaker_weight
                }
            }

            const tiebreak_weight = checkTiebreak(tiebreak)

            const final_score = Number(rating_score) + Number(tiebreak_weight)

            await Rating.update({ rating_score, final_score }, {
                where: {
                    id: rating_id,
                    status: true
                }
            });

            ////////////////////// CALCULA E GRAVA MÉDIA ATUALIZADA NO PERÍODO /////////////////////
            const notas = await Rating.findAll({
                where: {
                    user_id,
                    period_id,
                    user_evaluator_id,
                    status: true
                },
                attributes: ['rating_score'],
            });

            // Calcula Média
            function calculaMedia(data) {
                let notas = null;
                let size = data.length

                let soma = 0;
                let average = 0;

                for (var j = 0; j < size; j++) {
                    soma += data[j].rating_score;
                }
                average = Math.round(soma / size)
                notas = average

                return notas
            }

            const media = calculaMedia(notas)

            //Salva Médias
            await Average.update({ average: media }, {
                where: {
                    user_id,
                    period_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                tiebreak_weight,
                final_score,
                message: 'Avaliação atualizada com Sucesso!',
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Deletar Avaliação
    async delete(req, res) {

        try {
            const { rating_id } = req.params;
            const { datapost } = req.body;

            await Rating.update({ status: false }, {
                where: {
                    id: rating_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Avaliação Removida com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    // //Deletar Avaliação
    // async delete(req, res) {

    //     try {
    //         const { rating_id } = req.params;

    //         await Rating.destroy({
    //             where: {
    //                 id: rating_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Avaliação Removida com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // },

    //Relatório Grafico - Usuários Premiados
    async awardUsers(req, res) {

        try {

            const awards = await Award.findAll({
                where: { status: true }
            });

            if (awards == '' || awards == null) {
                return res.status(200).json({
                    message: 'Nenhum prêmio encontrado.'
                })
            }

            const awarded = []

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

            for (let i = 0; i < awards.length; i++) {
                let award
                award = await Rating.findAll({
                    where: { award_id: awards[i].id, period_id: lastPeriod, status: true },
                    attributes: [],

                    include: [
                        {
                            attributes: ['user_name'],
                            as: 'user',
                            model: User,
                        },
                        {
                            attributes: ['award_name'],
                            as: 'awards',
                            model: Award,
                        }]
                });
                awarded.push({ award })
            }

            if (awarded.length == 0) {

                return res.status(200).json({
                    message: 'Nenhum usuário premiado no período.'
                });

            } else {

                function mountObjectAwarded(data) {
                    let size = data.length
                    let awardeds = []
                    for (let i = 0; i < size; i++) {
                        let size2 = data[i].award.length
                        let users = []
                        let award_name = ''

                        for (let j = 0; j < size2; j++) {
                            let user_name = data[i].award[j].user.user_name
                            award_name = data[i].award[0].awards.award_name
                            users.push([user_name.substr(0, user_name.indexOf(' ')), 1])
                        }
                        if (award_name !== '') {
                            awardeds.push({ label: award_name, data: users })
                        }
                    }

                    return awardeds
                }

                const usersAwarded = mountObjectAwarded(awarded)

                return res.status(200).json({
                    success: true,
                    usersAwarded,
                });
            }


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },



}