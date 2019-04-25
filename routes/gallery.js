var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('gallery', { title: 'Pinsel - Gallery', activeNav: 'browse'});
});

router.post('/donate', function (req, res, next) {

});

module.exports = router;
