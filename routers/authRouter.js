const express= require("express");
const authRouter= express.Router();

 //controllers
const {createUser,logUser}= require("../controllers/users");

//routes d'inscription et de connextion
authRouter.post("/signup",createUser);
authRouter.post("/login",logUser);

module.exports= {authRouter}