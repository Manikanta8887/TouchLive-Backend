const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const mongouri = `mongodb+srv://${process.env.name}:${process.env.password}@touchlive.phqnk.mongodb.net/?retryWrites=true&w=majority&appName=Touchlive`

mongoose.connect(mongouri)
    .then(() => console.log("Mongodb Connected Successfully"))
    .catch((error) => console.log(error))