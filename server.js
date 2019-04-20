const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
var compression = require('compression')
const fileUpload = require('express-fileupload');
const app = express();

const Web3 = require('web3');
const truffle_connect = require('./connection/app.js');

const ipfsClient = require('ipfs-http-client');
// leaving out the arguments will default to these values
// or connect with multiaddr
const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

app.ipfs = ipfs;

ipfs.get('/ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme',(err,files) => {
    console.log(files);
});

const port = process.env.PORT || 3000;

var indexRouter = require('./routes/index');
var galleryRouter = require('./routes/gallery');
var uploadRouter = require('./routes/upload');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public', 'dist')));

app.use('/', indexRouter);
app.use('/gallery', galleryRouter);
app.use('/upload', uploadRouter);

// app.listen(port, () => {
//     // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
//     //truffle_connect.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//     console.log("Express Listening at http://localhost:" + port);
// });

app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;