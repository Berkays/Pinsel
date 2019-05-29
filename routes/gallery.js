var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

router.get('/', function (req, res, next) {
    res.render('gallery', { title: 'Pinsel - Gallery', activeNav: 'browse'});
});

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
};

const categorySize = 4;

function encode_image(category, index) {
    try {
        var filePath = path.join('static', category, index.toString() + '.jpg');
        var bitmap = fs.readFileSync(filePath);
        // convert binary data to base64 encoded string
        return 'data:image/jpeg;base64,' + (new Buffer.from(bitmap).toString('base64'));
    } catch (error) {
        console.log(error);
    }
};

/* Request random set of classification tasks. */
router.get('/requestImageClass', function (req, res, next) {
    set = [
        {
            "img": encode_image('cat', getRandomInt(categorySize)),
            "choices": ["Forest", "Human", "Cat", "Sky"]
        },
        {
            "img": encode_image('ship', getRandomInt(categorySize)),
            "choices": ["Food", "Ship", "Night Scene", "Car"]
        },
        {
            "img": encode_image('landscape', getRandomInt(categorySize)),
            "choices": ["Landscape", "Water", "Architecture", "Animal"]
        },
        {
            "img": encode_image('Car', getRandomInt(categorySize)),
            "choices": ["Plane", "Car", "Text", "Snow"]
        },
        {
            "img": encode_image('food', getRandomInt(categorySize)),
            "choices": ["Sky", "City", "Cloth", "Food"]
        }
    ]
    res.json(set);
});

/* Evalute classification results. */
router.post('/validateClassificationTask', function (req, res, next) {
    const classes = [req.body.q1, req.body.q2, req.body.q3, req.body.q4];
    if (classes[0] == '2' && classes[1] == '1' && classes[2] == '0' && classes[3] == '1') {
        // Accept Task
        res.status(200).send();

        console.log('Accepted test image class');
    }
    else {
        // Reject
        res.status(406).send();

        console.log('Rejected test image class');
    }
});

module.exports = router;
