// function for toggled sidebar
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");

});

// define 11 locations for markers and observableArray
var locations = [
    { title: 'Stanford University', location: { lat: 37.427628, lng: -122.169773 }, index: 0 },
    { title: 'University of California, Berkeley', location: { lat: 37.871875, lng: -122.258555 }, index: 1 },
    { title: 'Pier 39', location: { lat: 37.808781, lng: -122.409886 }, index: 2 },
    { title: 'Pier 33', location: { lat: 37.808928, lng: -122.404429 }, index: 3 },
    { title: 'Golden Gate Bridge', location: { lat: 37.807788, lng: -122.474933 }, index: 4 },
    { title: 'Union Square', location: { lat: 37.787975, lng: -122.407445 }, index: 5 },
    { title: 'San Francisco Museum of Modern Art', location: { lat: 37.785745, lng: -122.401050 }, index: 6 },
    { title: 'San José State University', location: { lat: 37.335094, lng: -121.881072 }, index: 7 },
    { title: 'Facebook, Inc.', location: { lat: 37.485249, lng: -122.147358 }, index: 8 },
    { title: 'LinkedIn Corporation', location: { lat: 37.392343, lng: -122.036297 }, index: 9 },
    { title: 'Steve Jobs Theater', location: { lat: 37.330883, lng: -122.007462 }, index: 10 },
    { title: 'Googleplex', location: { lat: 37.422288, lng: -122.084052 }, index: 11 }
];

// global variable for all markers
var markers = [];

// init google map
function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.651880, lng: -122.265426 },
        zoom: 10,
        mapTypeControl: false
    });

    // set color for default marker icon (red)
    var defaultIcon = makeMarkerIcon('F65C50');

    // set color for highlighted marker icon (yellow)
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // init google map InfoWindow
    largeInfowindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            map: map,
            icon: defaultIcon,
            id: i
        });
        markers.push(marker);
        // register click event for each marker
        marker.addListener('click', function() {
            // set all markers to default color, the highlighted color will be set in populateInfoWindow()
            for (var i = markers.length - 1; i >= 0; i--) {
                markers[i].setIcon(defaultIcon);
            }
            populateInfoWindow(this, largeInfowindow);
        });
    }
}

// populate InfoWindow, display location title and third party msg
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // set icon to highlighted color
        marker.setIcon(makeMarkerIcon('FFFF24'));
        infowindow.marker = marker;
        // init some variables for AJAX call
        var ClientID = "UAGKZMPHOXZNSQRMP3CBM5E3S0ERCIRVBGF2I4EU0L1ZWLRI";
        var ClientSecret = "JFD5XKI0VKT4TIWKDCAMH4XHYERGZIBJ5M1ECFR0QSOSVVJA";
        var requestData = {
            client_id: ClientID,
            client_secret: ClientSecret,
            ll: marker.position.lat() + "," + marker.position.lng(),
            v: '20170801',
            limit: 1
        };
        // make AJAX call to foursquare
        $.get("https://api.foursquare.com/v2/venues/explore", requestData, function(data) {
            try {
                // display response data in infowindow
                var formattedRes = data.response.groups[0].items[0].tips[0].text;
                infowindow.setContent('<div>' + marker.title + '<br>' + formattedRes + '</div>');
            } catch (err) {
                // if response doesn't contain the msg we want
                infowindow.setContent('<div>' + marker.title + '<br>Sorry, we can not find information according to the provided lat & lng</div>');
            }
        }, "json").fail(function(jqXHR) {
            // deal with request error
            var formattedRes = "There was a problem contacting the server: " + jqXHR.status + " " + jqXHR.responseText;
            infowindow.setContent('<div>' + marker.title + "<br>" + formattedRes + '</div>');
        });
        // open infowindow
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            // set call icon to default color
            for (var i = markers.length - 1; i >= 0; i--) {
                markers[i].setIcon(makeMarkerIcon('F65C50'));
            }
            infowindow.marker = null;
        });
    } else {
        marker.setIcon(makeMarkerIcon('FFFF24'));
    }
}

// set icon with the given markerColor
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// ListItems ViewModel
function listItemsViewModel() {
    var self = this;

    // init observableArray
    self.listItems = ko.observableArray(locations);

    // operations when click ListItem
    // First, add class "selected" to the ListItem
    // Second, set corresponding marker icon to highlighted color
    // Third, populate corresponding InfoWindow
    self.showInfoWindow = function(Item) {
        var index = Item.index;
        //add class "selected" to the ListItem
        $("a.selected").removeClass("selected");
        var listItemsWrapper = document.getElementById("listItems-wrapper");
        var listItems = listItemsWrapper.getElementsByTagName("a");
        var indexOfList = self.listItems.indexOf(Item);
        listItems[indexOfList].classList.add("selected");
        // set all marker icon to default color
        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].setIcon(makeMarkerIcon('F65C50'));
        }
        // populate corresponding InfoWindow
        populateInfoWindow(markers[index], largeInfowindow);
    };

    // operations for filter
    self.filt = function() {
        // get user input
        var inputText = $("#filter").val();
        // init local variable for filterResults
        var filterResults = [];
        // search each location title
        for (var i = 0; i < locations.length; i++) {
            // use toLowerCase() to get case-insensitive result
            var lowerTitle = locations[i].title.toLowerCase();
            var lowerInputText = inputText.toLowerCase();
            if (lowerTitle.match(lowerInputText) == null) {
                // if this location doesn't match user input, remove marker from map
                markers[i].setMap(null);
            } else {
                // if it matches, push this location to filterResults, and drop marker on the map
                filterResults.push(locations[i]);
                markers[i].setMap(map);
            }
        }
        // update observableArray
        self.listItems(filterResults);
    };

    // register input event on filter
    document.getElementById("filter").addEventListener("input", self.filt);
}

// apply binding
ko.applyBindings(new listItemsViewModel());