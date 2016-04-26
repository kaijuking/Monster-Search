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
    console.log('inside the getMonsters function');
    
    var theMonster = (monster != undefined) ? monster : undefined;

    var allMonters = $http.get('http://localhost:1337/monsters/' + theMonster);
    allMonsters.then(function(list) {
      vm.list = list.data;
      console.log(list.data);
    })
  }

}
