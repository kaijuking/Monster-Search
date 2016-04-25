document.addEventListener('DOMContentLoaded', function(event) {
  console.log('document has loaded');
});

function initMap() {
  console.log('inside the initMap function');

  var map;
  var tokyo = {lat: 35.6895, lng: 139.6917};
  var sapporo = {lat: 43.0621, lng: 141.3544};

  map = new google.maps.Map(document.getElementById('map'), {
    center: tokyo,
    zoom: 8
  });

  var tokyo = new google.maps.Marker({
    position: tokyo,
    map: map,
    title: 'Tokyo'
  });

  var sapporo = new google.maps.Marker({
    position: sapporo,
    map: map,
    title: 'Sapparo'
  });

  tokyo.setMap(map);
  sapporo.setMap(map);
}
