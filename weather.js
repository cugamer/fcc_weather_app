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
      return "wi-day-sunny";
      break;
    case "few clouds":
    case "scattered clouds":
    case "broken clouds":
      return "wi-day-cloudy";
      break;
    case "shower rain":
      return "wi-day-showers";
      break;
    case "rain":
      return "wi-day-rain";
      break;
    case "thunderstorm":
      return "wi-day-thunderstorm";
      break;
    case "snow":
      return "wi-day-snow";
      break;
    case "mist":
      return "wi-day-fog";
      break;
  }
}

$(document).ready(function() {
  function displayWeatherArea() {
    createWeatherFormPromise().then(function(res) {
      addActionToForm()
    });
  }

  function createWeatherFormPromise() {
    var jQueryPromise = $('.weather-display-area').html('<div class="weather-display text-center">' +
            '<p>Please enter your Open Weather Map api key to prompt display of your current weather.  Your api key can be generated for free on the <a href="http://openweathermap.org/api" target="blank">Open Weather Map site</a>.</p>.' +
          '</div>' +
          '<form class="key-form text-center">' +
            '<input type="text" class="key-text">' +
            '<input type="submit" class="key-submit" value="Add API Key">' +
          '</form>');
    return Promise.resolve(jQueryPromise);
  }
  var apiKey = new function() {
    this.apiKey = null;
    this.getAPIKey = function() {
      return this.apiKey;
    }
  }
  function addActionToForm() {
    $('.key-form').submit(function(e) {
      e.preventDefault();
      if(!apiKey.apiKey) {
        apiKey.apiKey = $(".key-text").val();
      }
      updateWeather(geoLoc, apiKey.apiKey);
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
    $(".weather-display").html('<h5 class="weather-info temp text-center">' + weather.tempC + ' C</h5>' +
      '<h5 class="weather-info conditions text-center">' + weather.conditions + '</h5>' +
      '<h5 class="weather-info condition-icon text-center">' + displayConditionIcon(weather.conditions) + '</h5>');
  }

  function updateLocation(loc) {
    getPhysAddyAPIPromise(loc).then(function(res) {
      var locData = {
        city: res.results[0].address_components[2].long_name,
        state: res.results[0].address_components[5].short_name
      }
      var city = locData.city;
      var state = locData.state;
      var locationString = city + ", " + state
      updateLocationDisplay(locationString);
    }, function(rej) {
      console.log(rej);
      updateLocationDisplay("We're sorry, the location finding system is unavailable.  Please try again later.");
    });
  }

  function geolocSuccess(pos) {
    var crd = pos.coords;
    geoLoc.lat = crd.latitude;
    geoLoc.long = crd.longitude;
    geoLoc.accuracy = crd.accuracy;
    geoLoc.timeStamp = pos.timestamp
    updateLocation(geoLoc);
    displayWeatherArea();
  };

  function updateLocationDisplay(locDisplay) {
    $(".location-text").html(locDisplay);
  }
  
  function geolocFail(err) {
    console.log(err);
    updateLocationDisplay("We're sorry, your location could not be found.  Please allow your browser to share your location on your next visit.")
  };

  var options = {
    timeout: 10000,
    maximumAge: 0
  };

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geolocSuccess, geolocFail, options);
  }

  function displayConditionIcon(cond) {
    return '<i class="wi ' + convertCondResToIconType(cond) + '">'
  }
});