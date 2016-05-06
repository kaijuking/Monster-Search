var thePlaceDetails;

var app = angular.module('monsterSearch', []);

//This variable is used when displaying place details on the modal.

var theTest = [{name: 'mike', age: 32, location: "Irvine"}];

app.controller('monstersController', monsters);
app.$inject = ['$http'];

function monsters($http) {
  var vm = this;
  activate();

  function activate() {
    vm.test = 'test test test';
    getMonsters();
  }

  function getPlaceDetails() {
    return thePlaceDetails;
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
        var theMonsters = theResults.data[0];
        var theLocations = theResults.data[1];
        updateMultiMap(theMonsters, theLocations);
      })
    } else {
      var theLocation = {location: monster.locationsEng};
      var location = $http.post('/location/',theLocation);
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
      theMap.panTo(theMarker.position);
      theMap.setZoom(15);
      places(theMap, theMarker.position);
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
      places(theMap, theMarker.position);
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


function places(theMap, coordinates) {
  map.panTo(coordinates);
  map.setZoom(18);
  var infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(theMap);
  service.nearbySearch({
    location: coordinates,
    radius: 500,
    type: ['store', 'restaurant', 'lodging', 'church', 'bank', 'train_station', 'subway_station', 'food']
  }, callback);

  function callback(results, status) {
    if(status === google.maps.places.PlacesServiceStatus.OK) {
      for(var i = 0; i < results.length; i++) {
        createMarker(results[i], results[i].place_id);
        console.log(results[i].place_id);
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
    console.log('hello world');
    $('#myModal').modal('show');
  }
})
