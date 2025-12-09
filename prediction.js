console.log('DEBUG: Prediction.js loaded - Version 4.0');

// Function to geocode city/state to coordinates
async function getCoordinates(city, state) {
    console.log('DEBUG: Starting geocoding for:', city, state);
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&state=${state}&country=United%20States&count=1&language=en&format=json`;
        console.log('DEBUG: Geocoding API URL:', geoUrl);
        
        const response = await fetch(geoUrl);
        console.log('DEBUG: Geocoding API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('DEBUG: Geocoding API data:', data);
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const coordinates = {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                state: result.admin1,
                country: result.country
            };
            console.log('DEBUG: Coordinates found:', coordinates);
            return coordinates;
        } else {
            throw new Error(`No results found for ${city}, ${state}`);
        }
    } catch (error) {
        console.error('DEBUG: Geocoding error:', error);
        throw error;
    }
}

// Function to get weather data from Open-Meteo
async function getWeatherData(latitude, longitude) {
    console.log('DEBUG: Fetching weather data for coordinates:', latitude, longitude);
    
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall&timezone=auto&forecast_days=7`;
        console.log('DEBUG: Weather API URL:', weatherUrl);
        
        const response = await fetch(weatherUrl);
        console.log('DEBUG: Weather API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('DEBUG: Weather data received:', data);
        return data;
    } catch (error) {
        console.error('DEBUG: Weather fetch error:', error);
        throw error;
    }
}

// Function to call Mistral AI for snow day analysis
async function analyzeSnowDayChance(city, state, weatherData, apiKey) {
    console.log('DEBUG: Analyzing snow day chance with Mistral AI');
    console.log('DEBUG: City:', city, 'State:', state);
    console.log('DEBUG: API Key length:', apiKey.length, 'characters');
    
    try {
        // Format weather data for AI analysis
        const weatherSummary = weatherData.daily.weather_code
            .slice(0, 7)
            .map((code, index) => ({
                day: index + 1,
                weatherCode: code,
                maxTemp: weatherData.daily.temperature_2m_max[index],
                minTemp: weatherData.daily.temperature_2m_min[index],
                precipitation: weatherData.daily.precipitation_sum[index],
                snowfall: weatherData.daily.snowfall[index]
            }));
        
        console.log('DEBUG: Weather summary for AI:', weatherSummary);
        
        const mistralUrl = 'https://api.mistral.ai/v1/chat/completions';
        console.log('DEBUG: Mistral API URL:', mistralUrl);
        
        const prompt = `You are a snow day prediction expert. Analyze this weather data for ${city}, ${state} and predict the chance of school closures due to snow.

Weather forecast (next 7 days):
${JSON.stringify(weatherSummary, null, 2)}

Provide:
1. A percentage chance (0-100%) of a snow day in the next 7 days
2. Which day is most likely
3. Brief reasoning based on temperature, precipitation, and snowfall data
4. What conditions would trigger a school closure

Be concise and specific.`;
        
        console.log('DEBUG: Prompt for Mistral:', prompt.substring(0, 200) + '...');
        
        const requestBody = {
            model: 'mistral-small-latest',
            messages: [
                { role: 'system', content: 'You are a helpful weather analysis expert for predicting snow days.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        };
        
        console.log('DEBUG: Mistral request prepared');
        
        const response = await fetch(mistralUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('DEBUG: Mistral API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('DEBUG: Mistral API error response:', errorData);
            throw new Error(`Mistral API error! status: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        console.log('DEBUG: Mistral AI response:', data);
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            throw new Error('Invalid response format from Mistral API');
        }
    } catch (error) {
        console.error('DEBUG: Mistral API error:', error);
        throw error;
    }
}

// Initialize prediction on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DEBUG: Prediction page DOMContentLoaded.');
    
    const apiKey = sessionStorage.getItem('mistralApiKey');
    const state = sessionStorage.getItem('state');
    const city = sessionStorage.getItem('city');
    const location = sessionStorage.getItem('location');
    
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');
    const locationDisplay = document.getElementById('locationDisplay');
    
    console.log('DEBUG: Retrieved from sessionStorage:');
    console.log('  - Location:', location);
    console.log('  - State:', state);
    console.log('  - City:', city);
    console.log('  - API Key length:', apiKey ? apiKey.length : 'None');
    
    if (!apiKey || !location || !state || !city) {
        console.error('DEBUG: Missing required data. Redirecting to index.html');
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Display location
    locationDisplay.innerHTML = `<p style="font-size: 1.1em; color: #667eea;"><strong>${location}</strong></p>`;
    
    // Show loading state
    loadingElement.style.display = 'block';
    predictionResultElement.innerHTML = '<p>Loading... analyzing weather patterns...</p>';
    
    try {
        console.log('DEBUG: Starting prediction analysis flow...');
        
        // Step 1: Get coordinates
        console.log('DEBUG: Step 1 - Getting coordinates...');
        const coordinates = await getCoordinates(city, state);
        predictionResultElement.innerHTML = `<p>📍 Found ${coordinates.name}, ${coordinates.state}</p><p>Fetching weather data...</p>`;
        
        // Step 2: Get weather data
        console.log('DEBUG: Step 2 - Getting weather data...');
        const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
        predictionResultElement.innerHTML += `<p>📊 Weather data retrieved. Analyzing with AI...</p>`;
        
        // Step 3: Analyze with Mistral AI
        console.log('DEBUG: Step 3 - Analyzing with Mistral AI for snow day prediction...');
        const analysis = await analyzeSnowDayChance(city, state, weatherData, apiKey);
        
        // Display results
        predictionResultElement.innerHTML = `
            <div class="result-box">
                <h2>❄️ Snow Day Analysis for ${city}, ${state}</h2>
                <h3>AI Prediction:</h3>
                <p style="white-space: pre-wrap; line-height: 1.8; font-size: 1em;">${analysis}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 0.9em;">Location: ${coordinates.name}, ${coordinates.state}</p>
                <p style="color: #666; font-size: 0.85em;">Data: Open-Meteo Weather API | Analysis: Mistral AI</p>
            </div>
        `;
        console.log('DEBUG: Prediction results displayed successfully.');
        
    } catch (error) {
        console.error('DEBUG: Error in prediction flow:', error);
        predictionResultElement.innerHTML = `
            <div class="error-box">
                <h3>❌ Error</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <p style="color: #666; font-size: 0.9em; margin-top: 15px;">Check the browser console (F12) for detailed debugging information.</p>
                <p style="color: #666; font-size: 0.85em;">Common issues:</p>
                <ul style="text-align: left; color: #666; font-size: 0.9em;">
                    <li>Invalid API key - check console.mistral.ai</li>
                    <li>City/State not found - try selecting from dropdown</li>
                    <li>API rate limit - wait a minute and try again</li>
                </ul>
            </div>
        `;
    } finally {
        // Hide loading animation
        loadingElement.style.display = 'none';
        console.log('DEBUG: Prediction page analysis complete.');
    }
});
