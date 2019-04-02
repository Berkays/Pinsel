var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET Browser page. */
router.get('/', function (req, res, next) {
    res.render('upload', { title: 'ArtChain Upload', activeNav: 'upload' });
});

router.post('/', function(req, res) {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let imgFile = req.files.file;
    let imgFileName = req.files.file.name;
    console.log(imgFileName);

    upload_date = new Date().toISOString().slice(0, 10);

    var obj = {
        "name": req.body.name,
        "description": req.body.description,
        "author": req.body.author,
        "file": '/uploads/' + imgFileName,
        "upload_date": upload_date,
        "total_donation":0,
        "donation_count":0
    }

    var db = JSON.parse(fs.readFileSync('./uploads.json', 'utf8'));
    db['artworks'].push(obj);

    fs.writeFile('./uploads.json', JSON.stringify(db), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

    console.log(db);

    imgFile.mv('./public/dist/uploads/' + imgFileName, function(err) {
        if (err)
        return res.status(500).send(err);

        res.send('File uploaded!');
    });
});

module.exports = router;
