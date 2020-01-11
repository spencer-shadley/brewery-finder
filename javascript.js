// useless movie api keys
const amcURL = 'https://api.amctheatres.com'
const amcKey = 'DC87D69F-B269-400A-B458-AA319B73C979';

const fandangoURL = 'https://api.fandango.com/';
const fandangoKey = '7ruk67vquvjqyx2e47pfekcb';
const fandangoSecret = 'dwC8aNHy5p';

const movieGluTarget = 'https://api-gate2.movieglu.com/';
const movieGluKey = 'VnruLtzgUz66rimiCwOWWMRBtoEsz3o6R8RSpJT1';
const movieGluUserName = 'PROJ_12';
const movieGluAuthorization = 'Basic UFJPSl8xMjpncW1mVmlPOTV3N20=';
const movieGluApiVersion = 'v200';
// ----------------------------------------------------------------------//





// Open Brewery API const
const openBreweryURL = 'https://api.openbrewerydb.org/breweries';

// Google Distance Matrix API const
const googleDistanceMatrix = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
const googleKey = 'AIzaSyCOVytxWpWIyqONX13vwZq83on9U8KmDW8';
const corsAnywhere = 'https://cors-anywhere.herokuapp.com/';

// Global variables
let origins = 'Seattle';
let destinations = 'San Jose';
let currentCoord;


// locateMe();




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
        success: function() {
            console.log("success");
        }
    }).then(function(response) {
        console.log(response);
        console.log(response.rows[0].elements[0].distance.text);
    });
};







function callBreweryByCity() {
    $.ajax({
        url: openBreweryURL + '?by_city=' + city
    }).then(function (response) {
        console.log(response);
        console.log('Brewery Name: ' + response[0].name);
        console.log('Brewery Address: ' + response[0].street + '\n' + response[0].city + ', ' + response[0].state + ' ' + response[0].postal_code);
        console.log('Brewery Phone Number: ' + response[0].phone);
        console.log('Brewery Lon: ' + response[0].longitude);
        console.log('Brewery Lat: ' + response[0].latitude);
    });
};






// a function that checks user's current location
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
    };

    function error() {
        currentCityDiv.append(message);
    };
};






// movieGlu API call NOT WORKING
// $.ajax({
//     url: movieGluTarget + 'filmsNowShowing/?n=10',
//     data: {
//         client: movieGluUserName,
//         'x-api-key': movieGluKey,
//         Authorization: movieGluAuthorization,
//         'api-version': movieGluApiVersion
//     },
//     method: 'GET'
// }).then(function (response) {
//     console.log(response)
// });