require('dotenv').config()
const {app,express}= require("./server");
const port=3000;
const path= require("path");
const {Saucerouter}= require("./routers/Saucesrouter")
const {authRouter}=require("./routers/authrouter")

console.log("variable d'environnement",process.env.DATABASE_PASSWORD)
//connexion a la base de donnée
require("./models/Usermodel")

const { dirname } = require('path');

//middleware
app.use("/api/sauces",Saucerouter);
app.use("/api/auth", authRouter)

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  //ecoute sur le ports
  app.use("/images",express.static(path.join(__dirname,"images")));
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })

