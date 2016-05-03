var app = angular.module('monsterSearch', []);

app.controller('monstersController', monsters);
app.$inject = ['$http'];

function monsters($http) {
  var vm = this;
  activate();

  function activate() {
    vm.test = 'test test test';
    getMonsters();
  }

  function getMonsters(monster) {
    var theMonster = monster;
    var allMonsters = $http.get('/monsters/' + theMonster);
    allMonsters.then(function(list) {
      vm.list = list.data;
    })
  }

  vm.location = function(monster) {
    if(monster === undefined) {
      var theLocation = {location: document.getElementById('searchMonsterName').value};
      var location = $http.post('/locationBySearchValue/', theLocation);
      location.then(function(theResults) {
        console.log(theResults);
        var theMonsters = theResults.data[0];
        var theLocations = theResults.data[1];
        updateMultiMap(theMonsters, theLocations);
      })
    } else {
      var theLocation = {location: monster.locationsEng};
      var location = $http.post('/location/',theLocation);
      location.then(function(mapDetails) {
        updateMap(mapDetails, monster.nameEng, monster.iconPicture);
      })
    }

  }

  vm.search = function(monster) {
    if(monster === undefined) {
      theMonster = document.getElementById('searchMonsterName').value;
    } else {
      theMonster = monster.nameEng;
    }

    var monster = $http.get('/monsters/' + theMonster);
    monster.then(function(searchResult) {
      vm.searchResult = searchResult.data;
    })
  }

}

function updateMap(mapDetails, name, iconPicture) {
  var startCoordinates = {lat: 35.000, lng: 130.000};
  var map = new google.maps.Map(document.getElementById('map'), {
    center: startCoordinates,
    zoom: 2
  });

  var coordinates = [];
  for(var i = 0; i < mapDetails.data.length; i++) {
    var info = JSON.parse(mapDetails.data[i]);
    coordinates.push({lat: info.results[0].geometry.location.lat, lng: info.results[0].geometry.location.lng});
  }

  for(var i = 0; i < coordinates.length; i++) {
    var theLocation = new google.maps.Marker({
      position: {lat: coordinates[i].lat, lng: coordinates[i].lng},
      map: map,
      title: name,
      icon: 'images/icon/' + iconPicture
    });

    theLocation.setMap(map);
    theLocation.addListener('click', function() {
      //window.alert(theLocation.title);
      var infowindow = new google.maps.InfoWindow({
        content: "test"
      });

      infowindow.open(map, theLocation);
      getWiki('Tokyo');

    })
  }
}

function updateMultiMap(monsters, locations) {
  var count = monsters.length;
  var theMarkers = [];
  var locationsArray = [];

  var startCoordinates = {lat: 35.000, lng: 130.000};
  var map = new google.maps.Map(document.getElementById('map'), {
    center: startCoordinates,
    zoom: 2
  });

  var locationDetails = [];
  for(var i = 0; i < count; i++) {
    var tmp = JSON.parse(locations[i].mapdetails.body);
    var longName = tmp.results[0].address_components[0].long_name;
    var coordinates = {lat: tmp.results[0].geometry.location.lat, lng: tmp.results[0].geometry.location.lng};
    locationDetails.push({longName: longName, coordinates: coordinates})
  }

  var temp = [];
  for(var x = 0; x < monsters.length; x++) {
    var compare = monsters[x].location;
    var name = monsters[x].name;
    for(var y = 0; y < locationDetails.length; y++) {
      var location = locationDetails[y].longName;
      if(location.includes(compare)) {
        temp.push({name: name, coordinates: locationDetails[y].coordinates, location: location, picture: monsters[x].picture});
        break;
      }
    }
  }

  for(var i = 0; i < temp.length; i++) {
    console.log(temp[i].location + "-" + temp[i].name);
  }

  for(var i = 0; i < temp.length; i++) {
    var theName = temp[i].name;
    var thePicture = temp[i].picture;
    var theLocation = temp[i].location;
    var theCoordinates = {lat: temp[i].coordinates.lat, lng: temp[i].coordinates.lng};
    var theMap = map;

    placeMarker(locationsArray, theName, thePicture, theLocation, theCoordinates, theMap);
  };

}

function placeMarker(locationsArray, theName, thePicture, theLocation, theCoordinates, theMap) {

  if(locationsArray.includes(theLocation) === false) {
    locationsArray.push(theLocation);

    var theMarker = new google.maps.Marker({
      position: theCoordinates,
      map: theMap,
      title: theName,
      location: theLocation,
      icon: 'images/icon/' + thePicture
    });

    theMarker.setMap(theMap);

    var monsterInfo = theMarker.title + '--' + theMarker.position;
    var infowindow = new google.maps.InfoWindow({
      content: monsterInfo
    })

    theMarker.addListener('click', function() {
      infowindow.open(theMap, theMarker);
      getWiki(theLocation);
    })

  } else {
    var random = Math.floor((Math.random() * (1)) + 5);
    var newCoordinates = {lat: theCoordinates.lat - (random * 0.05), lng: theCoordinates.lng - (random * 0.05)};
    var theMarker = new google.maps.Marker({
      position: newCoordinates,
      map: theMap,
      title: theName,
      location: theLocation,
      icon: 'images/icon/' + thePicture
    });

    theMarker.setMap(theMap);

    var monsterInfo = theMarker.title + '--' + theMarker.position;
    var infowindow = new google.maps.InfoWindow({
      content: monsterInfo
    })

    theMarker.addListener('click', function() {
      infowindow.open(theMap, theMarker);
      getWiki(theLocation);
    })
  }

}

function getWiki(location) {
  console.log(location);
  // var allMonsters = $http.post('/wiki/', location);
  // allMonsters.then(function(data) {
  //   var results = JSON.parse(data);
  //   console.log(results);
  // })

  var theData = {location: location};
  var data = JSON.stringify(theData);

  var wiki = new XMLHttpRequest();
  wiki.open('POST', '/wiki', true);
  wiki.setRequestHeader('Content-Type', 'application/json');
  wiki.send(data);

  wiki.addEventListener('load', function() {
    var response = JSON.parse(wiki.responseText);
    console.log(response.body);
    var test = JSON.parse(response.body);
    console.log(test);
  })
}
