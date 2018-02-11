// the universities locations 
var MyLocations = [{
	name: 'PN University',
	lat: 24.855672,
	lng: 46.724149
}, {
	name: 'Imam  University',
	lat: 24.815050,
	lng: 46.706212
}, {
	name: 'King Saud University',
	lat: 24.716212,
	lng: 46.619129
}, {
	name: 'PS University',
	lat: 24.736292,
	lng: 46.696208
}, {
	name: 'Alfaisal University ',
	lat: 24.683383,
	lng: 46.676480
}, ];
// Declaring global variables ouside the functions  var map;
var clientID;
var clientSecret;
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.visible = ko.observable(true);
	// start to add foursquare url to the info window  
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;
	$.ajax(foursquareURL)
		.done(function(data) {
			var results = data.response.venues[0];
			self.URL = results.url;
			if(typeof self.URL === 'undefined') {
				self.URL = "";
			}
			self.street = results.location.formattedAddress[0];
			self.city = results.location.formattedAddress[1];
			// error message appear when Foursquare is fail 
		})
		.fail(function() {
			alert("There was an error with the Foursquare call. Please refresh the page");
		});
	//  creat the infoWindow 
	this.infoWindow = new google.maps.InfoWindow({
		content: self.contentString
	});
	this.marker = new google.maps.Marker({
		position: new google.maps.LatLng(data.lat, data.lng),
		map: map,
		title: data.name
	});
	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);
	//Listener for marker 
	this.marker.addListener('click', function() {
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" + '<div class="content"><a target="_blank" href="' + '">' + self.URL + "</a></div>" + '<div class="content">' + self.street + "</div>" + '<div class="content">' + self.city + "</div>";
		self.infoWindow.setContent(self.contentString);
		//         populateInfoWindow
		self.infoWindow.open(map, this);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			self.marker.setAnimation(null);
			self.infoWindow.close(map, this);
		}, 2100);
	});
	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};
//  ViewModel
function AppViewModel() {
	var self = this;
	this.searchTerm = ko.observable("");
	this.locationList = ko.observableArray([]);
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 9,
		center: {
			lat: 24.855672,
			lng: 46.724149
		},
		styles: styles
	});
	// Foursquare API 
	clientID = "ZC4PBHDXNX2HTPJLMDMXSWGI3RPYKVQA020CS5VHEOOSM2QZ";
	clientSecret = "W41YJRL00OADQRB20Z3H1U3M0VEDRV1JKBEX2WPXDDIYR5S2";
	MyLocations.forEach(function(locationItem) {
		self.locationList.push(new Location(locationItem));
	});
	this.filteredList = ko.computed(function() {
		var filter = self.searchTerm()
			.toLowerCase();
		if(!filter) {
			self.locationList()
				.forEach(function(locationItem) {
					locationItem.visible(true);
				});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);
	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}
//if any thing wrong happen to the page this alert will appear 
function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet and try again.");
}