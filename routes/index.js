var express = require('express');
var router = express.Router();
//var gplay = require('google-play-scraper');
var readable = require('constant-db').readable;
 


/* GET home page. */
router.get('/', function(req, res, next) {
  var reqParam = req.query.id || 'com.zynga.livepoker' ;
  
  var reader = new readable('./cdbfile');
  reader.open(function cdbOpened(err) {
    reader.get(reqParam, function gotRecord(err, data) {
        res.json(data.toString()); // results in 'hello world!' 
        reader.close();
    });
});
 
  //res.render('index', { title: 'Express' });
});

module.exports = router;

