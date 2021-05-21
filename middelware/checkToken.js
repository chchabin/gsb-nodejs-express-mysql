const db = require('../db/dbConnexion');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  checkToken : async (req, res, next) =>{
    try{
      const{ACCESS_JWT_SECRET}=process.env;
      const myToken = localStorage.getItem('myToken');
      const secretKey=ACCESS_JWT_SECRET??'';
      jwt.verify(myToken, secretKey);
    }
    catch (e) {
      localStorage.removeItem('myToken')
      const data = {};
      res.status(400).render('connexion',{
        data: data,
        mdp:'',        message:`Le jeton n'est pas valide.`
      });
    }

      next();

  },
  decodeToken : async (req, res, next) =>{
    const{ACCESS_JWT_SECRET}=process.env;
    const myToken = localStorage.getItem('myToken');
    const secretKey=ACCESS_JWT_SECRET??'';
    return jwt.verify(myToken, secretKey);
  }
}
