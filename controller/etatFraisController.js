const db = require('../db/dbConnexion');
const ctrlToken=require('../middelware/checkToken');

module.exports = {
  selectionMois: async (req, res) => {
    try {
      const decode=await ctrlToken.decodeToken();
      console.log(JSON.stringify(decode));
      if (decode.etat === 'visiteur') {
        const idVisiteur = decode.id;
        const anneeMois = await db.dateCourante();
        const mois = anneeMois.mois;
        const lesMois = await db.getLesMoisDisponibles([idVisiteur]);
        //console.log(lesMois)
        const maxMois = lesMois.reduce((lesMois, b) => (lesMois.mois > b.mois ? lesMois : b)).mois;

        res.render('listemois', {
          nom: decode.nom,
          prenom: decode.prenom,
          lesMois: lesMois,
          leMois: maxMois,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  voirFrais: async (req, res) => {
    try {
      const decode=await ctrlToken.decodeToken();
      if (decode.etat === 'visiteur') {
        const idVisiteur = decode.id;
        const leMois = req.body.lstMois;
        const lesMois = await db.getLesMoisDisponibles([idVisiteur]);
        const lesFraisForfait = await db.getLesFraisForfait([idVisiteur, leMois]);
        const lesInfosFicheFrais = await db.getLesInfosFicheFrais([idVisiteur, leMois]);
        const mesInfosFicheFrais = lesInfosFicheFrais[0];
        const libEtat = mesInfosFicheFrais.libEtat;
        const montantValide = mesInfosFicheFrais['montantValide'];
        const nbJustificatifs = mesInfosFicheFrais['nbJustificatifs'];
        let dateModif = await db.dateCourante(mesInfosFicheFrais['dateModif']);
        dateModif = dateModif.dateFr;
        // console.log("LIGNE 39"+typeof (dateModif))
        //console.log("LIGNE 40"+JSON.stringify(mesInfosFicheFrais))

        res.render('listefrais', {
          nom: decode.nom,
          prenom: decode.prenom,
          leMois: leMois,
          lesMois: lesMois,
          numMois: leMois.slice(-2),
          numAnnee: leMois.slice(0, 4),
          lesFraisForfait: lesFraisForfait,
          libEtat: libEtat,
          montantValide: montantValide,
          nbJustificatifs: nbJustificatifs,
          dateModif: dateModif,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
