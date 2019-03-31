var express = require('express');
var router = express.Router();

/* GET Browser page. */
router.get('/', function (req, res, next) {
    res.render('gallery', { title: 'ArtChain Gallery', activeNav: 'browse' });
});

module.exports = router;
