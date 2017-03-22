'use strict';

module.exports = function(app, googleSearch, db) {
    // Check the /newurl/:url combination
    var collection = db.collection('image_search');
    
    app.get('/search/:query', function (req, res) {
        
        var item_count = 10;
        var specific_page = -1;
        console.log("Query is:", req.params.query)
        // Record the search
        var record = {'search_term':req.params.query, 'timestamp': new Date().toISOString()};
        collection.insertOne(record);
        
        
        //Check if url is valid via using valid url package using url-valid package
        if(typeof req.query.offset !== "undefined"){ //Check if there is a specific page inquiry or a total serach
            if(isFinite(parseInt(req.query.offset)) && parseInt(req.query.offset) !== -1){ //Check if the entered value is valid
                specific_page = parseInt(req.query.offset);
            }
            else{
               return res.send({"Error:": 'Please enter an integer value (starting from 1) for the specific search page - e.g. "url/search/query?offset=Integer"!- '}); 
            }
            
        }
        else{//Set search type to overall search
            specific_page = -1;
        }

        googleSearch.build({
                  q: req.params.query,
                  start: 1,
                  num: item_count, // 10 items by default(inclusive)
                  imgColorType: "color"
                }, function(error, response) {
                    
                  if(error){
                    throw error;
                  }
                  //console.log("Item length: ", response);
                  var result = [];
                  if (response.items.length > 0 && specific_page == -1){//Overall search ?Condition of only response.LENGTH !!!!
                     for (var i = 0; i < response.items.length; i++) {
                        //console.log("Iteration count:", i,response.items[i].pagemap.cse_image, response.items[i].pagemap.cse_thumbnail );
                        if(typeof response.items[i].pagemap.cse_image !== "undefined" && typeof response.items[i].pagemap.cse_thumbnail !== "undefined" ){     
                             if(response.items[i].pagemap.cse_image.constructor === Array && response.items[i].pagemap.cse_thumbnail.constructor === Array ){// If the relevant image is properly documented, report it
                                result.push({"img-url":response.items[i].pagemap.cse_image[0].src, "snippet":response.items[i].snippet,
                                          "title":response.items[i].title,'thumbnail': response.items[i].pagemap.cse_thumbnail[0].src});
                             }
                        }
                    }
                     return res.send(result);
                  }
                  else if(specific_page>0){//Specific page view
                      if(response.items.length===0){//If no item found
                         return res.send({"Error:": 'No relevant image Found. Please retry your query!'});
                      }
                      else if(result.length >= specific_page ){//Specific Page number cannot be more than the returned search item count 
                        result.push({"img-url":response.items[specific_page-1].pagemap.cse_image[0].src, "snippet":response.items[specific_page-1].snippet,
                                     "title":response.items[specific_page-1].title,'thumbnail': response.items[specific_page-1].pagemap.cse_thumbnail[0].src });
                        return res.send(result);
                      }
                      else{//Searching a non-existent page. Send error!
                        return res.send({"Error:": 'There are max 10 records. Please enter your query accodingly!'}); 
                      }
                  }
                  else if(specific_page<-1 || specific_page === 0 ){//Check if the searched specific page has valid arguments
                      return res.send({"Error:": 'Page counts starts from 1. Please reenter your query accordingly!'}); 
                  }
                  else{
                     return res.send({"Error:": 'No relevant image Found. Please retry your query!'});
                  }
        });
    });
    
    // This part reports the last 10 or if there is less, less number of searches done
    app.get('/list/latestsearches', function (req, res) {
        // Apply descending search
        var latest_records = collection.find().sort({_id:-1}).limit(10).toArray(function(err,doc){
            console.log("Inside the search.");
            if (err) throw res.send({'Error':'Error in connecting database.'});
            
            if (doc){
                return res.send(doc)
            }
            else{
                return res.send({"Error": "No records could be found."})
            }
        });
            
    });
    
    // Check home page on open
    app.get('/', function (req, res) {
        res.sendFile(process.cwd() + '/Public/index.html');
    })
    
};