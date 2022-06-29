//Depedencies
const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose');
const routes = require('./routers/router')
const cookieParser =  require('cookie-parser')
const methodOverride = require("method-override");


//serving statics files, middlewares, and other.
app.use(express.static(__dirname + ('/public')));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));


//database connect
const dbUrl = "mongodb+srv://Abe:node123@cluster0.aseat.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(dbUrl)
.then((result)=>{
    app.listen(process.env.PORT_NUM || 8000, ()=>{
        console.log(`App is listening on ${process.env.PORT_NUM}`)
    })
})
.catch((err)=>{
    console.log(err)
});
app.get(' ', (req, res)=>{
    res.send('Now I can sleep, this is working')
});

app.use('/Home', routes)

