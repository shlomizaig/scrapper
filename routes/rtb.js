var request = require('request');



function getRTBJson(res,req)
{
   console.log("request",req.body);
   dortb(res,req,function(data){
       res.json(data);
       console.log("reply",data);
   })
  
};




 
var headers = {
    "Host": "taboola",
    "X-Openrtb-Version": "2.3",
    "Content-Type": "application/json",
    "Transfer-Encoding": "chunked",
    "Expect":""
}




var options = {
    url: "http://dev-feed.taboola-cpa.com/rtb/f4241",
    method: 'POST',
    headers: headers,
   
}

function dortb(res,req,cb)
{
   
   options.json  = JSON.parse(Object.keys(req.body)[0]);
   //options.json  = req_rtb;
   request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        cb(body);
        console.log(body)
    }else 
       cb ({error:response.statusCode});
  
  });
}



module.exports.getRTBJson = getRTBJson;
