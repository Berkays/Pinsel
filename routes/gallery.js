var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function (req, res, next) {
    var db = JSON.parse(fs.readFileSync('./uploads.json', 'utf8'));
    res.render('gallery', { title: 'ArtChain Gallery', activeNav: 'browse',imagedb:db.artworks});
});

router.post('/donate', function (req, res, next) {
    var db = JSON.parse(fs.readFileSync('./uploads.json', 'utf8'));
    
    var index = 0;
    for (index = 0; index < db['artworks'].length; index++) {
        const element = db['artworks'][index].name;
        
        if(element == req.body.name)
            break;
    }
    
    db['artworks'][index].donation_count++;
    db['artworks'][index].total_donation += parseFloat(req.body.donation);

    fs.writeFile('./uploads.json', JSON.stringify(db), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.send('ok');
    //res.render('gallery', { title: 'ArtChain Gallery', activeNav: 'browse',imagedb:db.artworks});
});

module.exports = router;
