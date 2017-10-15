http = require ("http");
var fs = require('fs');  // file system
var urlM = require('url');
var gplay = require('google-play-scraper');
var writable = require('constant-db').writable;


var url = 'http://export.apprevolve.com/v2/getAds?accessKey=314fb885c767&secretKey=14b1e26c569c160d29899a8293154580&applicationKey=5a46b52d';


function reloadJson(req,res)
{
    http.get(url, function(resj){
    var body = '';

    resj.on('data', function(chunk){
        body += chunk;
    });

    resj.on('end', function(){
        var isResponse = JSON.parse(body);
        cacheFeed(req,res,isResponse,body);
    });
    }).on('error', function(e){
        console.log("Got an error: ", e);
    });
}
//new
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
      //console.log(res); 
      res.write("saved in FS");
      res.end();
       
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
      cb(filedata,key,1);
      return;
  }
  console.log("Fetching->",key); 
  gplay.app({appId: key})
  .then(
    function(data){
      var dataTxt = JSON.stringify(data);
      fs.writeFileSync("./data/"+key,dataTxt);
      cb(dataTxt,key,0);
    }
    ,
    function(err){
      console.log(key,err);
       fs.writeFileSync("./data/"+key,"na");
      cb("na",key,0);
    });
}





function wrapit(res,pairs,mapOfAll)
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


function rebuild(req,res)
{
    var dirty=0;
    if( res.setHeader)
          res.setHeader('content-type', 'text/html');
    res.write("<html><body>Starting....");
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
//Add id from directory 
         var files = fs.readdirSync("./data");
         files.forEach(function(o){
           if( !mapOfAll[o] )
           {
              mapOfAll[o]=1
              //res.write("<BR>adding from history  > "+o);
           }
              
         });  


          var allPair = [];
          var keys = Object.keys(mapOfAll);
          //keys = keys.slice(0,50);
          var recursive = function(data,key,fromCache)
          {
            //console.log("-----------> ",key,fromCache,dirty);
            if(!fromCache)
            {
              res.write("<DIV>Fetched -"+key+"</DIV>");
              dirty++;
             }
             allPair.push([key,data]);
             if( keys.length)
               GetStoreData(keys.pop(),recursive);
            else
            {
              console.log(dirty);
              if(dirty)
                wrapit(res,allPair,mapOfAll);
              else 
              { 
                res.write("nothing changed");
                res.end(); 

              }
            }
          }

          GetStoreData(keys.pop(),recursive);
    
}

module.exports.reload = reloadJson;

module.exports.rebuild = rebuild;


function main()
{
  var consoleRes = {
     write: console.log,
     end:function(){ if( this.onEnd) this.onEnd(); },
     onEnd : null
  }
  consoleRes.onEnd = function (){
      consoleRes.onEnd = process.exit;
     rebuild(null,consoleRes)
  };
    
  
  console.log("Starting CLI",new Date(Date.now()));
  reloadJson(null,consoleRes);
//  consoleRes.onEnd = function (){console.log("Ended");};

}

if (require.main === module) main();






