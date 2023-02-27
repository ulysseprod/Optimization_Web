const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const uri = "mongodb+srv://ulysse_prod:Druide.97@prodcluster.d0ccysf.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri)
.then(()=>console.log("Connected to mongo"))
.catch("Error connecting to mongo:")

const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    password:{type:String, required:true, unique:true}
  });

  userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports={mongoose,User}