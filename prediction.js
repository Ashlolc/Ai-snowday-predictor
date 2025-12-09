console.log('DEBUG: Prediction.js loaded - Version 5.0');

// Progress tracking variables
let progressInterval;
let currentProgress = 0;
let timeoutHandle;

// Update progress bar
function updateProgress(newProgress, statusMessage) {
    currentProgress = Math.min(newProgress, 99);
    const progressFill = document.getElementById('progressFill');
    const statusText = document.getElementById('statusText');
    
    if (progressFill) {
        progressFill.style.width = currentProgress + '%';
        progressFill.textContent = currentProgress + '%';
    }
    
    if (statusText && statusMessage) {
        statusText.textContent = statusMessage;
    }
    
    console.log('DEBUG: Progress updated to', currentProgress + '%', '-', statusMessage);
}

// Start animated progress (for long-running operations)
function startAnimatedProgress() {
    console.log('DEBUG: Starting animated progress...');
    progressInterval = setInterval(() => {
        if (currentProgress < 90) {
            currentProgress += Math.random() * 10;
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = Math.min(currentProgress, 90) + '%';
                progressFill.textContent = Math.floor(Math.min(currentProgress, 90)) + '%';
            }
        }
    }, 800);
}

// Stop animated progress
function stopAnimatedProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Function to geocode city/state to coordinates
async function getCoordinates(city, state) {
    console.log('DEBUG: Starting geocoding for:', city, state);
    updateProgress(15, '📍 Locating your city...');
    
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
            updateProgress(25, '✓ Location found! Fetching weather data...');
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
    updateProgress(40, '☁️ Downloading weather forecast...');
    
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
        updateProgress(60, '✓ Weather data received! Analyzing with AI...');
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
    updateProgress(70, '🤖 Sending data to Mistral AI...');
    
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
        updateProgress(80, '⏳ Waiting for AI analysis...');
        
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
        updateProgress(95, '✓ Analysis complete!');
        
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
    
    const loadingSection = document.getElementById('loadingSection');
    const predictionResultElement = document.getElementById('predictionResult');
    const locationDisplay = document.getElementById('locationDisplay');
    
    console.log('DEBUG: Retrieved from sessionStorage:');
    console.log('  - Location:', location);
    console.log('DEBUG: Starting 30-second timeout...');
    
    // Set 30-second timeout
    timeoutHandle = setTimeout(() => {
        console.error('DEBUG: TIMEOUT - Prediction took longer than 30 seconds!');
        stopAnimatedProgress();
        
        if (loadingSection) {
            loadingSection.style.display = 'none';
        }
        
        predictionResultElement.innerHTML = `
            <div class="error-box">
                <h3>⏰ Timeout Error</h3>
                <p><strong>The prediction took too long (30+ seconds).</strong></p>
                <p>This usually happens when:</p>
                <ul style="text-align: left; color: #666; font-size: 0.9em;">
                    <li>🚫 Mistral API is slow or not responding</li>
                    <li>🌐 Your internet connection is slow</li>
                    <li>🔑 Your API key might be invalid</li>
                    <li>📋 API rate limit exceeded - wait a minute</li>
                </ul>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
                <p style="color: #999; font-size: 0.85em; margin-top: 15px;">Check console (F12) for detailed error logs.</p>
            </div>
        `;
    }, 30000); // 30 seconds
    
    if (!apiKey || !location || !state || !city) {
        console.error('DEBUG: Missing required data. Redirecting to index.html');
        clearTimeout(timeoutHandle);
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Display location
    locationDisplay.innerHTML = `<p style="font-size: 1.1em; color: #667eea;"><strong>${location}</strong></p>`;
    
    // Start initial progress
    updateProgress(5, 'Starting analysis...');
    startAnimatedProgress();
    
    try {
        console.log('DEBUG: Starting prediction analysis flow...');
        
        // Step 1: Get coordinates
        console.log('DEBUG: Step 1 - Getting coordinates...');
        const coordinates = await getCoordinates(city, state);
        
        // Step 2: Get weather data
        console.log('DEBUG: Step 2 - Getting weather data...');
        const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
        
        // Step 3: Analyze with Mistral AI
        console.log('DEBUG: Step 3 - Analyzing with Mistral AI for snow day prediction...');
        stopAnimatedProgress();
        const analysis = await analyzeSnowDayChance(city, state, weatherData, apiKey);
        
        // Clear timeout since we completed successfully
        clearTimeout(timeoutHandle);
        
        // Hide loading section
        if (loadingSection) {
            loadingSection.style.display = 'none';
        }
        
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
        stopAnimatedProgress();
        clearTimeout(timeoutHandle);
        
        // Hide loading section
        if (loadingSection) {
            loadingSection.style.display = 'none';
        }
        
        predictionResultElement.innerHTML = `
            <div class="error-box">
                <h3>❌ Error</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <p style="color: #666; font-size: 0.9em; margin-top: 15px;">Check the browser console (F12) for detailed debugging information.</p>
                <p style="color: #666; font-size: 0.85em;">Common issues:</p>
                <ul style="text-align: left; color: #666; font-size: 0.9em;">
                    <li>❌ Invalid API key - check console.mistral.ai</li>
                    <li>❌ City/State not found - try selecting from dropdown</li>
                    <li>❌ API rate limit - wait a minute and try again</li>
                    <li>❌ No internet connection</li>
                </ul>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
            </div>
        `;
    }
});
