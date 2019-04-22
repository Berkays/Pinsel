var express = require('express');
var router = express.Router();
const path = require('path');

/* GET Upload page. */
router.get('/', function (req, res, next) {
    res.render('upload', { title: 'ArtChain Upload', activeNav: 'upload' });
});

router.post('/', function (req, res) {
    const ipfs = req.app.ipfs;

    console.log(req.files.file.data);

    if (ipfs.connected == false) {
        res.send('IPFS error');
        return;
    }

    if (Object.keys(req.files).length == 0) {
        res.send('No files were uploaded.');
        return;
    }

    const imgFile = req.files.file;
    const imgFileName = imgFile.name;

    const ipfsFileObj = {
        path: path.join('/uploads', imgFileName),
        content: imgFile.data
    };

    const ipfsOperation = ipfs.add(ipfsFileObj);

    const respond = ipfsOperation.then((result) => {
        hash = result[0].hash;
        console.log("File Hash: " + hash);

        const artworkObj = {
            name: req.body.name,
            author: req.body.author,
            description: req.body.description,
            uploadDate: new Date().getTime(),
            hash: hash
        }

        res.send.bind(res);
        var responseObj = JSON.stringify(artworkObj);
        res.status(200).json(responseObj);
    })
        .catch((err) => {
            console.error(err);
            res.send.bind(res);
            res.status(500).send("Error while saving to ipfs");
        });
});

module.exports = router;
