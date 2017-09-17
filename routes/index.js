var express = require('express');
var router = express.Router();
var gplay = require('google-play-scraper');


/* GET home page. */
router.get('/', function(req, res, next) {
  var gplay = require('google-play-scraper');
  gplay.app({appId: 'com.dxco.pandavszombies'})
  .then(function(err){res.json({error:err});}, function(data){res.json(data);});
  
  //res.render('index', { title: 'Express' });
});

module.exports = router;

