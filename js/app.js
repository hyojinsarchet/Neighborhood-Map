var model = [
  {
    name: "Florida Avenue Grill",
    address: "1100 Florida Ave NW, Washington, DC 20009",
    location: {
        lat: 38.920613,
        lng: -77.027349
      }
  },
  {
    name: "Market Lunch",
    address: "225 7th St SE, Washington, DC 20003",
    location: {
        lat: 38.886652,
        lng: -76.996438
      }
  },
  {
    name: "Shaw's Tavern",
    address: "520 Florida Ave NW, Washington, DC 20001",
    location: {
        lat: 38.915118,
        lng: -77.019651
      }
  },
  {
    name: "Tonic",
    address: "2036 G St NW, Washington, DC 20036",
    location: {
        lat: 38.89808,
        lng: -77.046469
      }
  },
  {
    name: "Daikaya",
    address: "705 6th St NW, Washington, DC 20001",
    location: {
        lat: 38.898574,
        lng: -77.019638
      }
  }];

var map;
var markers = [];

function initMap() {
  var self = this;
  var infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 38.889939, lng: -77.00905},
          zoom: 13
  });

  //Iterate every location using markers
  for (var i = 0; i < model.length; i++) {
      var location = model[i].location;
      var title = model[i].name;
      var address = model[i].address;

      var marker = new google.maps.Marker({
          map: map,
          position: location,
          title: title,
          address: address,
          animation: google.maps.Animation.DROP,
          id: i,
          icon: icon1
      });
      markers.push(marker);
      // marker.setMap(map);
      var icon1 = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      var icon2 = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

      marker.addListener('mouseover',function() {
          // marker.setIcon(icon2);
          this.setIcon(icon2);
      });
      marker.addListener('mouseout', function() {
          // marker.setIcon(icon1);
          this.setIcon(icon1);
      });
   };
}


var viewModel = function() {

};
