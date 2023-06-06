const express= require("express");
const Saucerouter= express.Router();
const {authentifyUser}= require("../middleware/auth");
const {upload}= require("../middleware/multer");
const {getSauces,createSauce,getSauceById,deleteSauce,modifySauce,likeOrDislikeSauce}= require("../controllers/sauces");

module.exports={Saucerouter};

//routes des sauces
Saucerouter.get("/",authentifyUser,getSauces);
Saucerouter.post("/",authentifyUser,upload.single("image"),createSauce);


Saucerouter.get("/:id",authentifyUser,getSauceById);
Saucerouter.delete("/:id",authentifyUser,deleteSauce);
Saucerouter.put("/:id",authentifyUser,upload.single("image"),modifySauce);
Saucerouter.post("/:id/like",authentifyUser,likeOrDislikeSauce)