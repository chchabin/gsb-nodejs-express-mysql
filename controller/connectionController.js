const db = require('../db/dbConnexion');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  connexion: async (req, res) => {
    try {
      const{ACCESS_JWT_SECRET,ACCESS_JWT_EXPIRES_IN}=process.env;
      const param = req.body;
      const post = [param.login, param.mdp];

      // Récupération du tableau d'objet [{"id":"xx","nom":"xx","prenom":""}]
      const tbVisiteur = await db.valide(post);
      const visiteur=tbVisiteur[0];

      if (tbVisiteur.length === 0) {
        const message = 'Login ou mot de passe incorrect';
        res.status(401);
        res.render('connexion', {
          data: param,
          message: message,
        });
      } else {
        // res.json(visiteur[0].nom)
/*
        req.session.nom = visiteur[0].nom;
        req.session.prenom = visiteur[0].prenom;
        req.session.etat = 'visiteur';
        req.session.agent = visiteur[0];
*/
        // Création du jeton
        const secretKey=ACCESS_JWT_SECRET??'';
        const token=jwt.sign({
          id:visiteur.id,
          nom:visiteur.nom,
          prenom:visiteur.prenom,
          etat:'visiteur',
        },secretKey,{
          expiresIn: ACCESS_JWT_EXPIRES_IN
        })
        // Enregistrement du jeton
        localStorage.setItem('myToken', token);

        res.status(200);
        res.render('sommaire', {
          nom: visiteur.nom,
          prenom: visiteur.prenom,
        });
      }
    } catch (error) {
      res.status(500).render('connexion');
      console.log(error);
    }
  },
  deconnexion: async (req, res) => {
    //req.session.destroy();
    localStorage.removeItem('myToken')
    console.log('Session Destroyed');
    const message = 'Déconnexion réussie !';
    const data = {};
    res.render('connexion', {
      data: data,
      message: message,
    });
  },
};
