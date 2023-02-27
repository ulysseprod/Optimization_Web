require('dotenv').config()
const express=require("express");
const app=express();
const cors= require("cors");
const bodyParser=require("body-parser");
const port=3000;
const multer=require("multer");
const path= require("path");


const storage = multer.diskStorage({
  destination: "images/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload= multer({storage:storage})
//connexion a la base de donnée
require("./mongo")

//controllers
const {createUser,logUser}= require("./controllers/users");
const {getSauces,createSauce,authentifyUser,getSauceById,deleteSauce,modifySauce,likeOrDislikeSauce}= require("./controllers/sauces");
const { dirname } = require('path');

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
//routes

app.post("/api/auth/signup",createUser);
app.post("/api/auth/login",logUser);
app.get("/api/sauces",authentifyUser,getSauces);
app.post("/api/sauces",authentifyUser,upload.single("image"),createSauce);
app.get("/api/sauces/:id",authentifyUser,getSauceById);
app.delete("/api/sauces/:id",authentifyUser,deleteSauce);
app.put("/api/sauces/:id",authentifyUser,upload.single("image"),modifySauce);
app.post("/api/sauces/:id/like",authentifyUser,likeOrDislikeSauce)

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  //ecoute sur le ports
  app.use("/images",express.static(path.join(__dirname,"images")));
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })

