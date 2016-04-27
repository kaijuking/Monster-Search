var app = angular.module('monsterSearch', []);

app.controller('monstersController', monsters);
app.$inject = ['$http'];

function monsters($http) {
  var vm = this;
  activate();

  function activate() {
    console.log('inside activate');
    vm.test = 'test test test';
    getMonsters();
  }

  function getMonsters(monster) {
    console.log('inside the getMonsters function');
    var theMonster = monster;

    var allMonsters = $http.get('http://localhost:1337/monsters/' + theMonster);
    allMonsters.then(function(list) {
      vm.list = list.data;
      console.log(list.data);
    })
  }

  vm.location = function(monster) {
    var theLocation = {location: monster.locations};
    console.log(theLocation);
    var location = $http.post('http://localhost:1337/location/',theLocation);
    location.then(function(mapDetails) {
      //vm.map = mapDetails.data;
      var info = JSON.parse(mapDetails.data[0].body);
      console.log(info);
      console.log(info.results[0].geometry.location);
      updateMap(info.results[0].geometry.location.lat, info.results[0].geometry.location.lng, monster.englishName)
    })
  }

}

function updateMap(lat, lng, name) {
  console.log('inside the initMap function');
  console.log('the lat: ' + lat, 'the lng: ' + lng, 'the place: ' + name);

  var map;
  var coordinates = {lat: lat, lng: lng};

  map = new google.maps.Map(document.getElementById('map'), {
    center: coordinates,
    zoom: 8
  });

  var theLocation = new google.maps.Marker({
    position: coordinates,
    map: map,
    title: name
  });

  theLocation.setMap(map);
}
