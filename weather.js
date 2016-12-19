geoLoc = {};

function createWeatherAPIPromise(loc, key) {
  console.log("loc " +loc)
  var queryURL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + key + "&lat=" + loc.lat + "&lon=" + loc.long;
  console.log(queryURL);
  var jqueryWPromise = $.getJSON(queryURL);
  return Promise.resolve(jqueryWPromise);
}
  

function getWeather(loc, key) {
  createWeatherAPIPromise(loc, key).then(function(res) {
    console.log(res)
  }, function(rej) {
    console.log("fail");
  });
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
    apiKey.apiKey = $(".key-text").val();
    console.log(apiKey.apiKey)
  });
  

  
  
  function geolocSuccess(pos) {
    console.log(pos)

    var crd = pos.coords;
    geoLoc.lat = crd.latitude;
    geoLoc.long = crd.longitude;
    geoLoc.accuracy = crd.accuracy;
    geoLoc.timeStamp = pos.timestamp
    console.log(geoLoc.lat)
  };
  
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