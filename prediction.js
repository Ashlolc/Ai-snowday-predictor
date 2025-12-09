console.log('%c🔥 Prediction.js loaded - Version 6.2 Enhanced with Delay/Early Dismissal', 'color: #667eea; font-weight: bold; font-size: 14px;');

// Progress tracking
let currentProgress = 0;
let currentStep = 1;
let timeoutHandle;
let animationInterval;
let errorLog = [];

const TIMEOUT_MS = 30000; // 30 seconds

// Add visible error logging
function logError(message) {
    errorLog.push(message);
    console.error(`%c❌ ${message}`, 'color: #ff6b6b; font-weight: bold;');
}

function logSuccess(message) {
    console.log(`%c✓ ${message}`, 'color: #667eea; font-weight: bold;');
}

// Smooth progress animation
function setProgress(targetProgress, step = null, message = null) {
    if (step) {
        currentStep = step;
        updateSteps(step);
    }
    
    if (message) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = message;
        }
        console.log(`%c📊 ${message} (${targetProgress}%)`, 'color: #667eea; font-weight: bold;');
    }

    const increment = (targetProgress - currentProgress) / 20;
    let currentValue = currentProgress;
    
    const progressInterval = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= targetProgress) || (increment < 0 && currentValue <= targetProgress)) {
            currentValue = targetProgress;
            clearInterval(progressInterval);
        }
        updateProgressBar(Math.round(currentValue));
    }, 50);
}

function updateProgressBar(percent) {
    currentProgress = Math.min(Math.max(percent, 0), 99);
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = currentProgress + '%';
        progressFill.textContent = currentProgress + '%';
    }
}

function updateSteps(activeStep) {
    for (let i = 1; i < activeStep; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }
    
    const currentStepEl = document.getElementById(`step-${activeStep}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('completed');
        currentStepEl.classList.add('active');
    }
}

function animateProgressToMax() {
    if (animationInterval) clearInterval(animationInterval);
    
    animationInterval = setInterval(() => {
        if (currentProgress < 90) {
            const nextProgress = currentProgress + Math.random() * 5;
            updateProgressBar(Math.min(nextProgress, 90));
        }
    }, 400);
}

function stopProgressAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}

// Geocode API call
async function getCoordinates(city, state) {
    logSuccess(`Geocoding: ${city}, ${state}`);
    setProgress(20, 1, '📍 Locating your city...');
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&admin1=${encodeURIComponent(state)}&country=US&count=1&language=en&format=json`;
        logSuccess(`Geocoding URL: ${geoUrl}`);
        
        const response = await fetch(geoUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            logError(`Geocoding API returned ${response.status}: ${errorText}`);
            throw new Error(`Geocoding failed (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        logSuccess(`Geocoding response received`);
        
        if (!data.results || data.results.length === 0) {
            logError(`No results found for ${city}, ${state}`);
            throw new Error(`Could not find coordinates for ${city}, ${state}`);
        }
        
        const result = data.results[0];
        const coordinates = {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            state: result.admin1 || state,
            country: result.country
        };
        
        logSuccess(`Found coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
        setProgress(30, 1, `✓ Found ${result.name}!`);
        return coordinates;
    } catch (error) {
        logError(`Geocoding error: ${error.message}`);
        throw new Error(`📍 Location Error: ${error.message}`);
    }
}

// Weather API call with better error handling
async function getWeatherData(latitude, longitude) {
    logSuccess(`Fetching weather for (${latitude}, ${longitude})`);
    setProgress(45, 2, '☁️ Downloading 7-day forecast...');
    animateProgressToMax();
    
    try {
        // Round coordinates to 4 decimal places
        const lat = parseFloat(latitude).toFixed(4);
        const lon = parseFloat(longitude).toFixed(4);
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago&forecast_days=7`;
        
        logSuccess(`Weather API URL: ${weatherUrl}`);
        
        const response = await fetch(weatherUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            logError(`Weather API returned ${response.status}: ${errorText}`);
            throw new Error(`Weather API failed (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.daily) {
            logError(`Invalid weather data structure received`);
            throw new Error(`Weather API returned invalid data`);
        }
        
        logSuccess(`Weather data received for 7 days`);
        setProgress(60, 2, `✓ Weather data ready!`);
        return data;
    } catch (error) {
        logError(`Weather error: ${error.message}`);
        throw new Error(`☁️ Weather Error: ${error.message}`);
    }
}

// AI Analysis with 2-hour delay and early dismissal predictions
async function analyzeSnowDayChance(city, state, weatherData, apiKey) {
    logSuccess(`Starting Mistral AI analysis`);
    setProgress(70, 3, '🤖 Sending weather data to Mistral AI...');
    animateProgressToMax();
    
    try {
        const weatherSummary = [];
        for (let i = 0; i < 7; i++) {
            weatherSummary.push({
                day: i + 1,
                date: weatherData.daily.time[i],
                maxTemp: weatherData.daily.temperature_2m_max[i] + '°F',
                minTemp: weatherData.daily.temperature_2m_min[i] + '°F',
                precipitation: weatherData.daily.precipitation_sum[i] + ' inches',
                snowfall: weatherData.daily.snowfall_sum[i] + ' inches',
                windSpeed: weatherData.daily.wind_speed_10m_max[i] + ' mph'
            });
        }
        
        logSuccess(`Weather summary prepared for AI`);
        
        const prompt = `You are an expert school district meteorologist specializing in closure and delay decisions. Analyze this 7-day forecast for ${city}, ${state}:

${JSON.stringify(weatherSummary, null, 2)}

Provide a COMPREHENSIVE analysis with these EXACT sections:

## 🚫 FULL SNOW DAY
- **Probability**: [0-100%]
- **Most Likely Day**: [Which day and date]
- **Reasoning**: [Why full closure would happen]

## ⏰ 2-HOUR DELAY
- **Probability**: [0-100%]
- **Most Likely Day**: [Which day and date]
- **Reasoning**: [Why 2-hour delay would happen - consider morning conditions, ice on roads, visibility]

## 🏫 EARLY DISMISSAL (2-HOUR EARLY)
- **Probability**: [0-100%]
- **Most Likely Day**: [Which day and date]
- **Reasoning**: [Why early dismissal would happen - consider afternoon storms, deteriorating conditions]

## 🌨️ WEATHER ANALYSIS
- Key factors: temperature trends, snowfall accumulation, wind conditions
- Most concerning day and why
- Road condition predictions (ice, snow depth, visibility)

## 📊 DECISION FACTORS
- Snow accumulation thresholds (2-hour delay: 2-4", full closure: 6+")
- Ice/freezing rain impact
- Visibility concerns
- Wind chill and safety

## 🎯 CONFIDENCE LEVEL
[Low/Medium/High] - Explain why

Be specific, data-driven, and realistic for Minnesota winter conditions.`;
        
        const requestBody = {
            model: 'mistral-small-latest',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a professional school district weather analyst who makes recommendations for closures, delays, and early dismissals. Be thorough and consider all scenarios.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 1200
        };
        
        logSuccess(`Calling Mistral API with model: mistral-small-latest`);
        setProgress(75, 3, `⏳ Waiting for AI analysis...`);
        
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            logError(`Mistral API returned ${response.status}: ${errorText}`);
            
            if (response.status === 401) {
                throw new Error(`Invalid API key. Get a new key from console.mistral.ai`);
            } else if (response.status === 429) {
                throw new Error(`Rate limit exceeded. Wait a minute and try again.`);
            } else {
                throw new Error(`Mistral API error (HTTP ${response.status})`);
            }
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            logError(`Invalid Mistral API response structure`);
            throw new Error(`Mistral API returned invalid response`);
        }
        
        const analysis = data.choices[0].message.content;
        logSuccess(`AI analysis complete!`);
        setProgress(95, 3, `✓ Analysis complete!`);
        return analysis;
    } catch (error) {
        logError(`AI error: ${error.message}`);
        throw new Error(`🤖 AI Error: ${error.message}`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    logSuccess('Prediction page loaded');
    
    const apiKey = sessionStorage.getItem('mistralApiKey');
    const state = sessionStorage.getItem('state');
    const city = sessionStorage.getItem('city');
    const location = sessionStorage.getItem('location');
    
    const loadingSection = document.getElementById('loadingSection');
    const predictionResult = document.getElementById('predictionResult');
    const locationDisplay = document.getElementById('locationDisplay');
    
    // Validation
    if (!apiKey || !location || !state || !city) {
        logError('Missing required data from previous page');
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
        return;
    }
    
    logSuccess(`Location: ${location}`);
    logSuccess(`API Key length: ${apiKey.length} characters`);
    locationDisplay.innerHTML = `<p style="font-size: 1.1em; color: #667eea; font-weight: 600;">📍 ${location}</p>`;
    
    // Set timeout
    timeoutHandle = setTimeout(() => {
        logError('TIMEOUT: Analysis exceeded 30 seconds');
        stopProgressAnimation();
        updateProgressBar(100);
        
        if (loadingSection) loadingSection.style.display = 'none';
        
        predictionResult.innerHTML = `
            <div class="error-box">
                <h3>⏰ Request Timeout (30s)</h3>
                <p>The prediction took too long.</p>
                <p><strong>Possible causes:</strong></p>
                <ul>
                    <li>🚫 Mistral API is slow/down</li>
                    <li>🌐 Slow internet connection</li>
                    <li>🔑 API key rate limited</li>
                </ul>
                <details style="margin-top: 15px; background: #fff; padding: 10px; border-radius: 6px;">
                    <summary style="cursor: pointer; font-weight: 600;">🐛 Error Log (Click to expand)</summary>
                    <pre style="margin-top: 10px; font-size: 0.85em; color: #666; white-space: pre-wrap;">${errorLog.join('\n')}</pre>
                </details>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
            </div>
        `;
    }, TIMEOUT_MS);
    
    try {
        logSuccess('Starting prediction workflow');
        setProgress(10, 1, '🙋 Initializing...');
        
        // Step 1: Geocode
        const coordinates = await getCoordinates(city, state);
        
        // Step 2: Weather
        const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
        
        // Step 3: AI Analysis
        stopProgressAnimation();
        const analysis = await analyzeSnowDayChance(city, state, weatherData, apiKey);
        
        // Clear timeout
        clearTimeout(timeoutHandle);
        
        // Hide loading
        if (loadingSection) loadingSection.style.display = 'none';
        
        // Update progress to 100%
        updateProgressBar(100);
        updateSteps(4);
        
        // Display results
        predictionResult.innerHTML = `
            <div class="result-box">
                <h2>❄️ Snow Day & Delay Predictions</h2>
                <p style="color: #667eea; font-weight: 600; font-size: 1.05em;">${city}, ${state}</p>
                <hr>
                <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">${escapeHtml(analysis)}</div>
                <hr>
                <p style="color: #999; font-size: 0.9em; margin-top: 15px;">
                    📚 Data: Open-Meteo Weather API | 🤖 AI: Mistral (mistral-small-latest)<br>
                    📍 Location: ${coordinates.name}, ${coordinates.state}<br>
                    🎯 Analysis includes: Full closure, 2-hour delay, and early dismissal predictions
                </p>
            </div>
        `;
        
        logSuccess('Prediction complete!');
        
    } catch (error) {
        logError(`Final error: ${error.message}`);
        stopProgressAnimation();
        clearTimeout(timeoutHandle);
        
        if (loadingSection) loadingSection.style.display = 'none';
        
        predictionResult.innerHTML = `
            <div class="error-box">
                <h3>❌ Prediction Failed</h3>
                <p style="font-size: 1.1em; color: #ff6b6b; font-weight: 600;">${escapeHtml(error.message)}</p>
                <p><strong>What to check:</strong></p>
                <ul>
                    <li>🔑 API key valid at <a href="https://console.mistral.ai" target="_blank">console.mistral.ai</a></li>
                    <li>📍 City selected from dropdown</li>
                    <li>🌐 Internet connection working</li>
                    <li>📋 API not rate-limited</li>
                </ul>
                <details style="margin-top: 15px; background: #fff; padding: 10px; border-radius: 6px;">
                    <summary style="cursor: pointer; font-weight: 600;">🐛 Full Error Log (Click to expand)</summary>
                    <pre style="margin-top: 10px; font-size: 0.85em; color: #666; white-space: pre-wrap;">${errorLog.join('\n')}</pre>
                </details>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
            </div>
        `;
    }
});

// Utility to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
