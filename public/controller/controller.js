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
    console.log(monster.locations);

    var theLocation = {location: monster.locations};
    var location = $http.post('http://localhost:1337/location/',theLocation);
    location.then(function(mapDetails) {
      vm.map = mapDetails.data;
      console.log(mapDetails.data);
    })
  }

}
