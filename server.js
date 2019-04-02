const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const app = express();

const Web3 = require('web3');
const truffle_connect = require('./connection/app.js');

const port = process.env.PORT || 3000;

var indexRouter = require('./routes/index');
var galleryRouter = require('./routes/gallery');
var uploadRouter = require('./routes/upload');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public/dist')));

app.use('/', indexRouter);
app.use('/gallery', galleryRouter);
app.use('/upload', uploadRouter);

app.listen(port, () => {
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //truffle_connect.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.log("Express Listening at http://localhost:" + port);
});

module.exports = app;