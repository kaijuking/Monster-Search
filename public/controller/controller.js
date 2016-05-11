var app = angular.module('monsterSearch', []);
app.controller('monstersController', monsters);
app.$inject = ['$http'];

function monsters($http) {
  var vm = this;
  activate();

  function activate() {
    getMonsters();
  }

  function getMonsters(monster) {
    var theMonster = monster;
    var allMonsters = $http.get('/monsters/' + theMonster);
    allMonsters.then(function(list) {
      vm.list = list.data;
    })
  }

  function testPrint() {
    console.log('test print');
  }

  vm.location = function(monster) {
    if(monster === undefined) {
      var theLocation = {location: document.getElementById('searchMonsterName').value};
      var location = $http.post('/locationBySearchValue/', theLocation);
      location.then(function(theResults) {
        var theMonsters = theResults.data[0];
        var theLocations = theResults.data[1];
        updateMultiMap(theMonsters, theLocations);
      })
    } else {
      var theLocation = {location: monster.locationsEng};
      var location = $http.post('/location/', theLocation);
      location.then(function(mapDetails) {
        console.log(mapDetails);
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

  vm.profile = function(theMonster) {
    var monster = $http.get('/profile/' + theMonster);
    monster.then(function(profile) {
      console.log(profile.data);
      vm.profileResult = profile.data;
    })
  }

  vm.sighting = function() {
    var monsterName = document.getElementById('addMonsterName').value;
    var city = document.getElementById('addCity').value;
    var state = document.getElementById('addState').value;
    var country = document.getElementById('addCountry').value;
    var weight = document.getElementById('monsterWeight').value;
    var height = document.getElementById('monsterHeight').value;
    var date = document.getElementById('sightedDate').value;
    var origin = document.getElementById('monsterOrigin').value;

    if(monsterName != '' && city != '' && state != '' && country != '') {
      var theSighting = {name: monsterName, city: city, state: state, country: country, profilePicture: "gforce.jpg", iconPicture: "gforce.jpg",
                         origin: origin, weight: weight, height: height, date: date};

      var sighting = $http.post('/sighting/', theSighting);
      sighting.then(function(details) {
        vm.sightingDetails = data.details;
      })
    } else {
      var warning = document.getElementById('add-warning-alert');
      warning.setAttribute('class', 'alert alert-warning alert-dismissible show');
    }

  }

  vm.refresh = function() {
    getMonsters();
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
      map.panTo(theLocation.position);
      map.setZoom(15);
      var infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: theLocation.position,
        radius: 1000,
        type: ['store', 'restaurant', 'lodging', 'church', 'bank', 'train_station', 'subway_station', 'food']
      }, callback);

      function callback(results, status) {
        if(status === google.maps.places.PlacesServiceStatus.OK) {
          for(var i = 0; i < results.length; i++) {
            createMarker(results[i], results[i].place_id);
          }
        }
      }

      function createMarker(place, placeId) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          placeId: placeId
        });

        google.maps.event.addListener(marker, 'click', function() {
          placeDetails(service, marker, marker.placeId, map);
        });
      }

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
    var theName = temp[i].name;
    var thePicture = temp[i].picture;
    var theLocation = temp[i].location;
    var theCoordinates = {lat: temp[i].coordinates.lat, lng: temp[i].coordinates.lng};
    var theMap = map;

    placeMarker(locationsArray, theName, thePicture, theLocation, theCoordinates, theMap);
  };

}

//This function is used to place a monster icon on the map at locations where the monster has appeared.
function placeMarker(locationsArray, theName, thePicture, theLocation, theCoordinates, theMap) {
  //Since a single monster can have multiple locations this if/else is used to determine if a location has already appeared.
  //If the location hasn't already appeared go through the if statement.
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
      theMap.panTo(theMarker.position);
      theMap.setZoom(15);
      places(theMap, theMarker.position);
    })

  } else {
    //If the location has already appeared than take the coordinates of that location and subtract a random number.
    //This is necessary because you can't have multiple markers on the same location (i.e. with the same set of coordinates).
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
      places(theMap, theMarker.position);
    })
  }

}

//This function is used to get the type of places based upon a given set of coordinates and where to the place (i.e. the map).
function places(theMap, coordinates) {
  map.panTo(coordinates);
  map.setZoom(18);
  var infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(theMap);
  service.nearbySearch({
    location: coordinates,
    radius: 1000,
    type: ['store', 'restaurant', 'lodging', 'church', 'bank', 'train_station', 'subway_station', 'food']
  }, callback);

  function callback(results, status) {
    if(status === google.maps.places.PlacesServiceStatus.OK) {
      for(var i = 0; i < results.length; i++) {
        createMarker(results[i], results[i].place_id);
      }
    }
  }

  function createMarker(place, placeId) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: theMap,
      position: place.geometry.location,
      placeId: placeId,
      name: place.name
    });

    google.maps.event.addListener(marker, 'click', function() {
      placeDetails(service, marker, marker.placeId, theMap);
    });
  }
}

//This function is used to populate the Google Maps Infowindow when the user clicks on the red marker icons.
function placeDetails(theService, theMarker, placeID, theMap) {
  var thePlaceId = placeID.toString();
  var request = {placeId: thePlaceId};
  var name = "N/A";
  var phoneNumber = "N/A";
  var rating = "N/A";
  var address = "N/A";
  var website = "N/A";
  var id = "N/A";

  theService.getDetails(request, callback);
  function callback(place, status) {
    if(status == google.maps.places.PlacesServiceStatus.OK) {
      console.log(place);
      placeArray = {name: place.name, phone: place.international_phone_number,
        rating: place.rating, address: place.formatted_address, website: place.website,
        photos: place.photos};

      if(place.name != undefined) {
        name = place.name;
      }
      if(place.id != undefined) {
        id = place.id;
      }
      if(place.international_phone_number != undefined) {
        phoneNumber = place.international_phone_number;
      }
      if(place.rating != undefined) {
        rating = place.rating + " (out of 5)";
      }
      if(place.formatted_address != undefined) {
        address = place.formatted_address;
      }
      if(place.website != undefined) {
        website = place.website;
      }
      var contentString = '<div class="media-object">' +
            '<div class="media-body">' +
              '<b>Name: </b>' + name + '<br>' +
              '<span id="placeID"><b>ID: ' + id + '</b></span><br>' +
              '<b>International Phone: </b>' + phoneNumber + '<br>' +
              '<b>Rating: </b>' + rating + '<br>' +
              '<b>Address: </b>' + address + '<br>' +
              '<b>Website: </b>' + website + '<br>' +
            '</div>' +
          '</div>'

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      infowindow.open(theMap, theMarker);
      var theID = document.getElementById('placeID');
      theID.setAttribute('data-value', id);
    }
  }
}

document.addEventListener('click', function(e) {
  e.preventDefault();
  var theTarget = e.target;
  if(theTarget.getAttribute('data-value') === "monster-profile") {
    $('#myModal').modal('show');
  }
})

// var monster-search = document.getElementById('btnAddMonsters');
// addBtn.addEventListener('click', function(e) {
//   var monsterName = document.getElementById('addMonsterName');
//   var city = document.getElementById('addCity');
//   var state = document.getElementById('addState');
//   var country = document.getElementById('addCountry');
//   var weight = document.getElementById('monsterWeight');
//   var height = document.getElementById('monsterHeight');
//   var date = document.getElementById('sightedDate');
//   var origin = document.getElementById('monsterOrigin');
//
//   if(monsterName != null && city != null && state != null && country != null) {
//     addBtn.removeAttribute('disabled');
//   }
//
// })
