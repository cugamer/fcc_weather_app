geoLoc = {};
currentWeather = {};

function createWeatherAPIPromise(loc, key) {
  var queryURL = "https://api.wunderground.com/api/" + key + "/conditions/q/" + loc.lat + "," + loc.long + "/json";
  console.log(queryURL);
  var jqueryWPromise = $.getJSON(queryURL);
  return Promise.resolve(jqueryWPromise);
}

function getPhysAddyAPIPromise(loc) {
  var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + loc.lat + "," + loc.long;
  var jqueryAPromise = $.getJSON(queryURL);
  return Promise.resolve(jqueryAPromise);
}

function upcaseStringFirstLetters(string) {
  var split = string.split(" ");
  for(var i = 0; i < split.length; i++) {
    var word = split[i]
    split[i] = word[0].toUpperCase() + word.slice(1, word.length).toLowerCase();
  }
  return split.join(" ");
}

function convertCondResToIconType(cond) {
  // Function returns the icon code for the Weather Icons library detailed here:
  // https://erikflowers.github.io/weather-icons/
  switch(true) {
    case /clear sky/.test(cond):
      return "wi-day-sunny";
      break;
    case /cloud/.test(cond):
      return "wi-day-cloudy";
      break;
    case /drizzle/.test(cond):
      return "wi-day-showers";
      break;
    case /rain/.test(cond):
      return "wi-day-rain";
      break;
    case /thunderstorm/.test(cond):
      return "wi-day-thunderstorm";
      break;
    case /snow/.test(cond):
      return "wi-day-snow";
      break;
    case /(mist|haze|fog)/.test(cond):
      return "wi-day-fog";
      break;
    case /hail/.test(cond):
      return "wi-day-hail";
      break;
    case /tornado/.test(cond):
      return "wi-tornado";
      break;
    default:
      return "Condition not found";
  }
}

function celsiusToFarenheit(temp) {
  return Math.floor(temp * 1.8 + 32);
}

function farenheitToCelsius(temp) {
  return Math.floor((temp - 32) / 1.8);
}

function createFormattedDateTime() {
  var date = new Date();
  return $.format.date(new Date(), 'ddd, MMMM D') + " at " + $.format.date(new Date(), 'hh:mm p');
}

$(document).ready(function() {
  function displayWeatherArea() {
    createWeatherFormPromise().then(function(res) {
      addActionToAPIKeyForm();
    });
  }

  function createWeatherFormPromise() {
    var jQueryPromise = $('.weather-display-area').html('<div class="weather-display text-center">' +
            '<p class="api-desc-text">Please enter your Open Weather Map api key to prompt display of your current weather.  Your api key can be generated for free on the <a href="http://openweathermap.org/api" target="blank">Open Weather Map site</a>.</p>.' +
          '</div>' +
          '<div class="input-area">' +
            '<form class="key-form text-center">' +
              '<input type="text" class="key-text">' +
              '<br />' +
              '<input type="submit" class="key-submit btn-primary" value="Add API Key">' +
            '</form>' + 
          '</div>' +
          '<div class="last-updated"></div>');
    return Promise.resolve(jQueryPromise);
  }

  var apiKey = new function() {
    this.apiKey = null;
  }

  apiKey.setAPIKey = function(key) {
    this.apiKey = key;
  }

  apiKey.getAPIKey = function() {
    return this.apiKey;
  }

  function addActionToAPIKeyForm() {
    $('.key-form').submit(function(e) {
      e.preventDefault();
      var key = $(".key-text").val();
      updateWeather(geoLoc, key);
    });
  }

  function addLastUpdatedAt() {
    $('.last-updated').html('<p class="text-center">' +
      'Last Updated: ' +
      createFormattedDateTime() +
      '</p>');
  }

  function emptyAPIKeyForm() {
    $(".key-text").val('');
  }

  function updateWeather(loc, key) {
    createWeatherAPIPromise(loc, key).then(function(res) {
    if(!apiKey.apiKey) {
      apiKey.setAPIKey(key);
    }
      currentWeather = {
        tempC: Math.floor(res.current_observation.temp_c),
        conditions: res.current_observation.icon,
        weatherIconUrl: res.current_observation.icon_url
      }
      updateWeatherDisplay(currentWeather);
      addRefreshWeatherButton();
      addLastUpdatedAt();
    }, function(rej) {
      alert("Your API key was not recognized, please try again.");
      emptyAPIKeyForm();
    });
  }

  function weatherDisplayPromise(weather) {
    var jQueryPromise = $(".weather-display").html('<h5 class="weather-info temp text-center">' +
      '<span class="current-temp">' + 
      celsiusToFarenheit(weather.tempC) + 
      '</span>' +
      ' <a class="temp-toggle temp-f">F</a></h5>' +
      '<h5 class="weather-info conditions text-center">' + 
      upcaseStringFirstLetters(weather.conditions) + 
      '</h5>' +
      '<h5 class="weather-info condition-icon text-center">' + 
      displayConditionIcon(weather.conditions) + 
      '</h5>');
    return Promise.resolve(jQueryPromise);
  }

  function updateWeatherDisplay(weather) {
    weatherDisplayPromise(weather).then(function() {
      addCFToggleToTemp();
    });
  }

  function addCFToggleToTemp() {
    $('.temp-toggle').on('click', function() {
      if($('.temp-toggle').hasClass('temp-f')) {
        $('.temp-toggle').html(" C");
        $('.temp-toggle').removeClass("temp-f");
        $('.temp-toggle').addClass("temp-c");
        $('.current-temp').html(currentWeather.tempC);
      } else if($('.temp-toggle').hasClass('temp-c')) {
        $('.temp-toggle').html(" F");
        $('.temp-toggle').removeClass("temp-c");
        $('.temp-toggle').addClass("temp-f");
        $('.current-temp').html(celsiusToFarenheit(currentWeather.tempC));
      }
    });
  }

  function addActionToRefreshButton() {
    $('.refresh-weather').on('click', function() {
      var d = new Date();
      updateWeather(geoLoc, apiKey.getAPIKey());
    });
  }

  function addRefreshWeatherButton() {
    var jQueryPromise = $(".input-area").html('<button class="btn-primary refresh-weather">Refresh Weather</button>');
    Promise.resolve(jQueryPromise).then(function() {
      addActionToRefreshButton();
    });
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

  function updateLocationDisplay(locDisplay) {
    $(".location-text").html(locDisplay);
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

  function geolocFail(err) {
    console.log(err);
    updateLocationDisplay("We're sorry, your location could not be found.  Please allow your browser to share your location on your next visit.")
  };

  var gelocOptions = {
    timeout: 10000,
    maximumAge: 0
  };

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geolocSuccess, geolocFail, gelocOptions);
  }

  function displayConditionIcon(cond) {
    return '<i class="weather-icon wi ' + convertCondResToIconType(cond) + '">'
  }
});