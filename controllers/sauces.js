const jwt= require("jsonwebtoken");
const mongoose= require("mongoose");
const SauceSchema= new mongoose.Schema({
    userId : String,
    name : String ,
    manufacturer : String ,
    description : String ,
    mainPepper : String,
    imageUrl : String,
    heat : Number,
    likes : Number,
    dislikes : Number,
    usersLiked : [String],
    usersDisliked : [String]
})

const Product= mongoose.model("product", SauceSchema);

function authentifyUser(req,res,next){
    const authorizHeader=req.header('authorization');
    if(authorizHeader==null) return res.status(403).send({message:'invalid'});
    const token=authorizHeader.split(" ")[1];
    if(token==null) return res.status(403).send({message:'Token cannot be null'});

    jwt.verify(token, process.env.JWT_PASSWORD, (err,decoded)=>{
        if(err) return res.status(403).send({message:"token cannot be null"+err})
        next();
    })
}

function getSauces(req,res){
    Product.find({}).then((products)=>res.send(products)).catch(error=>res.status(500).send(error));
   }

async function getSauceById(req,res){
    try{
        const {id}=req.params;
        const product= await Product.findById(id);
        res.send(product)
    } catch (error){
        res.status(500).send(error)
    }
}

async function deleteSauce(req,res){
    try{
        const {id}=req.params;
        const product= await Product.findByIdAndDelete(id);
        res.send({message:product})
    } catch (error){
        res.status(500).send({message:error})
    }
}

function modifySauce(req,res){
    const {params: {id}}=req;
    const ModifiedImage= req.file !=null;
    const payload= makePayload(ModifiedImage,req);

    Product.findByIdAndUpdate(id,payload)
        .then((dbResponse) => sendClientResponse(dbResponse,res))
        .catch((err)=> console.error("Problem Updating",err));
}

function makePayload(ModifiedImage,req){
    if(!ModifiedImage) return req.body;
    const payload= JSON.parse(req.body.sauce);
    payload.imageUrl=makeImageAccessible(req,req.file.filename);
    return payload;
}

function sendClientResponse(dbProduct,res){
   if(dbProduct==null) {
        res.status(404).send({message:"Object is not in the database"});
   }
   res.status(200).send({message:"update is successful"});
}
function makeImageAccessible(req,filename){
    return req.protocol + '://' + req.get('host') + "/images/"+filename;
}

function createSauce(req,res){
    const body= req.body;
    const file= req.file;
    const {filename}=file;
    const sauce= JSON.parse(body.sauce);
    const {name,manufacturer,description,mainPepper,heat,userId}=sauce;

    const product= new Product({
        userId,
        name,
        manufacturer,
        description,
        mainPepper,
        imageUrl:makeImageAccessible(req,filename),
        heat,
        likes:0,
        dislikes:0,
        usersLiked:[],
        userDisliked:[]
    })
    product.save().then((message)=>{
        res.status(201).send({message:message})
        return console.log("produit enregistré", message);
    });
    console.log({name,manufacturer});
}

function getSauce(req){
    const {id}=req.params;
    return Product.findById(id);
}

function likeOrDislikeSauce(req,res){
    const{like,userId}=req.body;
    if(![0,-1,1].includes(like)) return res.status(400).send({message:"bad request"});
    
    getSauce(req,res)
        .then((product)=>updateVote(product,like,userId,res))
        .then(product => sendClientResponse(product,res))
        .catch((err)=>res.status(500).send(err))
}

function updateVote(product,like,userId){
    if(like===1) incrementLikes(product,userId);
    if(like===-1) incrementDislikes(product,userId);
    return product.save();
}

function incrementLikes(product,userId){
    const {usersLiked}=product;
    if(usersLiked.includes(userId)) return
    usersLiked.push(userId);
    product.likes++;
}

function incrementDislikes(product,userId){
    const {usersDisliked}=product;
    if(usersDisliked.includes(userId)) return
    usersDisliked.push(userId);
    product.dislikes++;
}


module.exports={getSauces,createSauce,authentifyUser,getSauceById,deleteSauce,modifySauce,likeOrDislikeSauce};