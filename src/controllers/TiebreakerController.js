const Tiebreaker = require('../models/Tiebreaker');

module.exports = {

    //Listar Tiebreaker
    async list(req, res) {

        try {
            const tiebreakers = await Tiebreaker.findAll({
                where: { status: true },
                attributes: ['id', 'tiebreaker_name', 'tiebreaker_weight'],
            });

            if (tiebreakers == '' || tiebreakers == null) {
                return res.status(200).send({ message: 'Nenhum Critério de Desempate cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                tiebreakers
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Listar Tiebreaker LookUp
    async listTiebreakLookUp(req, res) {

        try {
            const tiebreakers = await Tiebreaker.findAll({
                where: { status: true },
                attributes: ['id', 'tiebreaker_name', 'tiebreaker_weight'],
            });

            if (tiebreakers == '' || tiebreakers == null) {
                return res.status(200).send({ message: 'Nenhum Critério de Desempate cadastrado!' })
            }

            return res.status(200).json({
                success: true,
                tiebreakers
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    async listTiebreakID(req, res) {

        try {
            const { tiebreak_id } = req.params;

            const tiebreak = await Tiebreaker.findOne({
                where: { id: tiebreak_id, status: true },
                attributes: ['id', 'tiebreaker_name', 'tiebreaker_weight'],
            });

            if (tiebreak == '' || tiebreak == null) {
                return res.status(200).send({ message: 'Nenhum Critério de Desempate encontrado!' })
            }

            return res.status(200).json({
                success: true,
                tiebreak
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },
    //Criar Tiebreaker
    async store(req, res) {

        try {
            const { tiebreaker_name, tiebreaker_weight } = req.body;

            await Tiebreaker.create({ tiebreaker_name, tiebreaker_weight, status: true });

            return res.status(200).json({
                success: true,
                message: 'Critério de Desempate cadastrado com sucesso!',
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Atualizar Tiebreaker
    async update(req, res) {

        try {

            const { tiebreaker_name, tiebreaker_weight } = req.body;
            const { tiebreak_id } = req.params;

            await Tiebreaker.update({
                tiebreaker_name, tiebreaker_weight
            }, {
                where: {
                    id: tiebreak_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Critério de Desempate atualizado com Sucesso!'
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },
    //Deletar Tiebreaker
    async delete(req, res) {

        try {
            const { tiebreaker_id } = req.params;

            const { datapost } = req.body;

            await Tiebreaker.update({ status: false },{
                where: {
                    id: tiebreaker_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Critério de Desempate Removido com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    }
    // //Deletar Tiebreaker
    // async delete(req, res) {

    //     try {
    //         const { tiebreaker_id } = req.params;

    //         await Tiebreaker.destroy({
    //             where: {
    //                 id: tiebreaker_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Critério de Desempate Removido com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // }
}