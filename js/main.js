var map;
var marker;
function createMarker(latlng) {
  marker = new google.maps.Marker({
    position: latlng,
    map: map,
  });
  return marker;
}
var locations = [{
    name: "Indoor Extreme Sports Paintball & Laser Tag",
    address: "47-11 Van Dam St, Long Island City, NY 11101",
    lat: 40.742171,
    lng: -73.933568,
    yelp_website: "https://api.yelp.com/v2/business/indoor-extreme-sports-long-island-city"
  },
  {
    name: "Five Leaves",
    address: "18 Bedford Ave, Brooklyn, NY 11222",
    lat: 40.723722,
    lng: -73.951628,
    yelp_website: "https://api.yelp.com/v2/business/five-leaves-brooklyn-2"
  },
  {
    name: "UPS Customer Center - MASPETH",
    address: "5613 48th St, Maspeth, NY 11378",
    lat: 40.727501,
    lng: -73.921643,
    yelp_website: "https://api.yelp.com/v2/business/ups-customer-center-maspeth"
  },
  {
    name: "Mount Zion Cemetery",
    address: "59-63 54th Ave, Maspeth, NY 11378",
    lat: 40.730685,
    lng: -73.906576,
    yelp_website: "https://api.yelp.com/v2/business/mount-zion-cemetery-maspeth"
  },
  {
    name: "Calvary Cemetery",
    address: "4902 Laurel Hill Blvd, Woodside, NY 11377",
    lat: 40.7351807,
    lng: -73.91721889999999,
    yelp_website: "https://api.yelp.com/v2/business/calvary-cemetery-woodside"
  }
];
var apiCall = function(i) {
    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }
    var yelp_url = locations[i].yelp_website;
    var parameters = {
        oauth_consumer_key: 'Ym8uo_wnWdzgxbD30Ht3Gw',
        oauth_token: 'Buej2WYz709jlUxKhGz91gfnhDGOjLBg',
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb'
    };
    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, 'mGGqwLqFKB5MGGEASJ3rnvT7Qx0', 'rX2fF33xyhSNQhJd7B8y3xKCAyQ');
    parameters.oauth_signature = encodedSignature;
    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function(results) {
            locations[i].result = results;
            locations[i].rating = results.rating_img_url;
            locations[i].review = results.snippet_text;
        },
        error: function() {
          window.alert("The API call to Yelp failed. Please try again.");
        }
    };
    $.ajax(settings);
};
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.730610, lng: -73.935242},
    zoom: 15
  });
  var infowindow;
  infowindow = new google.maps.InfoWindow({
    maxWidth: 200
  });
  var locationLength = location.length;
  for (var i = 0; i < locationLength; i++) {
      apiCall(i);
  }
  var viewModel = function() {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.value = ko.observable('');
    for (var i = 0; i < locations.length; i++) {
      locations[i].marker = createMarker(new google.maps.LatLng(locations[i].lat, locations[i].lng));
    }
    self.locations().forEach(function(place) {
      google.maps.event.addListener(place.marker, 'click', (function(marker, map, infowindow) {
        return function() {
          var contentString = '<h2>' + place.title + '</h2>' + '<h3>Rating:</h3>' + '<img src=' + place.rating + '>' + '<h3>Reviews:</h3>' + '<div>' + place.review + '<br>' + '<br>' + 'Information provided by Yelp' + '</div>';
          infowindow.setContent(contentString);
          infowindow.open(map, place.marker);
        };
      })(place.marker, map, infowindow));
    });
    self.search = ko.computed(function() {
      return ko.utils.arrayFilter(self.locations(), function(place) {
        var match = place.name.toLowerCase().indexOf(self.value().toLowerCase()) >= 0;
        place.marker.setVisible(match);
        return match;
      });
    });
  };
  ko.applyBindings(new viewModel());
}
