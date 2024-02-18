<?php
// Get latitude and longitude from the GET parameters
$lat = $_GET['lat'];
$lng = $_GET['lng'];

// API key for OpenWeatherMap
$apiKey = 'f7d3ccd62dcc8753dfe19a9cf24b8490';

// Create a cURL handle
$ch = curl_init();

// Set cURL options
$url = "http://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lng&appid=$apiKey";
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL request
$response = curl_exec($ch);

// Check for errors
if(curl_errno($ch)){
    echo 'Curl error: ' . curl_error($ch);
}

// Close cURL handle
curl_close($ch);

// Output the response
print_r($response);
?>
