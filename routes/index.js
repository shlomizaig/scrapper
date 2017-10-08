var express = require('express');
var router = express.Router();
//var gplay = require('google-play-scraper');
var readable = require('constant-db').readable;
var store = require('app-store-scraper');
var scraper = require ('./scraper');

/*function appStoreScrape(id,res)
{
  
 try{
store.app({id: id}).then(res.json).catch(res.json);
 }catch(o){res.json({error:o});} //res.json({"id":id});
}*/


/* GET home page. */
router.get('/app', function(req, res, next) {
  var reqParam = req.query.id || 'com.zynga.livepoker' ;
 // if( parseInt(reqParam) > 0 )
 //   return appStoreScrape(reqParam,res);

  var reader = new readable('./cdbfile');
  reader.open(function cdbOpened(err) {
    reader.get(reqParam, function gotRecord(err, data) {
        res.json(data.toString()); // results in 'hello world!' 
        reader.close();
    });
});
 
  //res.render('index', { title: 'Express' });
});

router.get('/reload',function(req, res, next){
  return scraper.reload(req,res);
});


router.get('/rebuild',function(req, res, next){
  return scraper.rebuild(req,res);
});

module.exports = router;

