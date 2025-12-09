// This will handle the API key submission and interaction with Mistral and Open-Meteo APIs
document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: DOMContentLoaded event fired.');

    if (!document.getElementById('submitKey')) {
        console.error('DEBUG: Submit button not found.');
    }

    if (!document.getElementById('location')) {
        console.error('DEBUG: Location input not found.');
    }

    if (!document.getElementById('state')) {
        console.error('DEBUG: State input not found.');
    }

    if (!document.getElementById('city')) {
        console.error('DEBUG: City input not found.');
    }

    if (!document.getElementById('apiKey')) {
        console.error('DEBUG: API key input not found.');
    }

    if (!document.getElementById('loading')) {
        console.error('DEBUG: Loading element not found.');
    }

    if (!document.getElementById('predictionResult')) {
        console.error('DEBUG: Prediction result element not found.');
    }
});

document.getElementById('submitKey').addEventListener('click', function() {
    console.log('DEBUG: Submit button clicked.');

    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value;
    const apiKey = document.getElementById('apiKey').value;
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');

    console.log('DEBUG: State value:', state);
    console.log('DEBUG: City value:', city);
    console.log('DEBUG: API key value:', apiKey ? '*****' : 'Not provided');

    if (!state) {
        console.error('DEBUG: State value is empty.');
    }

    if (!city) {
        console.error('DEBUG: City value is empty.');
    }

    if (!apiKey) {
        console.error('DEBUG: API key value is empty.');
    }

    if (!loadingElement) {
        console.error('DEBUG: Loading element is null.');
    }

    if (!predictionResultElement) {
        console.error('DEBUG: Prediction result element is null.');
    }

    if (apiKey && state && city) {
        console.log('DEBUG: All required values are provided. Proceeding with API calls.');

        // Show loading animation
        loadingElement.style.display = 'block';
        predictionResultElement.innerHTML = '';

        console.log('DEBUG: Loading animation shown. Prediction result element cleared.');

        // Store the API key, state, and city in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('state', state);
        sessionStorage.setItem('city', city);

        console.log('DEBUG: Values stored in sessionStorage.');

        // First, get weather data from Open-Meteo API
        // Note: Replace with actual coordinates for the city and state
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

        console.log('DEBUG: Open-Meteo API URL:', openMeteoUrl);

        fetch(openMeteoUrl)
            .then(response => {
                console.log('DEBUG: Open-Meteo API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('DEBUG: Open-Meteo weather data received:', data);
                // Here you would typically process the weather data and send it to the Mistral API
                // For now, we'll just display the weather data
                predictionResultElement.innerHTML = `<p>Weather data for ${city}, ${state}: ${JSON.stringify(data)}</p>`;
                console.log('DEBUG: Weather data displayed in prediction result element.');

                // Log the user's input for the AI to see after the API call is completed
                console.log('DEBUG: User Input:', { state, city });

                // Make API call to Mistral AI Studio
                const mistralUrl = 'https://api.mistral.ai/v1/chat/completions';
                console.log('DEBUG: Mistral API URL:', mistralUrl);

                const mistralData = {
                    model: 'mistral-tiny',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: `What is the weather like in ${city}, ${state}?` }
                    ]
                };

                console.log('DEBUG: Mistral API request data:', mistralData);

                fetch(mistralUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(mistralData)
                })
                .then(response => {
                    console.log('DEBUG: Mistral API response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('DEBUG: Mistral API response data:', data);
                    predictionResultElement.innerHTML += `<p>Mistral API response: ${JSON.stringify(data)}</p>`;
                    console.log('DEBUG: Mistral API response displayed in prediction result element.');
                })
                .catch(error => {
                    console.error('DEBUG: Error calling Mistral API:', error);
                    predictionResultElement.innerHTML += `<p>Error calling Mistral API: ${error.message}</p>`;
                    console.log('DEBUG: Mistral API error displayed in prediction result element.');
                });
            })
            .catch(error => {
                console.error('DEBUG: Error fetching weather data:', error);
                predictionResultElement.innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
                console.log('DEBUG: Weather data error displayed in prediction result element.');
            })
            .finally(() => {
                // Hide loading animation
                loadingElement.style.display = 'none';
                console.log('DEBUG: Loading animation hidden.');
            });
    } else {
        console.error('DEBUG: Missing required values. Alert shown to user.');
        alert('Please enter your state, city, and API key.');
    }
});