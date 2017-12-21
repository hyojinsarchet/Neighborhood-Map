// Loaction information of my favorite restaurants of Washington DC.
var Model = {
  defaultData: [
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
    }
    ],
  apiData: []
};


// Add google clendar first.
addMapScript();

// Add model array information to the list.
function Lists(data) {
   var self = this;
   self.name = ko.observable(data.name);
   self.address = ko.observable(data.address);
   self.location = ko.observable(data.location);
};


var map;
var markers = [];
var infoWindow;


var viewModel = function() {

   var self = this;
   var marker;
   var searchResult;

   self.search_text = ko.observable('');
   self.nameList = ko.observableArray([]);
   self.showFilteredMarkers = ko.observable(); // names to store the filter


   // Iterates through defaultData in Model and adds info to markers.
   Model.defaultData.forEach(function (names) {
      self.nameList.push(new Lists(names));
   });

   // Filter based on user text / first matching item by name.
   self.filterNameList = ko.computed(function() {

        if(!self.search_text()) {
            searchResult = self.nameList();
        }else {
            searchResult = ko.utils.arrayFilter(self.nameList(), function (name) {

                return (
                    (self.search_text().length == 0 || name.name().toLowerCase().indexOf(self.search_text().toLowerCase()) > -1)
                );
            });
        }

        // Call showFilteredMarkers to visible only those markers, matched from user input.
        self.showFilteredMarkers(searchResult, self.nameList());
        return searchResult;
    });

       // To make visible user serach result only.
        self.showFilteredMarkers = function(filteredSearchArray, namesArray) {
              var i;
            for ( i = 0; i < namesArray.length; i++) {
                namesArray[i].marker.setVisible(false);
            }

            for ( i = 0; i < filteredSearchArray.length; i++) {

                namesArray[i].marker.setVisible(true);
            }

        };

    // Generate marker and its other properties.
    for(var i = 0; i < self.nameList().length; i++){

        marker = new google.maps.Marker({
            map: map,
            position: self.nameList()[i].location(),
            title: self.nameList()[i].name(),
            animation: google.maps.Animation.DROP
        });
        self.nameList()[i].marker = marker;

        // InfoWindow content.
        var popupContent = '<div id="iw-container">' +
            '<div class="iw-title">' + self.nameList()[i].name() +'</div>' +
            '</div>';

            // Call infoWindowHandler to manage popup content.
            populateInfoWindow(marker, popupContent);

            // Pushes all premade marker from for loop to markers array defined earlier.
            markers.push(marker);

            var icon1 = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
            var icon2 = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

            marker.addListener('mouseover',function() {
                this.setIcon(icon2);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(icon1);
            });
        }



        // Generate blank info object
        infoWindow = new google.maps.InfoWindow();

        // Populate one infowindow when one of the markers is clicked.
        function populateInfoWindow(marker, popupContent) {
             google.maps.event.addListener(marker, 'click', function () {
             infoWindow.setContent(popupContent);

             if (marker.getAnimation() !== null) {

                 this.setAnimation(null);
                 marker.setIcon(icon2);
                 infoWindow.close(map, this);
             } else {
                 marker.setAnimation(google.maps.Animation.BOUNCE);
                 setTimeout(function(){
                      marker.setAnimation(null);
                  }, 2000);
                 marker.setIcon(icon1);
                 infoWindow.open(map, this);
           }

           // Check if infowindow is already opened on this marker.
           if (infoWindow.marker != marker) {
                 infoWindow.setContent('');
                 infoWindow.marker = marker;

               infoWindow.addListener('closeclick', function() {
                   infoWindow.marker = null;
               });

               var streetViewService = new google.maps.StreetViewService();
               var radius = 50;

               // Add Streetview to the infowindow.
               function getStreetView(data, status) {
                   if (status == google.maps.StreetViewStatus.OK) {
                       var nearStreetViewLocation = data.location.latLng;
                       var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                      //  infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                       var panoramaOptions = {
                           position: nearStreetViewLocation,
                           pov: {
                             heading: heading,
                             pitch: 30
                           }
                        };
                       var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
                    } else {
                        infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
                    }
               }
              //  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
              //  infoWindow.open(map, marker);
           }
       });
    }

    // Function to call the FourSquares API.
    // https://discussions.udacity.com/t/how-do-i-use-foursquare-api/210274/5
    // https://discussions.udacity.com/t/help-with-adding-the-foursquare-api/256786/6
    var foursquareRequest = function(marker) {
        var apiURL = 'https://api.foursquare.com/v2/venues/search';
        var foursquareClientID = 'AGUWVQNXJEU211JMQVKINHZOHLFB5B3OVL05ESNW0I1BPAGJ'
        var foursquareSecret ='YG3GS11IP2TL2SBJFDUUKMXQ1ZSMK2RUTSXFVAM5OEQYNB4Z';
        var foursquareVersion = '20171221';
        var venueFoursquareID = marker.id;
        var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +  '&client_secret=' + foursquareSecret +'&v=' + foursquareVersion;

        $.ajax({
            url: foursquareURL,
            dataType: 'json',
            data: {
                  client_id: foursquareClientID,
                  client_secret: foursquareSecret,
                  v: foursquareVersion,
                  near: "Washington, DC",
                  query: "restaurant",
                  async: true
            },
            success: function(data) {
                console.log(data);
                var rating = data.response.venue.rating ? data.response.venue.rating: "unavailable to show rating";
                var name =  data.response.venue.name ? data.response.venue.name: "unavailable to show name";
                var location = data.response.venue.location.address ? data.response.venue.location.address: "unavailable to show location";

                this.infowindow.setContent('<div>' + '<b>' + name + '</b>' + '</div>' +
                                          '<div>' + '<b>' + rating.toString() + '</b>' + '</div>' +
                                          '<div>' + location + '</div>' +
                                          '<div>' + marker.title +
                                          '</div><div id="pano"></div>');

                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

                this.infowindow.open(map, marker);
                }
          }).fail(function(e) {
                console.log(error)
                this.infoWindow.setContent("<div><h4>Sorry. It's unavailable to load Foursquare info now.</h4></div>")
          });
      };
};



// Locate the map and the markers.
function initMap() {

   map = new google.maps.Map(document.getElementById('map'), {
         center: {lat: 38.889939, lng: -77.00905},
         zoom: 13
   });

  ko.applyBindings(viewModel);
};


function addMapScript() {
    var mapScript = document.createElement('script');
    mapScript.type = 'text/javascript';
    mapScript.async = true;
    mapScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBMNBtEzJyAvLrGDgO3m-_KNTHHfc42FK8&callback=initMap';
    mapScript.onerror = function() {
        console.log("Error loading Google Maps API");
        alert("Error loading Google Maps API");
    }
    document.body.appendChild(mapScript);
}
