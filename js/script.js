let countryBoundary;
let map;
let countryName;
let lat;
let lng;
let capital;



 let OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  });

  map = L.map("map", {
    attributionControl: false,
  }).setView([0, 0], 1.5);

  map.addLayer(OpenStreetMap);

  L.control.scale().addTo(map);
  map.zoomControl.setPosition("topright");

  countryBoundary = new L.geoJson().addTo(map);

  getCountryCodes();
  getUserLocation();


function getCountryCodes() {
  $.ajax({
    url: "php/getCountriesCode.php?",
    type: "GET",
    success: function (json) {
      let countries = JSON.parse(json);
      let option = "";
      for (country of countries) {
        option +=
          '<option value="' + country[1] + '">' + country[0] + "</option>";
      }
      $("#country_list").append(option).select2();
    },
  });
}

function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const {
                    latitude,
                    longitude
                } = position.coords;

                map.setView([latitude, longitude], 6); // Set the zoom level to show the user's location
                L.popup({ autoClose: false, closeOnClick: false })
                    .setLatLng([latitude, longitude])
                    .setContent("Your Location")
                    .openOn(map);
            },
            function () {
                alert("Could not get your position!");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function getCountryBorder(countryCode) {
  $.ajax({
    url: "php/getCountryBorder.php",
    type: "GET",
    data: {
      country_code: countryCode,
    },
    success: function (json) {
      json = JSON.parse(json);
      
      // Clear existing GeoJSON layers
      map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });

      // Add new GeoJSON layer for the selected country with custom style
      var countryLayer = L.geoJSON(json, {
        style: polyStyle // Apply custom style to the GeoJSON layer
      }).addTo(map);

      // Fit the map to the bounds of the country
      map.fitBounds(countryLayer.getBounds());
    },
  });
}

function polyStyle() {
  return {
    weight: 5,
    opacity: 0.5,
    color: "teal",
    fillOpacity: 0.5,
    lineJoin: 'round',
  };
}


function zoomToCountry(countryCode) {
  if (countryCode == "") return;
  countryName = $("#country_list option:selected").text();
  getCountryBorder(countryCode);
  getCountryInfo(countryCode);
  getWeatherInfo();

}



function getCountryInfo(countryCode) {
  console.log("Country Code:", countryCode); // Log the country code before making the AJAX request
  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    dataType: 'JSON', // Specify that you expect JSON data in the response
    data: {
      country_code: countryCode,
    },
    success: function (response) {
      console.log("Response:", response); // Log the response from the PHP script
      try {
        if (response && response.length > 0) {
          let countryInfo = response[0];

          // Extracting information from countryInfo object
          let commonName = countryInfo.name.common || "N/A";
          capital = countryInfo.capital && countryInfo.capital.length > 0 ? countryInfo.capital[0] : "N/A";
          let population = countryInfo.population || "N/A";
          let flag = countryInfo.flags && countryInfo.flags.length > 0 ? countryInfo.flags[0] : "N/A";
          let area = countryInfo.area || "N/A";
          lat = countryInfo.latlng[0];
          lng = countryInfo.latlng[1];
          lat = lat.toFixed(2);
          lng = lng.toFixed(2);
          console.log(lat, lng);
          let currencyCode = Object.keys(countryInfo.currencies)[0];
          console.log(currencyCode);
          

          // Update modal content with extracted information
          let modalContent = `
            <p><strong>Common Name:</strong> ${commonName}</p>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Area:</strong> ${area} square kilometers</p>
            <img src="${flag}" alt="Flag" style="max-width: 100px; max-height: 100px;">
          `;
          $("#countryInfoModal").html(modalContent);

          // Show the modal
          $('#countryModal').modal('show');
        } else {
          console.error("Empty or invalid country data.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX Error:", xhr.responseText);
    }
  });
}

function getWeatherInfo(lat, lng) {
  $.ajax({
    url: "php/getWeatherInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng
    },
    success: function(response) {
      console.log("Weather Info Response:", response);
      // Update modal body with weather information
      let modalContent = `
        <p>Temperature: ${response.main.temp} K</p>
        <p>Description: ${response.weather[0].description}</p>
        <p>Humidity: ${response.main.humidity} %</p>
        <p>Wind Speed: ${response.wind.speed} m/s</p>
      `;
      $("#weatherInfoModal").html(modalContent);
      // Show the modal
      $('#weatherModal').modal('show');
    },
    error: function(xhr, status, error) {
      console.error("AJAX Error:", error);
    }
  });
}

function getWikipediaLink(countryName) {
  if (!countryName) {
    console.error("Country name is undefined or empty");
    return;
  }

  // Convert spaces to underscores and URL encode the country name
  let encodedCountryName = encodeURIComponent(countryName.replace(/ /g, "_"));
  // Construct and return the Wikipedia link
  return "https://en.wikipedia.org/wiki/" + encodedCountryName;
}

// Function to be called when the button is clicked
function handleWikipediaButtonClick() {
  // Call getWikipediaLink only if countryName is defined
  if (countryName) {
    let wikipediaLink = getWikipediaLink(countryName);

    // Log the constructed link to the console
    console.log("Wikipedia link for " + countryName + ": " + wikipediaLink);
  } else {
    console.error("Country name is not defined");
  }
}

// Attach click event listener to the button
document.getElementById("wikipediaButton").addEventListener("click", handleWikipediaButtonClick);




// function getExchangeRate(baseCurrency, targetCurrency) {
//   const apiKey = '2e8fe106001f4a139bac558a55910139'; // Replace with your actual API key
//   const apiUrl = `https://api.exchangeratesapi.io/latest?base=${baseCurrency}&symbols=${targetCurrency}&apikey=${apiKey}`;
//   console.log("Requesting data from:", apiUrl);

//   // Using jQuery's AJAX method
//   $.ajax({
//       url: apiUrl,
//       method: 'GET',
//       success: function(response) {
//           // Extract the exchange rate
//           const exchangeRate = response.rates[targetCurrency];
//           console.log(`1 ${baseCurrency} equals ${exchangeRate} ${targetCurrency}`);
//       },
//       error: function(xhr, status, error) {
//           console.error('Error fetching exchange rate:', error);
//       }
//   });
// }




