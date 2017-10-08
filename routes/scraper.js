http = require ("http");
var fs = require('fs');  // file system
var urlM = require('url');
var gplay = require('google-play-scraper');
var writable = require('constant-db').writable;


var url = 'http://export.apprevolve.com/v2/getAds?accessKey=314fb885c767&secretKey=14b1e26c569c160d29899a8293154580&applicationKey=5a46b52d';


function online(req,res)
{
    http.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var isResponse = JSON.parse(body);
        cacheFeed(req,res,isResponse,body);
    });
    }).on('error', function(e){
        console.log("Got an error: ", e);
    });
}

var stt={};
function stats(obj)
{
    if( ! Array.isArray(obj) )
      obj = [obj];
    obj.forEach(function(o){
        stt[o] = stt[o]?stt[o]+1:1;
    });
}

function cacheFeed(req,res,obj,body)
{
   
   var jsonstream = fs.createWriteStream('./all.json');
   jsonstream.write(body);
   jsonstream.end();
   
   jsonstream.on('finish', function () {
       res.send("saved in FS");
       
})

/*
   var wstream = fs.createWriteStream('./all.html');
   wstream.write("<html>");
   obj.ads.forEach(function(el) {
       var str = "<div> <h3>"+ el.title+ "</h3><br><b>"+el.geoTargeting+"</b> <img src =\"" + el.creatives[0].url + "\"<img></div>";
      // stats(el.geoTargeting);
       stats(el.bid);
       wstream.write(str);
   });
   wstream.write("</html>");
   
   console.log("done:",stt);*/
}




function GetStoreData(key,cb)
{
  if( fs.existsSync("./data/"+key))
  {
      var filedata = fs.readFileSync("./data/"+key,"utf8");
      cb(filedata,key);
      return;
  }
  
  gplay.app({appId: key})
  .then(
    function(data){
      var dataTxt = JSON.stringify(data);
      fs.writeFileSync("./data/"+key,dataTxt);
      cb(dataTxt,key);
    }
    ,
    function(err){
      console.log(key,err);
       fs.writeFileSync("./data/"+key,"na");
      cb("na",key);
    });
}
function wrapit(res,pairs)
{
  var writer = new writable('./cdbfile');
  writer.open(function cdbOpened(err) {
    pairs.forEach(function(o){
      writer.put(o[0],o[1]);
    })
    
    writer.close(function cdbClosed(err) {
        res.write("cdb done");
        res.end();
    });
});


}


function offline(req,res)
{
    res.write("Starting..");
    res.flush();
    var mapOfAll={};
    var obj = JSON.parse(fs.readFileSync('./all.json', 'utf8'));
    obj.ads.forEach(function(o){
        if( o.platform == "Android")
          {
              var clickurl = o.clickURL;
            
             var url_parts = urlM.parse(clickurl, true);
             var id = url_parts.query.fallbackId;
            mapOfAll[id] = 1;
             // console.log(id);
          }
    });
try{    fs.mkdirSync("./data"); }catch(o){}

          var allPair = [];
          var keys = Object.keys(mapOfAll);
          //keys = keys.slice(0,50);
          var recursive = function(data,key)
          {
            console.log("-----------> ",key);
            res.write("Fetched - >"+key);
            res.flush();
             allPair.push([key,data]);
             if( keys.length)
               GetStoreData(keys.pop(),recursive);
            else
              wrapit(res,allPair);
          }

          GetStoreData(keys.pop(),recursive);
    
}

module.exports.reload = online;

module.exports.rebuild = offline;
//online();
//offline();


