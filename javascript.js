// 'use strict'
// Open Brewery API const
const openBreweryURL = 'https://api.openbrewerydb.org/breweries?';

// Google API const
const googleDistanceMatrix = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
const googleGeocoding = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleMap = 'https://maps.googleapis.com/maps/api/js?'
const googleKey = 'AIzaSyCOVytxWpWIyqONX13vwZq83on9U8KmDW8';

// CORS 
const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';

// html elements
let userInput = $('#user-input');
let searchButton = $('#search-button');
let breweryList = $('#brewery-list');

// Global variables
let currentCoord;

// html element event listeners
userInput.on('keyup', switchIcon);
userInput.keypress(enterPressed);
searchButton.on('click', enterPressed);


init();

function init() {
    locateMe();
};

// a function that changes search-button icon to 'position' when there's nothing in input
function switchIcon() {
    event.preventDefault();
    if (userInput.val().trim()) {
        searchButton.attr('uk-icon', 'search')
    } else {
        searchButton.attr('uk-icon', 'location')
    };
};

// a function that checks whether user pressed enter and what to do if occur.
function enterPressed(event) {
    if (event.which === 13 | event.type === 'click') {
        event.preventDefault();
        if (userInput.val().trim()) {
            console.log(userInput.val().trim());
            parseAddress(userInput.val().trim());
        } else {
            locateMe();
        };
        userInput.val('');
    };
};

// function that parses user input (address format: city, state postal code)
function parseAddress(address) {
    address = address.toLowerCase();
    let city = '';
    let state = '';
    let postal;
    if (!address || typeof address !== 'string') {
        return false;
    };
    if (address.includes(',')) {
        let comma = address.indexOf(',');
        city = address.slice(0, comma);
        address = address.substring(comma + 1).trim();
    };
    address = address.split(' ');
    for (var i in address) {
        if ((address[i] === 2) && isNaN(parseInt(address[i]))) {
            state = address[i];
        } else if (isNaN(parseInt(address[i]))) {
            state += address[i] + ' ';
        } else if ((address[i].length === 5) && !isNaN(parseInt(address[i]))) {
            postal = address[i];
        };
    };
    state = state.trim();
    if (state.length === 2) {
        state = stateNames[state] === undefined ? '' : stateNames[state];
    };
    makeBreweryCall({ city: city, state: state, postal: postal });
};

// a function that checks user's current location and calls callGoogleGeoCoord()
function locateMe() {
    if (!navigator.geolocation) {
        breweryList.empty();
        breweryList.append($('<h4>').text('Geolocation is not supported by your browser ...'));
        alert('Geolocation is not supported by your browser ...');
    } else {
        breweryList.empty();
        let message = $('<h4>').text('Getting your local breweries...');
        let timeoutMessage = $('<p>').text('(timeout after 60 seconds)');
        breweryList.append($('<div>').append([message, timeoutMessage]));
        let options = { timeout: 60000 };
        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    function success(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        initMap(latitude, longitude);
        currentCoord = latitude + ',' + longitude;
        console.log('Your coordinate is: ' + currentCoord);
        callGoogleGeocodingByCoord(currentCoord);
    };

    function error() {
        breweryList.empty();
        let errorMessage = $('<h4>').text('Can not get your current location...');
        breweryList.append(errorMessage);
    };
};

function initMap(lat, lng) {
    // The location = current coord
    let location = {lat: lat, lng: lng};
    // center the map on current location
    $.ajax({
        url: corsAnywhere + googleMap,
        data: {
            key: googleKey
        },
        method: 'GET'
    }).then(function (response) {
        console.log('success')
        // var map = new google.maps.Map(
        //     document.getElementById('map'), {zoom: 12, center: location});
        // var marker = new google.maps.Marker({position: location, map: map});
    })

  };


// google Geocoding call to get current city name and then search for brewery with that city name
function callGoogleGeocodingByCoord(coordinate) {
    $.ajax({
        url: corsAnywhere + googleGeocoding,
        data: {
            latlng: coordinate,
            key: googleKey
        },
        method: 'GET',
        statusCode: {
            404: function () {
                alert('We cannot find that city! (404)')
            }
        },
        crossDomain: true,
        success: function () {
            console.log("google geocoding success");
        }
    }).then(function (response) {
        console.log(response);
        let city = response.results[0].address_components[3].long_name;
        let postal = response.results[0].address_components[7].long_name;
        console.log(city);
        console.log(postal)
        makeBreweryCall({ city: city});
    });
};

// a function that searches list of breweries by city name, then 
function makeBreweryCall({ city, state, postal } = {}) {
    $.ajax({
        url: openBreweryURL,
        data: {
            by_city: city,
            by_state: state,
            by_type: '',
            by_postal: postal,
            per_page: 20
        }
    }).then(function (response) {
        if (response[0] === undefined) {
            console.log("no return data on that city name")
        } else {
            breweryObj = response;
            callGoogleDistanceByCoord();
        };
    });
};

// google Distance call by takign current coordinate and checks against each brewery address in the breweryObj
function callGoogleDistanceByCoord() {
    if (currentCoord === undefined) {
        updateBreweryList();
        return;
    };
    let destinations;
    for (var i in breweryObj) {
        let breweryCoord = breweryObj[i].street + ',' + breweryObj[i].city + ',' + breweryObj[i].state;
        destinations += breweryCoord + '|';
    }
    $.ajax({
        url: corsAnywhere + googleDistanceMatrix,
        data: {
            origins: currentCoord,
            destinations: destinations,
            key: googleKey
        },
        method: 'GET',
        statusCode: {
            404: function () {
                alert('We cannot find that city! (404)')
            }
        },
        crossDomain: true,
        success: function () {
            console.log("google distance by coord success");
        }
    }).then(function (response) {
        for (var i in response.rows[0].elements) {
            let meters = response.rows[0].elements[i].distance === undefined ? null : response.rows[0].elements[i].distance.value;
            let miles = meterToMile(meters);
            breweryObj[i].distance = miles;
        };
        console.log(breweryObj);
        updateBreweryList();
    });
};

// a function that parses data from breweryObj and updates brewery-list div
function updateBreweryList() {
    breweryList.empty();
    for (var i in breweryObj) {
        let child = $('<div>');
        let card = $('<div class="uk-card uk-card-default uk-card-body">');
        let heading = $('<h4>').text('Brewery #' + (parseInt(i) + 1));
        let name = $('<p class="uk-text-bold">').text(breweryObj[i].name);
        let breweryType = $('<p>').text('Type: ' + breweryObj[i].brewery_type);
        let address = '<p>' + breweryObj[i].street + '<br>' + breweryObj[i].city + ', ' + breweryObj[i].state + ' '
            + breweryObj[i].postal_code + '</p>';
        let distance = '<p>Distance: '
            + (breweryObj[i].distance === undefined ? 'unavailable' : breweryObj[i].distance) + '</p>'
        breweryList.append(child.append(card.append([heading, name, breweryType, address, distance])));
    };
};

// function converts meters (int) to miles 
function meterToMile(meters) {
    if (meters === null) {
        return 'N/A'
    } else {
        return (meters / 1609.34).toFixed(2) + ' miles';
    };
};


