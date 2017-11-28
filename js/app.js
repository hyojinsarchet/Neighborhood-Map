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
      marker.addListener('click', function() {
          populateInfoWindow(this, infowindow);
        });

      var icon1 = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      var icon2 = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

      marker.addListener('mouseover',function() {
          this.setIcon(icon2);
      });
      marker.addListener('mouseout', function() {
          this.setIcon(icon1);
      });
};


   //populate one infowindow when the marker is clicked.
   function populateInfoWindow(marker, infowindow) {
      if (infowindow.marker != marker) {
        infowindow.setContent('');
        infowindow.marker = marker;

        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        function getStreetView(data, status) {
          if (status == google.maps.StreetViewStatus.OK) {
            var nearStreetViewLocation = data.location.latLng;
            var heading = google.maps.geometry.spherical.computeHeading(
              nearStreetViewLocation, marker.position);
              infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
              var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 30
                }
              };
            var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
          } else {
            infowindow.setContent('<div>' + marker.title + '</div>' +
              '<div>No Street View Found</div>');
          }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
      }
   }
}


var Lists = function(data) {

  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.location = ko.observable(data.location);
};

var viewModel = function() {

    var self = this;

    self.nameList = ko.observableArray([]);

    model.forEach(function(names){
      self.nameList.push(new Lists(names));
    });


    self.showWindow = function(list) {

        if(list.name) {
            map.setZoom(15);
            map.panTo(list.location);
            list.marker.setAnimation(google.maps.Animation.BOUNCE)
            infoWindow.open(map, list.marker);
        }
        setTimeout(function() {
          gym.marker.setAnimation(null); // End animation on marker after 2 seconds
        }, 2000);
      };
};

              // open the infowindow
              // and set its content
              // setAnimation
              // and do the setTimeout to stop the animation
// viewModel = new ViewModel();
ko.applyBindings(viewModel());

// ko.applyBindings(new viewModel());
