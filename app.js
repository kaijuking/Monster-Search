var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var request = require('request');
var app = express();

/*Required For Mongodb create(POST), read(GET), update(PUT) and delete(DELETE)*/
var mongo = require('mongodb');
var myClient = mongo.MongoClient;
var url = process.env.MONGODB_URI || 'mongodb://localhost/monsterSearch';

/*Middleware To Use*/
var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);

/*Required Variables*/
var resultsArray;
var mapDetails;

app.get('/monsters/:monster', function(req, res) {
  var name = '"\""' + req.params.monster + '\"""'
  var theMonster = (req.params.monster === 'undefined') ? {} : {$text: {$search: name}};

  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('monsters');
      myCollection.find(theMonster).toArray(function(error, docs) {
        if(error) {
          res.send(error);
          database.close();
        } else {
          res.send(docs);
          database.close();
        };
      });
    };
  });
});

app.get('/profile/:monster', function(req, res) {
  var name = req.params.monster;
  var monster = name.toString();

  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('monsters');
      myCollection.find({nameEng: monster}).toArray(function(error, docs) {
        if(error) {
          res.send(error);
          database.close();
        } else {
          res.send(docs);
          database.close();
        };
      });
    };
  });
});

app.post('/locationBySearchValue/', jsonParser, function(req, res) {
  var key = 'AIzaSyDgL9xZqzlR727rK2eXAWS-tcqUiRVovW8';
  resultsArray = [];
  mapDetails = [];
  var tmpArray = [];
  var count = 0;

  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('monsters');
      myCollection.find({$text: {$search: req.body.location}}).toArray(function(error, docs) {
        if(error) {
          res.send(error);
          database.close();
        } else {
          for(var i = 0; i < docs.length; i++) {
            var num = docs[i].locationsEng;
            for(var y = 0; y < num.length; y++) {
              count++;
            }
          }

          for(var i = 0; i < docs.length; i++) {
            for(var y = 0; y < docs[i].locationsEng.length; y++) {
              tmpArray.push({name: docs[i].nameEng, picture: docs[i].iconPicture, location: docs[i].locationsEng[y]});
            }
          }

          for(var x = 0; x < tmpArray.length; x++) {
            var theURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + tmpArray[x].location + '&key=' + key;

            var p1 = new Promise(function(resolve, reject) {
              request(theURL, function(error, response, body) {
                if(!error && response.statusCode == 200) {
                  resolve(response);
                }
              })
            })

            p1.then(function(value) {
              mapDetails.push({mapdetails: value});
              if(mapDetails.length == count) {
                var theResults = [tmpArray, mapDetails];
                res.send(theResults);
              }
            })
          }

        };
      });
    };
  });

})

app.post('/location/', jsonParser, function(req, res) {
  resultsArray = [];
  var locationArray = req.body.location;
  var key = 'AIzaSyDgL9xZqzlR727rK2eXAWS-tcqUiRVovW8';

  for(var i = 0; i < locationArray.length; i++) {
    var theLocation = locationArray[i];
    var theURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + locationArray[i] + '&key=' + key;

    request(theURL, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        resultsArray.push(body);
        if(resultsArray.length == locationArray.length) {
          res.send(resultsArray);
        };
      };
    });
  };
})

app.post('/sighting', jsonParser, function(req, res) {
  var name = req.body.name;
  var city = req.body.city;
  var state = req.body.state;
  var country = req.body.country;
  var theLocation = city + ' ' + state + ' ' + country;
  var profilePicture = req.body.profilePicture;
  var iconPicture = req.body.iconPicture;
  var origin = req.body.origin;
  var height = req.body.height + " meters";
  var weight = req.body.weight + " metric tons";
  var date = req.body.date;
  var newSighting = {nameEng: name, locationsEng: [theLocation], profilePicture: profilePicture, iconPicture: iconPicture, originEng: origin, height: height, weight: weight, firstAppearanceDate: date};

  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('monsters');
      myCollection.insert(newSighting, function(error, result) {
        if(error) {
          console.log(error);
          database.close();
        } else {
          console.log(result);
          database.close();
        }
      })
    }
  })
})

app.get('/defaultMarkers', function(req, res) {
  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('defaultMarkers');
      myCollection.find({}).toArray(function(error, docs) {
        if(error) {
          res.send(error);
          database.close();
        } else {
          res.send(docs);
          database.close();
        }
      })
    }
  })
})

/*Configure Which Port To Listen For LocalHost*/
var port = process.env.PORT || 1337;
app.listen(port, function() {
 console.log("Project #3 (Monster Search) is listening on port " + port);
});
