const User = require('../models/User');
const Role = require('../models/Role');



module.exports = {


    //Listar somente as Funções
    async list(req, res) {

        try {

            const roles = await Role.findAll({
                where: { status: true },
                attributes: ['id', 'role_name', 'role_access', 'role_description'],
            });

            if (roles == '' || roles == null) {
                return res.status(200).send({ message: 'Nenhuma função cadastrada' })
            }

            return res.status(200).json({
                success: true,
                roles
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Listar Usuários por ID
    async listRolesID(req, res) {

        try {
            const { role_id } = req.params;
            const roles = await Role.findOne({
                where: { id: role_id, status: true },
                attributes: ['role_name', 'role_access', 'role_description'],
            });

            if (roles == '' || roles == null) {
                return res.status(200).send({ message: 'Nenhuma função cadastrada' })
            }

            return res.json({ success: true, roles });

        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Listar Funções LookUp
    async listRoleLookUp(req, res) {

        try {

            const roles = await Role.findAll({
                where: { status: true },
                attributes: ['id', 'role_name'],
            });

            if (roles == '' || roles == null) {
                return res.status(200).send({ message: 'Nenhuma função cadastrada' })
            }

            return res.status(200).json({
                success: true,
                roles
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Listar Função associada ao usuário
    async listRolesUsers(req, res) {

        try {

            const roles = await Role.findAll({
                where: { status: true },
                include: [
                    {
                        attributes: ['user_name', 'user_email'],
                        as: 'user',
                        //as: 'rating_evaluator',
                        model: User,
                    }]
            });

            if (roles == '' || roles == null) {
                return res.status(200).send({ message: 'Nenhuma função cadastrada' })
            }

            return res.status(200).send({ roles });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Criar
    async store(req, res) {

        try {
            const { role_name, role_access, role_description } = req.body;

            await Role.create({ role_name, role_access, role_description, status: true });

            return res.status(200).json({
                success: true,
                message: 'Função cadastrada com sucesso!',
            })
        } catch (err) {
            return res.status(400).json({ error: err })
        }
    },

    //Atualizar
    async update(req, res) {

        try {

            const { role_name, role_access, role_description } = req.body;
            const { role_id } = req.params;

            await Role.update({
                role_name, role_access, role_description
            }, {
                where: {
                    id: role_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Função atualizada com Sucesso!'
            });


        } catch (err) {
            return res.status(400).json({ error: err })
        }

    },

    //Deletar
    async delete(req, res) {

        try {

            const { role_id } = req.params;
            const { datapost } = req.body;

            await Role.update({ status: false }, {
                where: {
                    id: role_id,
                    status: true
                }
            });

            await User.update({ role_id: null },{
                where: {
                    role_id,
                    status: true
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Função Removida com Sucesso!'
            });

        } catch (err) {
            return res.status(400).json({ error: err })
        }
    }

    // //Deletar
    // async delete(req, res) {

    //     try {

    //         const { role_id } = req.params;

    //         await Role.destroy({
    //             where: {
    //                 id: role_id,
    //                 status: true
    //             }
    //         });

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Função Deletada com Sucesso!'
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ error: err })
    //     }
    // }
}