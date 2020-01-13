// Open Brewery API const
const openBreweryURL = 'https://api.openbrewerydb.org/breweries?';

// Google API const
const googleDistanceMatrix = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
const googleGeocoding = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleKey = 'AIzaSyCOVytxWpWIyqONX13vwZq83on9U8KmDW8';

// CORS 
const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';

// html elements
let userInput = $('#user-input');
let searchButton = $('#search-button');
let breweryList = $('#brewery-list');

// Global variables
let searchCity;
let currentState;
let currentPostal;
let currentCoord = '47.85839,-122.27090049999998';


// will need to get user location at beginning -> update local variable current coord

// user can search city name -> calls brewery api by city name -> updates local brewery obj -> make one google distance call with all the addresses -> update local brewery obj with distance data -> display result to user

// user can click on locate me button -> browser gets user coord and store it in local var -> make one google distance call with all the addresses -> update local brewery obj with distance data -> 



// html element event listeners
userInput.on('keyup', switchIcon);
userInput.keypress(enterPressed);
searchButton.on('click', enterPressed);


// init
// locateMe();
updateBreweryList();

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
        console.log('enter pressed or button clicked');
        if (userInput.val().trim()) {
            console.log(userInput.val().trim());
            // callBreweryByCity(userInput.val().trim());
            parseAddress(userInput.val().trim());
        } else {
            locateMe();
        };
        userInput.val('');
    };
};

function parseAddress(address) {
    let comma = address.indexOf(',');
    // console.log(comma);
    let city = address.slice(0, comma);
    let state = '';
    let postal = '';
    let after = address.substring(comma + 1).trim();
    if (after.length === 2 && isNaN(parseInt(after))) {
        state = after;
    } else {
        console.log("State not found")
        // let space = after.lastIndexOf(' ');
        // state = after.slice(0, space);
        // postal = after.substring(space + 1)
    }
    console.log(city);
    console.log(state);
    console.log(postal);
};

// a function that checks user's current location and calls callGoogleGeoCoord()
function locateMe() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser ...');
    } else {
        let options = { timeout: 60000 };
        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    function success(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        currentCoord = latitude + ',' + longitude;
        console.log('Your coordinate is: ' + currentCoord);
        callGoogleGeocodingByCoord(currentCoord);
    };

    function error() {
        alert('Can not get your current location...');
    };
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
        searchCity = response.results[0].address_components[2].long_name;
        callBreweryByCity(searchCity);
    });
};

// a function that searches list of breweries by city name, then 
function callBreweryByCity(city) {
    $.ajax({
        url: openBreweryURL,
        data: {
            by_city: city,
            by_type: '',
            per_page: 20
        }
    }).then(function (response) {
        breweryObj = response;
        callGoogleDistanceByCoord();
    });
};

// google Distance call by takign current coordinate and checks against each brewery address in the breweryObj
function callGoogleDistanceByCoord() {
    let destinations;
    for (i in breweryObj) {
        let currentCoord = breweryObj[i].street + ',' + breweryObj[i].city + ',' + breweryObj[i].state;
        destinations += currentCoord + '|'
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
        console.log(response);
        for (i in response.rows[0].elements) {
            let meters = response.rows[0].elements[i].distance === undefined ? null : response.rows[0].elements[i].distance.value;
            let miles = meterToMile(meters);
            console.log(miles);
            breweryObj[i].distance = miles;
        };
        console.log(breweryObj);
        updateBreweryList();
    });
};

// a function that parses data from breweryObj and updates brewery-list div
function updateBreweryList() {
    breweryList.empty();
    for (i in breweryObj) {
        let child = $('<div>');
        let card = $('<div class="uk-card uk-card-default uk-card-body">');
        let heading = $('<h4>').text('Brewery #' + (parseInt(i) + 1));
        let name = $('<p class="uk-text-bold">').text(breweryObj[i].name);
        let breweryType = $('<p>').text('Type: ' + breweryObj[i].brewery_type);
        let address = '<p>' + breweryObj[i].street + '<br>' + breweryObj[i].city + ', ' + breweryObj[i].state + ' '
            + breweryObj[i].postal_code + '</p>';
        let distance = '<p>Distance: ' + breweryObj[i].distance + '</p>'
        breweryList.append(child.append(card.append([heading, name, breweryType, address, distance])));
    };
};



// not being used at this time
function callGoogleDistanceByCity() {
    $.ajax({
        url: corsAnywhere + googleDistanceMatrix,
        data: {
            origins: origins,
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
            console.log("google distance by city success");
        }
    }).then(function (response) {
        console.log(response);
    });
};



// function converts meters (int) to miles 
function meterToMile(meters) {
    if (meters === null) {
        return 'n/a'
    } else {
        return (meters / 1609.34).toFixed(2) + ' miles';
    };
};