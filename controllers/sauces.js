const jwt= require("jsonwebtoken");
const mongoose= require("mongoose");
const {unlink}= require("fs");

const Product= require("../models/Saucemodel");

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

function deleteSauce(req,res){
   const {id}= req.params;
   const authid=req.body.userId;
   const product=Product.findById(id);

   if(product.userId==authid){
        Product.findByIdAndDelete(id)
            .then(deleteImage)
            .then(product => res.send({message: product}))
            .catch(err=> res.status(500).send({message:err}))
}else{
    return res.status(403).send({message:"Vous n'etes pas l'auteur de cette sauce"});
}

}

function deleteImage(product){
    const imageUrl= product.imageUrl;
    const fileToDelete= imageUrl.split("/").at(-1);
    unlink(`images/${fileToDelete}`,err => {
        if(err) throw err;
    })
    return product;
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

function makeImageAccessible(req,filename){
    return req.protocol + '://' + req.get('host') + "/images/"+filename;
}


function sendClientResponse(dbProduct,res){
   if(dbProduct==null) {
        res.status(404).send({message:"Object is not in the database"});
   }
   res.status(200).send({message:"update is successful"});
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
    if(like===0) resetVote(product,userId);
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

function resetVote(product,userId){
    const {usersLiked,usersDisliked}=product;
    if(usersLiked.includes(userId)){
        usersLiked.pull(userId);
        product.likes--;
        if(product.likes<0){
            product.likes=0;
        }
    }
    else if(usersDisliked.includes(userId)){
        usersDisliked.pull(userId);
        product.dislikes--;
        if(product.dislikes<0){
            product.dislikes=0;
        }
    }
}

module.exports={getSauces,createSauce,getSauceById,deleteSauce,modifySauce,likeOrDislikeSauce};