// This will handle the API key submission and interaction with Mistral and Open-Meteo APIs
document.getElementById('submitKey').addEventListener('click', function() {
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const apiKey = document.getElementById('apiKey').value;
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');

    if (apiKey && state && city) {
        // Show loading animation
        loadingElement.style.display = 'block';
        predictionResultElement.innerHTML = '';

        // Store the API key, state, and city in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('state', state);
        sessionStorage.setItem('city', city);

        // First, get weather data from Open-Meteo API
        // Note: Replace with actual coordinates for the city and state
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        fetch(openMeteoUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Open-Meteo weather data:', data);
                // Here you would typically process the weather data and send it to the Mistral API
                // For now, we'll just display the weather data
                predictionResultElement.innerHTML = `<p>Weather data for ${city}, ${state}: ${JSON.stringify(data)}</p>`;

                // Log the user's input for the AI to see after the API call is completed
                console.log('User Input:', { state, city });

                // Make API call to Mistral AI Studio
                const mistralUrl = 'https://api.mistral.ai/v1/chat/completions';
                const mistralData = {
                    model: 'mistral-tiny',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: `What is the weather like in ${city}, ${state}?` }
                    ]
                };

                fetch(mistralUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(mistralData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Mistral API response:', data);
                    predictionResultElement.innerHTML += `<p>Mistral API response: ${JSON.stringify(data)}</p>`;
                })
                .catch(error => {
                    console.error('Error calling Mistral API:', error);
                    predictionResultElement.innerHTML += `<p>Error calling Mistral API: ${error.message}</p>`;
                });
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
        alert('Please enter your state, city, and API key.');
    }
});