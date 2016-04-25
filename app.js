var express = require('express');
var app = express();

/*Middleware To Use*/
var defaultMiddleware = express.static('./public');
app.use(defaultMiddleware);

/*Configure Which Port To Listen For LocalHost*/
var port = process.env.PORT || 1337;
app.listen(port, function() {
 console.log("Project #3 (Monster Search) is listening on port " + port);
});
