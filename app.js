var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var key = require('./db')
var indexRouter = require('./routes/index');
var app = express();
const mongoose=require('mongoose')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(key.url, (err, res)=>{
  console.log('Connection succesfully')
})
app.use('/', indexRouter);

app.listen(8080, (req, res)=>{
  console.log('this server run on 8080')
})
