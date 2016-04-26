var express = require('express');
var path = require('path');
var jsonParser = require('body-parser').json();
var app = express();

/*Required For Mongodb create(POST), read(GET), update(PUT) and delete(DELETE)*/
var mongo = require('mongodb');
var myClient = mongo.MongoClient;
var url = 'mongodb://localhost/monsterSearch';

/*Middleware To Use*/
var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);

/*Required Data Objects*/
var allUsers = require('./locations.js');
var allDecks = require('./monsters.js');

app.get('/monsters/:monster', function(req, res) {
  console.log(req.params.monster);
  var theMonster = (req.params.monster != undefined) ? req.params.monster : {};

  myClient.connect(url, function(error, database) {
    if(error) {
      console.log(error);
    } else {
      var myCollection = database.collection('monsters');
      myCollection.find({monster: theMonster}).toArray(function(error, docs) {
        if(error) {
          res.send(error);
          database.close();
        } else {
          res.send(docs);
          databse.close();
        };
      });
    };
  });
});

/*Configure Which Port To Listen For LocalHost*/
var port = process.env.PORT || 1337;
app.listen(port, function() {
 console.log("Project #3 (Monster Search) is listening on port " + port);
});
