var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('account', { title: 'Pinsel - My Items', activeNav: 'account' });
});

module.exports = router;
