
const express = require("express");
const app = express();
require('dotenv').config()
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();


async function AuthGoogle(req, res, next) {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if(!token || token == "null"){
            return res.status(401).json({message: "Token inválido!"});
        }
        const userGoogle = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GoogleClientKey,  
        });
        const payload = userGoogle.getPayload();
        const vaidatedToken =  new Date(payload.exp * 1000);

        if(vaidatedToken > new Date()){
            req.user = payload;
            console.log(req.user);
            next();
        }
        
    }catch(err){
        return res.status(400).json({message: "Erro no servidor!", error: err});
    }
}
module.exports = AuthGoogle;