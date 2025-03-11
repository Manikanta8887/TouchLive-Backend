const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const mongouri = `${process.env.Mongo_uri}`

mongoose.connect(mongouri)
    .then(() => console.log("Mongodb Connected Successfully"))
    .catch((error) => console.log(error))