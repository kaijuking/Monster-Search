var map;
var defaultMarkers;

document.addEventListener('DOMContentLoaded', function(event) {
  console.log('document has loaded');
});

function initMap(location) {
  console.log('inside the initMap function');

  var tokyo = {lat: 35.6895, lng: 139.6917};

  map = new google.maps.Map(document.getElementById('map'), {
    center: tokyo,
    zoom: 5
  })

}

function setupDefaultMarkers() {
  var markers = new XMLHttpRequest();
  markers.open('GET', '/defaultMarkers', true);
  markers.send();

  markers.addEventListener('load', function() {
    var theResults = JSON.parse(markers.responseText);
    console.log(theResults);
    defaultMarkers = theResults;
    addDefaultMarkers(defaultMarkers);
  })
}

function addDefaultMarkers(items) {
  for(var i = 0; i < items.length; i++) {

    var latlng = {lat: Number.parseFloat(items[i].latitude), lng: Number.parseFloat(items[i].longitude)};

    var title = items[i].locationName;

    var theLocation = new google.maps.Marker({
      position: latlng,
      map: map,
      title: title
    })

    theLocation.setMap(map);

    theLocation.addListener('click', function() {
      window.alert(theLocation.title);
    })
  }
}
