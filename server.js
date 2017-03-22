'use strict';
//CSEId: 005229907790370133154:o3q1t7yjhee
var express = require('express');
var app = express();
var mongo = require('mongodb');
var api = require('./App/app.js');
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyAaJComghzG4VESGerb-1MtivKSEz701sg',
  cx: '005229907790370133154:o3q1t7yjhee'
});

 
/*googleSearch.build({
  q: "galatasaray",
  start: 1,
  num: 10, // Number of search results to return between 1 and 10, inclusive 
}, function(error, response) {
  if(error){
    throw error;
  }
  console.log(response);
});*/

// mlab connection link: mongodb://<dbuser>:<dbpassword>@ds137340.mlab.com:37340/image_search

// Connection URL
var url = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/image_search';

mongo.MongoClient.connect(url, function(err,db){
    if (err) {
        throw err;
    }
    

    // Create collection
    var options = {
        server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
    };
    
    db.createCollection("image_search");
    
    //Set the html 
    app.use(express.static(__dirname + "/../Public"));
    
    //call the app
    api(app, googleSearch, db);
    
    var port = process.env.PORT || 8000;
    
    app.listen(port, function() {
        console.log('Node.js listening on port ' + port);
    });
    
});

