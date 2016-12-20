geoLoc = {};
currentWeather = {};

function createWeatherAPIPromise(loc, key) {
  var queryURL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + key + "&lat=" + loc.lat + "&lon=" + loc.long;
  var jqueryWPromise = $.getJSON(queryURL);
  return Promise.resolve(jqueryWPromise);
}
  
function getWeather(loc, key) {
  createWeatherAPIPromise(loc, key).then(function(res) {
    console.log(res)
  }, function(rej) {
    console.log("fail");
  });
  return "hello"
}

function getPhysAddyAPIPromise(loc) {
  var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + loc.lat + "," + loc.long;
  var jqueryAPromise = $.getJSON(queryURL);
  return Promise.resolve(jqueryAPromise);
}

function convertCondResToIconType(cond) {
  // Function returns the icon code for the Weather Icons library detailed here:
  // https://erikflowers.github.io/weather-icons/
  switch(cond) {
    case "clear sky":
      return "f00d";
      break;
    case "few clouds":
    case "scattered clouds":
    case "broken clouds":
      return "f002";
      break;
    case "shower rain":
      return "f009";
      break;
    case "rain":
      return "f008";
      break;
    case "thunderstorm":
      return "f010";
      break;
    case "snow":
      return "f00a";
      break;
    case "mist":
      return "f003";
      break;
  }
}

$(document).ready(function() {
  var apiKey = new function() {
    this.apiKey = null;
    this.getAPIKey = function() {
      return this.apiKey;
    }
  }
  
  $('.key-form').submit(function(e) {
    e.preventDefault();
    if(!apiKey.apiKey) {
      apiKey.apiKey = $(".key-text").val();
    }

    updateWeather(geoLoc, apiKey.apiKey);
  });

  function updateLocation(loc) {
    getPhysAddyAPIPromise(loc).then(function(res) {
      var locData = {
        city: res.results[0].address_components[2].long_name,
        state: res.results[0].address_components[5].short_name
      }
      console.log(locData);
      updateLocationDisplay(locData);
    }, function(rej) {
      console.log(rej);
    });
  }
  
  function updateWeather(loc, key) {
    createWeatherAPIPromise(loc, key).then(function(res) {
      currentWeather = {
        tempC: Math.floor(res.main.temp - 273),
        conditions: res.weather[0].description
      }
      updateWeatherDisplay(currentWeather);
    }, function(rej) {
      console.log(rej);
    });
  }

  function updateWeatherDisplay(weather) {
    $(".temp").html(weather.tempC + " C");
    $(".conditions").html(weather.conditions);
  }

  function geolocSuccess(pos) {
    var crd = pos.coords;
    geoLoc.lat = crd.latitude;
    geoLoc.long = crd.longitude;
    geoLoc.accuracy = crd.accuracy;
    geoLoc.timeStamp = pos.timestamp
    updateLocation(geoLoc);
  };

  function updateLocationDisplay(loc) {
    var city = loc.city;
    var state = loc.state;
    $(".location-text").html(city + ", " + state);
  }
  
  function geolocFail(err) {
    console.log(err);
  };
  
  var options = {
    timeout: 10000,
    maximumAge: 0
  };

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geolocSuccess, geolocFail, options);
  }
});