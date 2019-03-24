var express = require('express');
var router = express.Router();

/* GET Browser page. */
router.get('/', function (req, res, next) {
    res.render('gallery', { title: 'Browse Art Gallery' });
});

module.exports = router;
