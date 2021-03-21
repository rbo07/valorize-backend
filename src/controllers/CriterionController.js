const Award = require('../models/Award');
const Criterion = require('../models/Criterion');
const Period = require('../models/Period');

module.exports = {

    //Listar Critérios e Prêmios associados
    async list(req, res) {

        try {

            const criterions = await Criterion.findAll({
                where: { status: true },
                attributes: ['id', 'criterion_name', 'criterion_description'],

                include: [
                    {
                        attributes: ['id', 'award_name'],
                        as: 'awards',
                        model: Award,
                    },
                    {
                        attributes: ['id', 'period_name',],
                        as: 'periods',
                        model: Period,
                    }]
            });

            if (criterions == '' || criterions == null) {
                return res.status(200).send({ message: 'Nenhum critério cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                criterions
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    async listCriterionID(req, res) {

        try {
            const { criterion_id } = req.params;

            const criterion = await Criterion.findOne({
                where: { id: criterion_id, status: true },
                attributes: ['id', 'criterion_name', 'criterion_description'],

                include: [
                    {
                        attributes: ['id', 'award_name'],
                        as: 'awards',
                        model: Award,
                    },
                    {
                        attributes: ['id', 'period_name',],
                        as: 'periods',
                        model: Period,
                    }]
            });

            if (criterion == '' || criterion == null) {
                return res.status(200).send({ message: 'Nenhum critério cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                criterion
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Funções LookUp
    async listCriterionsLookUp(req, res) {

        try {

            const criterions = await Criterion.findAll({
                where: { status: true },
                attributes: ['id', 'criterion_name'],
            });

            if (criterions == '' || criterions == null) {
                return res.status(200).send({ message: 'Nenhum critério cadastrado' })
            }

            return res.status(200).json({
                success: true,
                criterions
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Criar Critério
    async store(req, res) {

        try {
            const { criterion_name, criterion_description, period_id, award_id } = req.body;

            const newCriterion = await Criterion.create({ criterion_name, criterion_description, period_id, status: true });
            const criterion_id = newCriterion.id

            await Award.update({ criterion_id }, { where: { id: award_id, status: true } });

            return res.status(200).json({
                success: true,
                message: 'Critério cadastrado com sucesso!',
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    // Cria Associação do Critério com o Prêmio
    async storeAssociationCriterionAwards(req, res) {
        try {

            const { award_id } = req.params;
            const { criterion_name } = req.body;

            const award = await Award.findByPk(award_id, { where: { status: true } });

            if (!award) {
                return res.status(400).json({
                    status: 0,
                    message: 'Prêmio não encontrado!'
                });
            }

            const [criterion] = await Criterion.findOrCreate({
                where: { criterion_name, status: true }
            });

            await award.addCriterion(criterion);

            return res.status(200).json({
                status: 1,
                message: 'Critério associado ao Prêmio com Sucesso!',
                criterion
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    // Cria Associação do Critério com o Período
    async storeAssociationPeriods(req, res) {
        try {

            const { period_id } = req.params;
            const { criterion_name } = req.body;

            const period = await Period.findOne({
                where: {
                    id: period_id,
                    status: true
                }
            });

            if (!period) {
                return res.status(400).json({
                    status: 0,
                    message: 'Período não encontrado!'
                });
            }

            const [criterion] = await Criterion.findOrCreate({
                where: { criterion_name, status: true }
            });

            await period.addCriterion(criterion);

            return res.status(200).json({
                status: 1,
                message: 'Critério associado ao Período com Sucesso!',
                criterion
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Atualizar Critério
    async update(req, res) {

        try {

            const { criterion_name, criterion_description, award_id, period_id } = req.body;
            const { criterion_id } = req.params;

            await Criterion.update({
                criterion_name, criterion_description, period_id
            }, {
                where: {
                    id: criterion_id,
                    status: true
                }
            });

            await Award.update({
                criterion_id
            }, {
                where: {
                    id: award_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Critério atualizado com Sucesso!'
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Deletar Relacionamento   
    async deleteAssociationCriterionAward(req, res) {
        try {

            const { award_id } = req.params;
            const { criterion_name } = req.body;

            const award = await Award.findByPk(award_id, { where: { status: true } });

            if (!award) {
                return res.status(400).json({
                    status: 0,
                    message: 'Prêmio não encontrado'
                });
            }

            const criterion = await Criterion.findOrCreate({
                where: { criterion_name, status: true }
            });

            await award.removeCriterion(criterion);

            return res.status(200).json({
                status: 1,
                message: 'Relacionamento Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Deletar Critério
    async delete(req, res) {

        try {

            const { criterion_id } = req.params;
            const { datapost } = req.body;

            await Criterion.update({ status: false , period_id: null },{
                where: {
                    id: criterion_id,
                    status: true
                }
            });

            await Award.update({ criterion_id: null },{
                where: {
                    criterion_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Critério Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
      // Deletar Critério
    //   async delete(req, res) {

    //     try {

    //         const { criterion_id } = req.params;

    //         await Criterion.destroy({
    //             where: {
    //                 id: criterion_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Critério Deletado com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // },
}