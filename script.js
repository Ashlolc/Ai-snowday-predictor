// This will handle the API key submission and interaction with Mistral and Open-Meteo APIs
document.getElementById('autofillLocation').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

            fetch(nominatimUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.display_name) {
                        document.getElementById('location').value = data.display_name;
                    } else {
                        document.getElementById('location').value = `${latitude}, ${longitude}`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching location data:', error);
                    document.getElementById('location').value = `${latitude}, ${longitude}`;
                });
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

        // First, get weather data from Open-Meteo API
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        fetch(openMeteoUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Open-Meteo weather data:', data);
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