// Open Brewery API const
const openBreweryURL = 'https://api.openbrewerydb.org/breweries';

// Google API const
const googleDistanceMatrix = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
const googleGeocoding = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleKey = 'AIzaSyCOVytxWpWIyqONX13vwZq83on9U8KmDW8';

// CORS 
const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';

// html elements
let locateMeButton = $('#locate-me');
let breweryList = $('#brewery-list');

// Global variables
let currentCity = 'Portland';
let currentCoord = '47.85839,-122.27090049999998';


// callBreweryByCity(currentCity);

// will need to get user location at beginning -> update local variable current coord

// user can search city name -> calls brewery api by city name -> updates local brewery obj -> make one google distance call with all the addresses -> update local brewery obj with distance data -> display result to user

// user can click on locate me button -> browser gets user coord and store it in local var -> make one google distance call with all the addresses -> update local brewery obj with distance data -> 


locateMeButton.on('click', locateMe);

// init
updateBreweryList();

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
        console.log(currentCoord);
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
        currentCity = response.results[0].address_components[2].long_name;
        callBreweryByCity(currentCity);
    });
};

// a function that searches list of breweries by city name, then 
function callBreweryByCity(city) {
    $.ajax({
        url: openBreweryURL + '?by_city=' + city
    }).then(function (response) {
        breweryObj = response;
        console.log(response);
        console.log('Brewery Name: ' + response[0].name);
        console.log('Brewery Address: ' + response[0].street + '\n' + response[0].city + ', ' + response[0].state + ' ' + response[0].postal_code);
        console.log('Brewery Phone Number: ' + response[0].phone);
        console.log('Brewery Lon: ' + response[0].longitude);
        console.log('Brewery Lat: ' + response[0].latitude);
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
        for (i in response.rows[0].elements) {
            let meters = response.rows[0].elements[i].distance.value;
            let miles = meterToMile(meters) + ' miles';
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
        let heading = $('<h4>').text('Brewery #' + i);
        let name = $('<p class="uk-text-bold">').text(breweryObj[i].name);
        let address = '<p>' + breweryObj[i].street + '<br>' + breweryObj[i].city + ', ' + breweryObj[i].state + ' ' + breweryObj[i].postal_code + '</p>'
        card.append(heading);
        card.append(name);
        card.append(address);
        child.append(card);
        breweryList.append(child);
    }
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
    let miles = (meters / 1609.34).toFixed(2);
    return miles;
};