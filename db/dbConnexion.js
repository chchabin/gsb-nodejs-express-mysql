const dotenv = require('dotenv');
const mysql = require('mysql');
// Init environment
dotenv.config();

//Paramétrage de la connexion
const{DB_HOST,DB_USER,DB_PASS,DB_DATABASE}=process.env;
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_DATABASE,
});

//Établissement de la connexion
db.connect((err) => {
  if (err) {
    throw err;
  }
  // console.log('Mysql Connecté ....')
  console.log('Base de données : ' + db.state);
});
query = async (sql, values) => {
  return new Promise((resolve, reject) => {
    const callback = (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    };
    // execute will internally call prepare and query
    db.query(sql, values, callback);
  }).catch((err) => {
    const mysqlErrorList = Object.keys(HttpStatusCodes);
    // convert mysql errors which in the mysqlErrorList list to http status code
    err.status = mysqlErrorList.includes(err.code) ? HttpStatusCodes[err.code] : err.status;

    throw err;
  });
};
const HttpStatusCodes = Object.freeze({
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
  ER_DUP_ENTRY: 409,
});
//Modèle
module.exports = {
  valide: async (param) => {
    //console.log(param)
    try {
      return await new Promise((resolve, reject) => {
        const sql = `SELECT visiteur.id as id, visiteur.nom as nom, visiteur.prenom as prenom 
                       FROM visiteur
                       WHERE visiteur.login = ?
                       AND visiteur.mdp = ?`;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getLogin: async (param) => {
    //console.log(param)
    try {
      return await new Promise((resolve, reject) => {
        const sql = `SELECT visiteur.id as id, visiteur.nom as nom, visiteur.prenom as prenom 
                       FROM visiteur
                       WHERE visiteur.login = ?`;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  dateCourante: async (now = new Date()) => {
    try {
      return await new Promise((resolve, reject) => {
        //console.log(now)
        // now=new Date();

        let numMois = now.getMonth() + 1;
        let numJour = now.getDay();
        const numAnnee = now.getFullYear();
        numMois = numMois.toString().length === 1 ? '0' + numMois : numMois;
        numJour = numJour.toString().length === 1 ? '0' + numJour : numJour;
        const mois = numAnnee.toString() + numMois.toString();
        const dateJour = `${numAnnee}-${numMois}-${numJour}`;
        const dateFr = `${numJour}/${numMois}/${numAnnee}`;
        const retour = {
          mois: mois,
          numMois: numMois,
          numAnnee: numAnnee,
          numJour: numJour,
          dateJour: dateJour,
          dateFr: dateFr,
        };
        //console.log(retour)
        resolve(retour);
      });
    } catch (error) {
      console.log(error);
    }
  },
  estPremierFraisMois: async (param) => {
    try {
      //console.log(param)
      return await new Promise((resolve, reject) => {
        const sql = `select count(*) as nblignesfrais 
                from fichefrais 
                where fichefrais.mois = ? and fichefrais.idvisiteur = ?`;
        let flag = false;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          // console.log(JSON.parse( JSON.stringify(result))[0].nblignesfrais);
          if (JSON.parse(JSON.stringify(result))[0].nblignesfrais === 0) {
            flag = true;
          }
          //console.log(Object.values(JSON.parse(JSON.stringify(result)).nblignesfrais))
          resolve(flag);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  dernierMoisSaisi: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `select max(mois) as dernierMois 
                from fichefrais 
                where fichefrais.idvisiteur = ?`;
        let flag = false;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getLesInfosFicheFrais: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `select fichefrais.idEtat as idEtat, fichefrais.dateModif as dateModif, 
                fichefrais.nbJustificatifs as nbJustificatifs, 
                fichefrais.montantValide as montantValide, etat.libelle as libEtat 
                from  fichefrais inner join etat on fichefrais.idEtat = etat.id 
                where fichefrais.idvisiteur = ? and fichefrais.mois = ?`;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  majEtatFicheFrais: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `update ficheFrais set idEtat = ?, dateModif = now() 
                    where fichefrais.idvisiteur =? and fichefrais.mois = ?`;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  creeNouvellesLignesFrais: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `insert into fichefrais(idvisiteur,mois,nbJustificatifs,montantValide,dateModif,idEtat) 
                values(?,?,?,?,?,?)`;
        const post = [param.idVisiteur, param.mois, 0, 0, param.now, 'CR'];

        db.query(sql, post, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getLesIdFrais: async () => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = 'select fraisforfait.id as idfrais from fraisforfait order by fraisforfait.id';
        const param = {};

        db.query(sql, param, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          //console.log(JSON.stringify(result));

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  creeNouvellesLignesFraisForfait: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `insert into lignefraisforfait(idvisiteur,mois,idFraisForfait,quantite) 
                    values(?,?,?,?)`;

        db.query(sql, param, (err, result) => {
          if (err) throw reject(new Error(err.message));
          //console.log(result);

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  },
  getLesFraisForfait: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `select fraisforfait.id as idfrais, fraisforfait.libelle as libelle,
                    lignefraisforfait.quantite as quantite from lignefraisforfait inner join fraisforfait
                    on fraisforfait.id = lignefraisforfait.idfraisforfait
                    where lignefraisforfait.idvisiteur =? and lignefraisforfait.mois=?
                    order by lignefraisforfait.idfraisforfait`;

        db.query(sql, param, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          // console.log(JSON.stringify(result));

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  majFraisForfait: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `update lignefraisforfait set lignefraisforfait.quantite = ?     
                where lignefraisforfait.idvisiteur = ? and lignefraisforfait.mois = ?         
                and lignefraisforfait.idfraisforfait = ?`;

        db.query(sql, param, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          //console.log(JSON.stringify(result));

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getLesMoisDisponibles: async (param) => {
    try {
      return await new Promise((resolve, reject) => {
        const sql = `select fichefrais.mois as mois from  fichefrais 
                where fichefrais.idvisiteur =?
                order by fichefrais.mois desc `;

        db.query(sql, param, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          //console.log(JSON.stringify(result));

          resolve(result);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
};
