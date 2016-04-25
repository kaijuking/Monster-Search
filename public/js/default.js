document.addEventListener('DOMContentLoaded', function(event) {
  console.log('document has loaded');
});

function initMap() {
  console.log('inside the initMap function');

  var map;

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}
