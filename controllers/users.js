const {User}=require("../models/Usermodel");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

async function createUser(req,res){
  try{
    console.log("signup request",req.body);
    const {email,password}=req.body;
    const hashedpassword= await hashPassword(password);
    const newUser=new User({email,password:hashedpassword});
    await newUser.save();
    res.status(201).send({message:"Utilisateur enregistré(é)"});
  }
    catch(err){
      res.status(403).send({message:"Utilisateur pas enregistré(é)"+ err});
    }
}

async function hashPassword(password){
  const saltrounds=10;
  return bcrypt.hash(password, saltrounds);
    // Store hash in your password DB.;
}


async function logUser(req,res){
  const {email,password}=req.body;
  const user= await User.findOne({email:email})
  console.log('user:',user)
  const isPasswordValid= await bcrypt.compare(password,user.password);
  const token=createToken(email);
  if(!isPasswordValid){
    res.status(403).send({message:"Mot de passe incorect"});
  }
  if(isPasswordValid){
    res.status(201).send({userId:user._id, token:token});
  }
 
}

function createToken(email){
  const jwtPassword= process.env.JWT_PASSWORD
  const token=jwt.sign({email:email},jwtPassword,{expiresIn:"24h"});
  console.log('token: ',token);
  return token;

}

module.exports={createUser,logUser};