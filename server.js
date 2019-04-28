const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression')
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

app.ipfs = ipfs;

let ipfsOperation = ipfs.get('/ipfs/QmS4ustL54uo8FzR9455qaxZwuMiUhyvMcX9Ba8nUH4uVv/readme');

ipfsOperation
.then((results) => {
    console.log("IPFS Connected.");
    app.ipfs.connected = true;
})
.catch((err) => {
    app.ipfs.connected = false;
    console.warn("IPFS Not Connected.");
});

const port = process.env.PORT || 3000;

var indexRouter = require('./routes/index');
var galleryRouter = require('./routes/gallery');
var uploadRouter = require('./routes/upload');
var accountRouter = require('./routes/account');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(compression());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public', 'dist')));

app.use('/', indexRouter);
app.use('/gallery', galleryRouter);
app.use('/upload', uploadRouter);
app.use('/account', accountRouter);

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