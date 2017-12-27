// Loaction information of my favorite restaurants of Washington DC.
var Model = {
  defaultData: [
    {
    name: "Florida Avenue Grill",
    address: "1100 Florida Ave NW, Washington, DC 20009",
    location: {
        lat: 38.920613,
        lng: -77.027349
    },
    FourSquareVenueID: '4a2bf0f2f964a520f6961fe3'
  },
  {
    name: "Market Lunch",
    address: "225 7th St SE, Washington, DC 20003",
    location: {
        lat: 38.886652,
        lng: -76.996438
    },
    FourSquareVenueID: '4ad20de2f964a52012df20e3'
  },
  {
    name: "Shaw's Tavern",
    address: "520 Florida Ave NW, Washington, DC 20001",
    location: {
        lat: 38.915118,
        lng: -77.019651
    },
      FourSquareVenueID: '4dfcd01aae6033b2a475c54d'
  },
  {
    name: "Tonic",
    address: "2036 G St NW, Washington, DC 20036",
    location: {
        lat: 38.89808,
        lng: -77.046469
    },
    FourSquareVenueID: '49d1b87af964a520955b1fe3'
  },
  {
    name: "Daikaya",
    address: "705 6th St NW, Washington, DC 20001",
    location: {
        lat: 38.898574,
        lng: -77.019638
    },
    FourSquareVenueID: '50905502d63e87c2d3448e35'
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
   self.FourSquareVenueID = ko.observable(data.FourSquareVenueID);
};

var map;
var markers = [];
var infoWindow;

var ViewModel = function() {

   // Assigning this to an alias to avoid confusion later on when trying to refer to the scope of the ViewModel
   var self = this;

   var marker;
   var searchResult;
   var contentString = "";
   var contentString1 = "";
   var contentString2 = "";
   infoWindow = new google.maps.InfoWindow();


   self.search_text = ko.observable('');
   self.nameList = ko.observableArray([]);
   self.showFilteredMarkers = ko.observable(); // names to store the filter
   self.Venue = ko.observableArray([]);


   // Iterates through defaultData in Model and adds info to markers.
   Model.defaultData.forEach(function (names) {
       self.nameList.push(new Lists(names));
   });

   // Filter based on user text / first matching item by name.
   self.filterNameList = ko.computed(function() {

        if (!self.search_text()) {
            searchResult = self.nameList();
        } else {
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


        // When the list is clicked activate the associated marker and open infoWindow.
        self.showWindow = function() {
            google.maps.event.trigger(marker, 'click');
        };

    // Generate marker and its other properties.
        for(var i = 0; i < self.nameList().length; i++) {

            marker = new google.maps.Marker({
                map: map,
                position: self.nameList()[i].location(),
                title: self.nameList()[i].name(),
                animation: google.maps.Animation.DROP,
                id:i
            });
            self.nameList()[i].marker = marker;

            // Pushes all premade marker from for loop to markers array defined earlier.
            markers.push(marker);

            var icon1 = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
            var icon2 = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";

            marker.addListener('mouseover', function () {
                this.setIcon(icon2);
            });
            marker.addListener('mouseout', function () {
                this.setIcon(icon1);
            });

            marker.addListener('click', function () {
                var i = this.id;

                contentString = "";
                populateInfoWindow(this, contentString);
                foursquareRequest(self.nameList()[i].FourSquareVenueID());

                contentString = contentString1 + contentString2;

                if (contentString != "") {
                    infoWindow.setContent(contentString);
                    infoWindow.open(map, this);
                }
            });
        }


    // Populate one infowindow when one of the markers is clicked.
    function populateInfoWindow(marker, popupContent) {

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
           }

           // Check if infowindow is already opened on this marker.
             if (infoWindow.marker != marker) {
                 infoWindow.marker = marker;

                 var streetViewService = new google.maps.StreetViewService();
                 var radius = 50;
                 streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

                 function getStreetView(data, status) {
                     contentString = "";
                     if (status == google.maps.StreetViewStatus.OK) {
                         var nearStreetViewLocation = data.location.latLng;
                         var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                         var panoramaOptions = {
                             position: nearStreetViewLocation,
                             pov: {
                                 heading: heading,
                                 pitch: 30
                             }
                         };
                         var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);

                         return contentString1 = '<div><h2>' + marker.title + '</h2></div><div id="pano"></div>';

                     } else {
                         return contentString1 = '<div>' + marker.title + '</div>' + '<div>No Street View Found</div>';
                     }
                 }
                 return contentString1 = '<div><h2>' + marker.title + '</h2></div><div id="pano"></div>';
           }

    }

    // Function to call the FourSquares API.
    // https://discussions.udacity.com/t/how-do-i-use-foursquare-api/210274/5
    // https://discussions.udacity.com/t/help-with-adding-the-foursquare-api/256786/6
    function foursquareRequest (VenueID) {

        var apiURL = 'https://api.foursquare.com/v2/venues/';
        var foursquareClientID = 'AGUWVQNXJEU211JMQVKINHZOHLFB5B3OVL05ESNW0I1BPAGJ';
        var foursquareSecret ='YG3GS11IP2TL2SBJFDUUKMXQ1ZSMK2RUTSXFVAM5OEQYNB4Z';
        var foursquareVersion = '20171221';
        var venueFoursquareID = VenueID;

        apiUrl = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID +
            '&client_secret=' + foursquareSecret + '&v=' + foursquareVersion + '&limit=1';


        $.ajax({
            url: apiUrl,
            success: function (data) {

                var rating = data.response.venue.rating ? data.response.venue.rating : "unavailable to show rating";
                //var name = data.response.venue.categories.name ? data.response.venue.categories.name : "unavailable to show name";
                var location = data.response.venue.location.address ? data.response.venue.location.address : "unavailable to show address";

                return contentString2 = '<div><b><h4>' + 'Rating: ' + rating.toString() +
                                        '</h4></b></div><div><h4>' + 'Address: ' + location + '</h4></div>';
                //'<div><b>' + 'categories: ' + name + '</b></div>' +
            },
            error: function (e) {
                return contentString2 = '<h5>Foursquare data is unavailable.</h5>';
            }
        });
        return contentString2;

    };

};



// Locate the map and the markers.
function initMap() {

   map = new google.maps.Map(document.getElementById('map'), {
         center: {lat: 38.889939, lng: -77.00905},
         zoom: 13
   });

  ko.applyBindings(ViewModel);
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
