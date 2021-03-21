const Award = require('../models/Award');
const Period = require('../models/Period');
const Rating = require('../models/Rating');
const Criterion = require('../models/Criterion');

module.exports = {

    //Listar Períodos
    async list(req, res) {

        try {
            const periods = await Period.findAll({
                where: { status: true },
                attributes: ['id', 'period_name', 'period_initial_date', 'period_final_date', 'period_activated']
            });

            if (periods == '' || periods == null) {
                return res.status(200).send({ message: 'Nenhum período ativo no momento.' })
            }

            return res.status(200).json({
                success: true,
                periods
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Define o período ativo
    async setPeriodActive(req, res) {
        try {
            const { period_id } = req.body;

            // Define todos os períodos como desativados
            const allPeriods = await Period.findAll({
                where: { status: true },
            })

            for (var i = 0; i < allPeriods.length; i++) {
                await Period.update({ period_activated: false }, { where: { id: allPeriods[i].id, status: true } })
            }
            // Define o período selecionado como ativo
            await Period.update({ period_activated: true }, { where: { id: period_id, status: true } })

            return res.status(200).json({
                success: true,
                message: 'Período ativado com sucesso!',
            });

        } catch (err) {
            return res.status(400).json({ message: 'Erro no servidor!' })
        }
    },
    //Listar Períodos LookUp
    async listPeriodLookUp(req, res) {

        try {
            const periods = await Period.findAll({
                where: { status: true },
                attributes: ['id', 'period_name']
            });

            if (periods == '' || periods == null) {
                return res.status(200).send({ message: 'Nenhum período ativo no momento.' })
            }

            return res.status(200).json({
                success: true,
                periods
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Lista os prêmios do último período em Awards View
    async listPeriodsAwards(req, res) {

        try {
            const awardsByPeriod = await Period.findOne({

                attributes: ['id', 'period_name'],
                where: { period_activated: true, status: true },
                include: [
                    {
                        attributes: ['award_name', 'award_description'],
                        as: 'awards',
                        model: Award,
                    }]
            });


            if (awardsByPeriod == '' || awardsByPeriod == null) {
                return res.status(200).send({ message: 'Nenhum Período cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                awardsByPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Atualiza os prêmios em Awards View pelo ID
    async listPeriodsAwardsId(req, res) {

        try {
            const { period_id } = req.params;

            const awardsByPeriod = await Period.findOne({
                where: { id: period_id, status: true },
                attributes: ['id', 'period_name'],
                include: [
                    {
                        attributes: ['award_name', 'award_description'],
                        as: 'awards',
                        model: Award,
                    }]
            });


            if (awardsByPeriod == '' || awardsByPeriod == null) {
                return res.status(200).send({ message: 'Nenhum Período cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                awardsByPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    // Lista os critérios do último período em Critérios View
    async listPeriodsCriterions(req, res) {

        try {
            const criterionsByPeriod = await Period.findOne({

                attributes: ['id', 'period_name'],
                where: { period_activated: true, status: true },
                include: [
                    {
                        attributes: ['criterion_name', 'criterion_description'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            });


            if (criterionsByPeriod == '' || criterionsByPeriod == null) {
                return res.status(200).send({ message: 'Nenhum Período cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                criterionsByPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Atualiza os critérios em Criterions View pelo ID
    async listPeriodsCriterionsId(req, res) {

        try {
            const { period_id } = req.params;

            const criterionsByPeriod = await Period.findOne({
                where: { id: period_id, status: true },
                attributes: ['id', 'period_name'],
                include: [
                    {
                        attributes: ['criterion_name', 'criterion_description'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            });


            if (criterionsByPeriod == '' || criterionsByPeriod == null) {
                return res.status(200).send({ message: 'Nenhum Período cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                criterionsByPeriod
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Períodos e Avaliações Relacionadas
    async listPeriodsRatings(req, res) {

        try {
            const periods = await Period.findAll({
                where: { status: true },
                attributes: ['period_name'],
                include: [
                    {
                        attributes: ['user_id', 'user_evaluator_id', 'period_id', 'criterion_id'],
                        as: 'ratings',
                        model: Rating,
                    }]
            });

            if (periods == '' || periods == null) {
                return res.status(200).send({ message: 'Nenhum Período cadastrado!' })
            }

            return res.status(200).send({ periods });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Período por ID
    async listPeriodID(req, res) {

        try {
            const { period_id } = req.params;

            const period = await Period.findOne({
                where: { id: period_id, status: true },
                attributes: ['period_name', 'period_initial_date', 'period_final_date'],
                include: [
                    {
                        attributes: ['id', 'award_name'],
                        as: 'awards',
                        model: Award,
                    },
                    {
                        attributes: ['id', 'criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    }]
            });

            if (period == '' || period == null) {
                return res.status(200).send({ message: 'Nenhum período cadastrado' })
            }

            return res.json({ success: true, period });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Criar Período
    async store(req, res) {

        try {
            const { period_name, period_initial_date, period_final_date, awardsAssociate, criterionsAssociate } = req.body;

            const newPeriod = await Period.create({ period_name, period_initial_date, period_final_date, status: true });
            const period_id = newPeriod.id


            //Cria associação entre o Período e Prêmios
            for (var i = 0; i < awardsAssociate.length; i++) {
                await Award.update({ period_id }, {
                    where: { id: awardsAssociate[i], status: true }
                });
            }

            //Cria associação entre o Período e Critérios
            for (var i = 0; i < criterionsAssociate.length; i++) {
                await Criterion.update({ period_id }, {
                    where: { id: criterionsAssociate[i], status: true }
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Período cadastrado com sucesso!',
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar Período
    async update(req, res) {

        try {
            const { period_name, period_initial_date, period_final_date, awardsAssociate, criterionsAssociate } = req.body;
            const { period_id } = req.params;

            await Period.update({ period_name, period_initial_date, period_final_date }, { where: { id: period_id, status: true } });

            //atribui o valor null para todos os prêmios que tenham o ID period_id
            await Award.update({ period_id: null }, { where: { period_id: period_id, status: true } });

            //Atualizar associação entre o Período e Prêmios
            for (var i = 0; i < awardsAssociate.length; i++) {
                await Award.update({ period_id }, {
                    where: { id: awardsAssociate[i], status: true }
                });
            }

            //atribui o valor null para todos os critérios que tenham o ID period_id
            await Criterion.update({ period_id: null }, { where: { period_id: period_id, status: true } });

            //Atualizar associação entre o Período e Critérios
            for (var i = 0; i < criterionsAssociate.length; i++) {
                await Criterion.update({ period_id }, {
                    where: { id: criterionsAssociate[i], status: true }
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Período atualizado com sucesso!',
            })

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Deletar Período
    async delete(req, res) {

        try {
            const { period_id } = req.params;
            const { datapost } = req.body;

            await Period.update({ status: false }, {
                where: {
                    id: period_id,
                    status: true
                }
            });

            await Award.update({ period_id: null },{
                where: {
                    period_id,
                    status: true
                }
            });

            await Criterion.update({ period_id: null },{
                where: {
                    period_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Período Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    }
    // //Deletar Período
    // async delete(req, res) {

    //     try {
    //         const { period_id } = req.params;

    //         await Period.destroy({
    //             where: {
    //                 id: period_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Período Deletado com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // }
}