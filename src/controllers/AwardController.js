const Award = require('../models/Award');
const Criterion = require('../models/Criterion');
const Period = require('../models/Period');

module.exports = {

    //Listar Prêmios
    async list(req, res) {

        try {

            const awards = await Award.findAll({
                where: { status: true },
                attributes: ['id', 'award_name', 'award_description'],

                include: [
                    {
                        attributes: ['id', 'criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    },
                    {
                        attributes: ['id', 'period_name',],
                        as: 'periods',
                        model: Period,
                    }]
            });

            if (awards == '' || awards == null) {
                return res.status(200).send({ message: 'Nenhum prêmio cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                awards
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    async listAwardID(req, res) {

        try {
            const { award_id } = req.params;

            const award = await Award.findOne({
                where: { id: award_id, status: true },
                attributes: ['id', 'award_name', 'award_description'],

                include: [
                    {
                        attributes: ['id', 'criterion_name'],
                        as: 'criterions',
                        model: Criterion,
                    },
                    {
                        attributes: ['id', 'period_name',],
                        as: 'periods',
                        model: Period,
                    }]
            });

            if (award == '' || award == null) {
                return res.status(200).send({ message: 'Nenhum prêmio cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                award
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Funções LookUp
    async listAwardsLookUp(req, res) {

        try {

            const awards = await Award.findAll({
                where: { status: true },
                attributes: ['id', 'award_name'],
            });

            if (awards == '' || awards == null) {
                return res.status(200).send({ message: 'Nenhum prêmio cadastrado' })
            }

            return res.status(200).json({
                success: true,
                awards
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Listar Prêmios e Critérios associados
    async listAwardCriterions(req, res) {

        try {

            const award = await Award.findAll({
                where: { status: true },
                attributes: ['award_name', 'award_description'],
                include: [{
                    attributes: ['criterion_name'],
                    as: 'criterions',
                    model: Criterion,
                }]
            });

            if (award == '' || award == null) {
                return res.status(200).send({ message: 'Nenhum prêmio cadastrado!' })
            }

            return res.status(200).send({ award });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Criar Prêmio
    async store(req, res) {

        try {
            const { award_name, award_description, criterion_id, period_id } = req.body;

            // Verifica se o critério associado já está associado a outro prêmio
            if(criterion_id !== null){
                let criterion = await Award.findOne({
                    where: {
                        criterion_id,
                        status: true
                    }
                });
                if(criterion !== null){
                    return res.status(200).json({
                        success: false,
                        message: 'O Critério escolhido já está sendo utilizado! Favor selecione ou crie outro!'
                    })
                }
            }
            
            await Award.create({ award_name, award_description, criterion_id, period_id, status: true });

            return res.status(200).json({
                success: true,
                message: 'Prêmio cadastrado com sucesso!'
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    // Cria Associação do Prêmio com Critério
    async storeAssociationAwardCriterions(req, res) {
        try {

            const { criterion_id } = req.params;
            const { award_name } = req.body;

            const criterion = await Criterion.findByPk(criterion_id, { where: { status: true } });

            if (!criterion) {
                return res.status(400).json({
                    status: 0,
                    message: 'Critério não encontrado!'
                });
            }

            const [award] = await Award.findOrCreate({
                where: { award_name, status: true }
            });

            await criterion.addAward(award);

            return res.status(200).json({
                status: 1,
                message: 'Prêmio associado ao Critério com Sucesso!',
                award
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    // Cria Associação do Prêmio com o Período
    async storeAssociationAwardsPeriods(req, res) {
        try {

            const { period_id } = req.params;
            const { award_name } = req.body;

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

            const [award] = await Award.findOrCreate({
                where: { award_name, status: true }
            });

            await period.addAward(award);

            return res.status(200).json({
                status: 1,
                message: 'Prêmio associado ao Período com Sucesso!',
                award
            });
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Atualizar Prêmio
    async update(req, res) {

        try {

            const { award_name, award_description, criterion_id, period_id } = req.body;
            const { award_id } = req.params;

            // Verifica se o critério associado já está associado a outro prêmio
            if(criterion_id !== null){
                const criterion = await Award.findOne({
                    where: {
                        criterion_id,
                        status: true
                    }
                });
                if(criterion !== null && criterion.id !== Number(award_id)){ 
                    return res.status(200).json({
                        success: false,
                        message: 'O Critério escolhido já está sendo utilizado! Favor selecione ou crie outro!'
                    })
                }
            }

            await Award.update({ award_name, award_description, criterion_id, period_id }, {
                where: {
                    id: award_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Prêmio atualizado com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    // Deletar Prêmio
    async delete(req, res) {

        try {

            const { award_id } = req.params;

            const { datapost } = req.body;

            await Award.update({ status: false, period_id: null, criterion_id: null },{
                where: {
                    id: award_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Prêmio Deletado com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    // // Deletar Prêmio
    // async delete(req, res) {

    //     try {

    //         const { award_id } = req.params;

    //         await Award.destroy({
    //             where: {
    //                 id: award_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Prêmio Deletado com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // },
    // Deletar Relacionamento   
    async deleteAssociationAwardCriterion(req, res) {
        try {

            const { criterion_id } = req.params;
            const { award_name } = req.body;

            const criterion = await Criterion.findByPk(criterion_id, { where: { status: true } });

            if (!criterion) {
                return res.status(400).json({
                    status: 0,
                    message: 'Critério não encontrado'
                });
            }

            const award = await Award.findOrCreate({
                where: { award_name, status: true }
            });

            await criterion.removeAward(award);

            return res.status(200).json({
                status: 1,
                message: 'Relacionamento Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    }
}