
const jwt= require("jsonwebtoken");

function authentifyUser(req,res,next){
    const authorizHeader=req.header('authorization');
    console.log('authorizHeader: ',authorizHeader);
    if(authorizHeader==null) return res.status(403).send({message:'invalid'});
    const token=authorizHeader.split(" ")[1];
    if(token==null) return res.status(403).send({message:'Token cannot be null'});

    jwt.verify(token, process.env.JWT_PASSWORD, (err,decoded)=>{
        if(err) return res.status(403).send({message:"token cannot be null"+err})
        next();
    })
}

module.exports={authentifyUser}