const db = require('../db/dbConnexion');
const math = require('mathjs');
const ctrlToken=require('../middelware/checkToken');

module.exports = {
  gerefrais: async (req, res) => {
    try {
      const decode=await ctrlToken.decodeToken();
      if (decode.etat === 'visiteur') {
        const idVisiteur = decode.id;
        const anneeMois = await db.dateCourante();
        const mois = anneeMois.mois;

        //console.log(`ligne 12 ${await db.estPremierFraisMois([idVisiteur,mois])} et ${mois}`)
        if (await db.estPremierFraisMois([mois, idVisiteur])) {
          const dernierMois = await db.dernierMoisSaisi([idVisiteur]);
          const laDerniereFiche = await db.getLesInfosFicheFrais([idVisiteur, dernierMois]);
          if (laDerniereFiche.idEtat === 'CR') {
            await db.majEtatFicheFrais(['CL', idVisiteur, dernierMois]);
          }
          const post = {
            idVisiteur: idVisiteur,
            mois: mois,
            now: anneeMois.dateJour,
          };
          const retour = await db.creeNouvellesLignesFrais(post);
          const lesIdFrais = await db.getLesIdFrais();
          //console.log(`ligne 26 ${lesIdFrais}`)
          //const lesIdFrais2=JSON.parse(lesIdFrais.toString())
          for (const uneLigneIdFrais of lesIdFrais) {
            const unIdFrais = uneLigneIdFrais.idfrais;
            // console.log(`ligne 28 ${uneLigneIdFrais.idfrais}`)

            await db.creeNouvellesLignesFraisForfait([idVisiteur, mois, unIdFrais, 0]);
          }
        }
        const lesFrais = await db.getLesFraisForfait([idVisiteur, mois]);
        // console.log(`ligne 37 ${JSON.stringify(lesFrais)}`)

        res.status(200).render('majFraisForfait', {
          nom: decode.nom,
          prenom: decode.prenom,
          numMois: anneeMois.numMois,
          numAnnee: anneeMois.numAnnee,
          lesFrais: lesFrais,
          method: 'GET',
          message: '',
        });
      } else {
        const message = 'Les frais sont déjà saisis';
        res.render('connexion', {
          message: message,
        });
      }
    } catch (error) {
      res.status(500).render('connexion', {
        message: error.message,
      });
      console.log(error);
    }
  },
  sauvegarderFrais: async (req, res) => {
    try {
      const decode=await ctrlToken.decodeToken();
      if (decode.etat === 'visiteur') {
        const idVisiteur = decode.id;
        const anneeMois = await db.dateCourante();
        const mois = anneeMois.mois;
        const lesFrais = [
          {
            idfrais: 'ETP',
            libelle: req.body['lesLibFrais[]'][0],
            quantite: req.body.ETP,
          },
          {
            idfrais: 'KM',
            libelle: req.body['lesLibFrais[]'][1],
            quantite: req.body.KM,
          },
          {
            idfrais: 'NUI',
            libelle: req.body['lesLibFrais[]'][2],
            quantite: req.body.NUI,
          },
          {
            idfrais: 'REP',
            libelle: req.body['lesLibFrais[]'][3],
            quantite: req.body.REP,
          },
        ];
        let flag = true;
        for (const unFrais of lesFrais) {
          if (!math.isNumeric(parseInt(unFrais.quantite))) {
            flag = false;
          }
        }
        if (flag) {
          for (const unFrais of lesFrais) {
            await db.majFraisForfait([
              parseInt(unFrais.quantite),
              idVisiteur,
              mois,
              unFrais.idfrais,
            ]);
          }
          res.status(200).render('majFraisForfait', {
            nom: decode.nom,
            prenom: decode.prenom,
            numMois: anneeMois.numMois,
            numAnnee: anneeMois.numAnnee,
            method: 'POST',
            lesFrais: lesFrais,
            message: 'Votre fiche a été mise à jour',
          });
        } else {
          console.log('erreur dans une quantité');
          res.status(200).render('majFraisForfait', {
            nom: decode.nom,
            prenom: decode.prenom,
            numMois: anneeMois.numMois,
            numAnnee: anneeMois.numAnnee,
            method: 'POST',
            lesFrais: lesFrais,
            message: 'Les valeurs des frais doivent être numériques',
          });
        }
        //console.log(typeof (frais)+" frais"+ frais)
        //console.log("LIGNE 63"+JSON.stringify(req.body ['lesLibFrais[]'][0]))
      } else {
        const message = 'Les frais sont déjà saisis';
        res.status(500).render('connexion', {
          message: message,
        });
      }
    } catch (error) {
      res.status(500);
      console.log(error);
    }
  },
};
