const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('./middlewares/auth');


// const upload = multer({dest: '/uploads/'})

const storage = multer.diskStorage({
    destination: './uploads/',
    filename(req, file, cb) {
        if(file !== undefined){
            cb(null, new Date().toISOString()+'-'+file.originalname);
        }
    },
});

 const upload = multer({
    storage: storage,
    limits:{ fileSize: 1024 * 1024 * 5 },
 });


const AverageController = require('./controllers/AverageController');
const UserController = require('./controllers/UserController');
const RoleController = require('./controllers/RoleController');
const TeamController = require('./controllers/TeamController');
const PeriodController = require('./controllers/PeriodController');
const AwardController = require('./controllers/AwardController');
const CriterionController = require('./controllers/CriterionController');
const TiebreakerController = require('./controllers/TiebreakerController');
const RatingController = require('./controllers/RatingController');


//Rota de login
router.post('/users/login', UserController.login); // Tela de Login
router.post('/users/loginGoogle', UserController.loginGoogle); // Login Google oAuth
router.post('/register', upload.single('user_photo'), UserController.register);
router.put('/users/logout', UserController.logout); // Desloga do Sistema

// router.use(authMiddleware);

// Rotas CRUD Usuários
router.get('/userLookUp', UserController.listUserLookUp);
router.get('/userLookUpLeader', UserController.listUserLookUpLeader);
router.get('/users/:user_id', UserController.listUsersData);
router.get('/users/edit/:user_id', UserController.listUserID);
router.get('/dataHeader/:user_id', UserController.getDataHeader);
router.get('/usersRolesTeam/:data_id', UserController.listUsersRolesTeam);
router.get('/usersRatings', UserController.listUsersRatings);
router.get('/usersAverages', UserController.listUsersAverages);
router.get('/usersAwards/:user_id', UserController.listUsersAwards);
router.get('/ranking/:data_id', UserController.listRanking);
router.get('/evaluation/:user_id', UserController.evaluation);
router.post('/addUser', upload.single('user_photo'), UserController.addUser);
router.post('/storeUserTeamAssociation', UserController.storeAssociationUserTeam);
router.put('/update/:user_id', upload.single('user_photo'), UserController.update);
router.put('/users/edit/:user_id', upload.single('user_photo'), UserController.editUser);
router.put('/users/delete/:user_id', UserController.delete);
router.delete('/removeUserTeamAssociation/:datapost', UserController.deleteAssociationUsersTeams);
// router.delete('/users/delete/:user_id', UserController.delete);

// Rotas CRUD Funções
router.get('/roles', RoleController.list);
router.get('/roles/edit/:role_id', RoleController.listRolesID);
router.get('/rolesLookUp', RoleController.listRoleLookUp);
router.get('/rolesUsers', RoleController.listRolesUsers);
router.post('/roles/create', RoleController.store);
router.put('/roles/edit/:role_id', RoleController.update);
router.put('/roles/delete/:role_id', RoleController.delete);
// router.delete('/roles/delete/:role_id', RoleController.delete);

// Rotas CRUD Equipes
router.get('/teams', TeamController.list); //CRUD
router.get('/teamsleader/:period_id', TeamController.listTeamLeader); // DASHBOARD SUPER
router.get('/teamsLookUp', TeamController.listTeamLookUp);
router.get('/teams/edit/:team_id', TeamController.listTeamID); //CRUD
router.post('/users/:user_id/teams', TeamController.storeAssociationUser);
router.post('/teams/create', TeamController.store); //CRUD
router.put('/teams/edit/:team_id', TeamController.update); //CRUD
router.put('/teams/delete/:team_id', TeamController.delete); //CRUD
router.delete('/users/:user_id/teams', TeamController.deleteAssociationTeamsUsers);

// Rotas CRUD Períodos
router.get('/periods', PeriodController.list); //CRUD Períodos
router.get('/periodsLookUp', PeriodController.listPeriodLookUp); //LookUp Períodos (Criterion View)
router.get('/periodsCriterions', PeriodController.listPeriodsCriterions); //Listar Critérios do último período (Criterion View)
router.get('/periodsCriterions/:period_id', PeriodController.listPeriodsCriterionsId); //Atualiza Critérios do período selecionado (Criterion View)
router.get('/periodsAwards', PeriodController.listPeriodsAwards); //Listar Prêmios do último período (Awards View)
router.get('/periodsAwards/:period_id', PeriodController.listPeriodsAwardsId); //Atualiza Prêmios do período selecionado (Award View)
router.get('/periodsRatings', PeriodController.listPeriodsRatings);
router.get('/period/edit/:period_id', PeriodController.listPeriodID); //CRUD
router.post('/periods/create', PeriodController.store);//CRUD Períodos
router.put('/periods/activePeriod', PeriodController.setPeriodActive); //Denife o período ativo
router.put('/period/edit/:period_id', PeriodController.update);//CRUD Períodos
router.put('/periods/delete/:period_id', PeriodController.delete);//CRUD Períodos
// router.delete('/periods/delete/:period_id', PeriodController.delete);//CRUD Períodos

// Rotas CRUD Prêmios
router.get('/awards', AwardController.list);
router.get('/awardsCriterions', AwardController.listAwardCriterions);
router.get('/awardsLookUp', AwardController.listAwardsLookUp);
router.get('/awards/edit/:award_id', AwardController.listAwardID);
router.post('/awards/create', AwardController.store);
router.put('/award/edit/:award_id', AwardController.update);
router.put('/award/delete/:award_id', AwardController.delete);
// router.delete('/criterions/:criterion_id/awards', AwardController.deleteAssociationAwardCriterion);

// Rotas CRUD Critérios
router.get('/criterions', CriterionController.list);
router.get('/criterionsLookUp', CriterionController.listCriterionsLookUp);
router.get('/criterions/edit/:criterion_id', CriterionController.listCriterionID);
router.post('/criterions/create', CriterionController.store);
router.put('/criterion/edit/:criterion_id', CriterionController.update);
router.put('/criterions/delete/:criterion_id', CriterionController.delete);
// router.delete('/criterions/delete/:criterion_id', CriterionController.delete);

// Rotas CRUD Critério de Desempate
router.get('/tiebreakers', TiebreakerController.list);
router.get('/tiebreakersLookUp', TiebreakerController.listTiebreakLookUp);
router.get('/tiebreak/edit/:tiebreak_id', TiebreakerController.listTiebreakID);
router.post('/tiebreak/create', TiebreakerController.store);
router.put('/tiebreak/edit/:tiebreak_id', TiebreakerController.update);
router.put('/tiebreak/delete/:tiebreaker_id', TiebreakerController.delete);
// router.delete('/tiebreak/delete/:tiebreaker_id', TiebreakerController.delete);

// Rotas CRUD Avaliação
router.post('/listRatings/:user_id', RatingController.list);
router.get('/ratings/:user_id', RatingController.ratingsPeriod);
router.get('/rating/edit/:rating_id', RatingController.listRatingID);
router.get('/finalistsWinners/:user_id', RatingController.finalistsWinners);
router.post('/ratings', RatingController.store);
router.post('/evaluation/:period_id', RatingController.evaluation);
router.put('/rating/edit/:rating_id', RatingController.update);
router.put('/rating/delete/:rating_id', RatingController.delete);
// router.delete('/rating/delete/:rating_id', RatingController.delete);

// Rotas Médias
router.get('/averages', AverageController.list);
router.get('/averages/:user_id', AverageController.listAveragesPeriods);
router.get('/cumulativeAverageTeam/:data_id', AverageController.getCumulativeAverageTeam);
router.post('/averages', AverageController.store);
router.put('/averages/:average_id', AverageController.update);
router.delete('/averages/:average_id', AverageController.delete);

// Rotas Cadastrar Desempatee Nota Final
router.put('/tiebreak/add', RatingController.storeTiebreaker);

// Rotas Cadastrar Premiação
router.put('/award/add', RatingController.storeAward);

//Relatórios
router.get('/report/average/total/:period_id', AverageController.totalAveragePeriod);
router.get('/report/average/totalPeriod', AverageController.totalAveragePerPeriod);
router.get('/report/average/TeamPeriod', AverageController.totalAverageTeamPeriod);
router.get('/report/average/TeamPerPeriod', AverageController.totalAverageTeamPerPeriod);
router.get('/report/awardUsers', RatingController.awardUsers);

//Controle de Rotas na API por Team
router.get('/routes/team/:user_id', TeamController.getTeam);


module.exports = router;