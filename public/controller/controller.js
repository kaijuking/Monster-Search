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
    //var allMonsters = $http.get('http://localhost:1337/monsters/' + theMonster);
    var allMonsters = $http.get('/monsters/' + theMonster);
    allMonsters.then(function(list) {
      vm.list = list.data;
    })
  }

  vm.location = function(monster) {
    if(monster === undefined) {
      var theLocation = {location: document.getElementById('searchMonsterName').value};
      //var location = $http.post('http://localhost:1337/locationBySearchValue/', theLocation);
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
        content: contentString
      });

      infowindow.open(map, theLocation);

      console.log(theLocation);
      console.log(theLocation.MarkerPlace);
    })
  }
}

function updateMultiMap(monsters, locations) {
  var count = monsters.length;

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

  console.log(temp);

  for(var i = 0; i < temp.length; i++) {
    var monsterLocation = temp[i].location;
    var coordinates = {lat: temp[i].coordinates.lat, lng: temp[i].coordinates.lng};

    var theLocation = new google.maps.Marker({
      position: coordinates,
      map: map,
      title: temp[i].name,
      icon: 'images/icon/' + temp[i].picture
    });

    theLocation.setMap(map);
    theLocation.addListener('click', function() {
      // window.alert(theLocation.title);
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
    })
  }

}

var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
      '<div id="bodyContent">'+
      '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
      'sandstone rock formation in the southern part of the '+
      'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
      'south west of the nearest large town, Alice Springs; 450&#160;km '+
      '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
      'features of the Uluru - Kata Tjuta National Park. Uluru is '+
      'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
      'Aboriginal people of the area. It has many springs, waterholes, '+
      'rock caves and ancient paintings. Uluru is listed as a World '+
      'Heritage Site.</p>'+
      '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
      'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
      '(last visited June 22, 2009).</p>'+
      '</div>'+
      '</div>';

function success(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var theCoors = {lat: lat, lng: lng};
  return theCoors;
}

function error() {
  console.log('error getting geolocation');
}
