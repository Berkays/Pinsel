var express = require('express');
var router = express.Router();

/* GET Browser page. */
router.get('/', function (req, res, next) {
    res.render('upload', { title: 'ArtChain Upload', activeNav: 'upload' });
});

module.exports = router;
