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
var marker;

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
     model[i].marker = marker;

     marker = new google.maps.Marker({
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

     google.maps.event.trigger(marker, 'click');

    //  google.maps.event.trigger(marker, 'click', function() {
    //       this.setAnimation(google.maps.Animation.BOUNCE);
    //   });

    //  google.maps.event.addListener(marker, 'click');

    //  marker.addListener('click', function() {
    //      this.showWindow(marker);
    //  });

    //  marker.addListener('click', function() {
    //      this.setAnimation(google.maps.Animation.BOUNCE);
    //  });
  }
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
// }



var Lists = function(data) {
   this.name = ko.observable(data.name);
   this.address = ko.observable(data.address);
   this.location = ko.observable(data.location);
  //  this.marker = ko.observable(data.marker);
};


var viewModel = function() {

   var self = this;

   self.nameList = ko.observableArray([]);
   // self.query = ko.observable('');
   self.search = ko.observable('');


   model.forEach(function(names){
       self.nameList.push(new Lists(names));
   });


   // Bounce marker when the list is clicked
   self.showWindow = function(list) {

     if (list.name) {
         map.panTo(list.location); // Pan to correct marker when list view item is clicked
         list.marker.setAnimation(google.maps.Animation.BOUNCE);
        //  infoWindow.open(map, list.marker); // Open info window on correct marker when list item is clicked
     }
     setTimeout(function() {
         list.marker.setAnimation(null); // End animation on marker after 2 seconds
     }, 2000);
   };

   // this.showWindow = function(location) {
   //   google.maps.event.trigger(location.marker,'click');
   // }


// http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
//identify the first matching item by name
   // self.search = ko.computed(function() {
   //     var search = this.search().toLowerCase();
   //     if (!search) {
   //         return null;
   //     } else {
   //         return ko.utils.arrayFirst(this.filteredItems(), function(item) {
   //             return ko.utils.stringStartsWith(item.name().toLowerCase(), search);
   //         });
   //     }
   // });


   // Function to call the FourSquares API.
   // var foursquareRequest = function(marker) {
   //     var apiURL = 'https://api.foursquare.com/v2/venues/';
   //     var foursquareClientID = 'AGUWVQNXJEU211JMQVKINHZOHLFB5B3OVL05ESNW0I1BPAGJ'
   //     var foursquareSecret ='YG3GS11IP2TL2SBJFDUUKMXQ1ZSMK2RUTSXFVAM5OEQYNB4Z';
   //     var foursquareVersion = '20170112';
   //     var venueFoursquareID = marker.id;
   //     var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;
   //
   //     $.ajax({
   //         url: foursquareURL,
   //         success: function(data) {
   //             console.log(data);
   //             var rating = data.response.venue.rating;
   //             var name =  data.response.venue.name;
   //             var location = data.response.venue.location.address;
   //
   //             infowindow.setContent(name + "; FourSquare Rating: " + rating.toString() + "; " + location);
   //             infowindow.open(map, marker);
   //             }
   //       }).fail(function(error) {console.log(error)});
   // };
};

// Activates knockout.js
// viewModel = new ViewModel();
ko.applyBindings(viewModel());

// ko.applyBindings(new viewModel());
