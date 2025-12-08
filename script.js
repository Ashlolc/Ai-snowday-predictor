// Initialize Google Place Autocomplete
function initAutocomplete() {
    const locationInput = document.getElementById('location');
    const autocomplete = new google.maps.places.Autocomplete(locationInput);
}

// This will handle the API key submission and interaction with Mistral and NOAA APIs
document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete();
});

document.getElementById('submitKey').addEventListener('click', function() {
    const location = document.getElementById('location').value;
    const apiKey = document.getElementById('apiKey').value;
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');

    if (apiKey && location) {
        // Show loading animation
        loadingElement.style.display = 'block';
        predictionResultElement.innerHTML = '';

        // Store the API key and location in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('location', location);

        // First, get weather warnings from NOAA API
        // Note: Replace 'YOUR_NOAA_API_KEY' with your actual API key
        const noaaApiKey = 'YOUR_NOAA_API_KEY';
        const noaaUrl = `https://api.weather.gov/alerts/active?area=${location}`;

        fetch(noaaUrl, {
            headers: {
                'User-Agent': 'Ai-snowday-predictor'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('NOAA weather warnings:', data);
                // Here you would typically process the weather warnings and send them to the Mistral API
                // For now, we'll just display the weather warnings
                predictionResultElement.innerHTML = `<p>Weather warnings for ${location}: ${JSON.stringify(data)}</p>`;
            })
            .catch(error => {
                console.error('Error fetching weather warnings:', error);
                predictionResultElement.innerHTML = `<p>Error fetching weather warnings: ${error.message}</p>`;
            })
            .finally(() => {
                // Hide loading animation
                loadingElement.style.display = 'none';
            });
    } else {
        alert('Please enter both your location and API key.');
    }
});