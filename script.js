// This will handle the API key submission and interaction with Mistral and OpenWeatherMap APIs
document.getElementById('autofillLocation').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Use a reverse geocoding service to get the location name from coordinates
            // For simplicity, we'll just display the coordinates here
            const location = `${position.coords.latitude}, ${position.coords.longitude}`;
            document.getElementById('location').value = location;
        }, function(error) {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
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

        // First, get weather data from OpenWeatherMap API
        // Note: Replace 'YOUR_OPENWEATHERMAP_API_KEY' with your actual API key
        const openWeatherMapApiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherMapApiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Weather data:', data);
                // Here you would typically process the weather data and send it to the Mistral API
                // For now, we'll just display the weather data
                predictionResultElement.innerHTML = `<p>Weather data for ${location}: ${JSON.stringify(data)}</p>`;
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                predictionResultElement.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
            })
            .finally(() => {
                // Hide loading animation
                loadingElement.style.display = 'none';
            });
    } else {
        alert('Please enter both your location and API key.');
    }
});