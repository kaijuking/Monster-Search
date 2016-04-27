var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var request = require('request');
var app = express();

/*Required For Mongodb create(POST), read(GET), update(PUT) and delete(DELETE)*/
var mongo = require('mongodb');
var myClient = mongo.MongoClient;
var url = 'mongodb://localhost/monsterSearch';

/*Middleware To Use*/
var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);

/*Required Data Objects*/
var allLocations = require('./locations.js');
var allMonsters = require('./monsters.js');

app.get('/monsters/:monster', function(req, res) {
  var theMonster = (req.params.monster === 'undefined') ? {} : req.params.monster;

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

app.post('/location/', jsonParser, function(req, res) {
  console.log(req.body.location);

  var theLocation = req.body.location;

  var key = 'AIzaSyDgL9xZqzlR727rK2eXAWS-tcqUiRVovW8';

  var theURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + theLocation[0] + '&key=' + key

  var p1 = new Promise(function(resolve, reject) {
    request(theURL, function(error, response, body) {
      if(!error && response.statusCode == 200) {
       resolve(response);
     }
    })
  })

  Promise.all([p1]).then(function(value) {
    res.json(value);
  }, function(reason) {
    console.log(reason)
  });

})

/*Configure Which Port To Listen For LocalHost*/
var port = process.env.PORT || 1337;
app.listen(port, function() {
 console.log("Project #3 (Monster Search) is listening on port " + port);
});
