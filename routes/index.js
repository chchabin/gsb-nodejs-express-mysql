const express = require('express');
const router = express.Router();
const ctrlToken=require('../middelware/checkToken');
const connectionController = require('../controller/connectionController');
const gererFraisController = require('../controller/gererFraisController');
const etatFraisController = require('../controller/etatFraisController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('connexion', {
    data: {},
    message: '',
  });
});
router.post('/connexion', connectionController.connexion);
router.get('/deconnexion', connectionController.deconnexion);
router.get('/gererFrais',ctrlToken.checkToken, gererFraisController.gerefrais);
router.get('/selectionMois', ctrlToken.checkToken,etatFraisController.selectionMois);
router.post('/sauvegarderFrais',ctrlToken.checkToken, gererFraisController.sauvegarderFrais);
router.post('/voirFrais',ctrlToken.checkToken, etatFraisController.voirFrais);
module.exports = router;
