<?php
$country_code = $_GET['country_code'];

// Initialize cURL session
$curl = curl_init();

// Set cURL options
curl_setopt($curl, CURLOPT_URL, "https://restcountries.com/v3/alpha/$country_code");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL request
$response = curl_exec($curl);

// Close cURL session
curl_close($curl);

// Log the response
error_log($response);

// Print the response
echo $response;
?>
