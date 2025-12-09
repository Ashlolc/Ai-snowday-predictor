console.log('%c🔥 Prediction.js loaded - Version 6.0 Professional Redesign', 'color: #667eea; font-weight: bold; font-size: 14px;');

// Progress tracking
let currentProgress = 0;
let currentStep = 1;
let timeoutHandle;
let animationInterval;

const TIMEOUT_MS = 30000; // 30 seconds

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

    // Animate to target progress
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
    // Update completed steps
    for (let i = 1; i < activeStep; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }
    
    // Update active step
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
    console.log(`%c📍 Geocoding: ${city}, ${state}`, 'color: #667eea;');
    setProgress(20, 1, '📍 Locating your city...');
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=United%20States&count=1&language=en&format=json`;
        
        const response = await fetch(geoUrl);
        if (!response.ok) throw new Error(`Geocoding API error: ${response.status}`);
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const coordinates = {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                state: result.admin1,
                country: result.country
            };
            console.log(`%c✓ Coordinates found: (${coordinates.latitude}, ${coordinates.longitude})`, 'color: #667eea;');
            setProgress(30, 1, `✓ Found ${result.name}!`);
            return coordinates;
        } else {
            throw new Error(`No coordinates found for ${city}, ${state}`);
        }
    } catch (error) {
        console.error(`%c❌ Geocoding error: ${error.message}`, 'color: #ff6b6b;');
        throw error;
    }
}

// Weather API call
async function getWeatherData(latitude, longitude) {
    console.log(`%c☁️ Fetching weather for (${latitude}, ${longitude})`, 'color: #667eea;');
    setProgress(45, 2, '☁️ Downloading 7-day forecast...');
    animateProgressToMax();
    
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall,wind_speed_10m_max&timezone=auto&forecast_days=7`;
        
        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
        
        const data = await response.json();
        console.log(`%c✓ Weather data received (7 days)`, 'color: #667eea;');
        setProgress(60, 2, `✓ Weather data ready!`);
        return data;
    } catch (error) {
        console.error(`%c❌ Weather error: ${error.message}`, 'color: #ff6b6b;');
        throw error;
    }
}

// AI Analysis
async function analyzeSnowDayChance(city, state, weatherData, apiKey) {
    console.log(`%c🤖 Analyzing with Mistral AI...`, 'color: #667eea;');
    setProgress(70, 3, '🤖 Sending weather data to Mistral AI...');
    animateProgressToMax();
    
    try {
        const weatherSummary = weatherData.daily.weather_code
            .slice(0, 7)
            .map((code, index) => ({
                day: index + 1,
                date: weatherData.daily.time[index],
                weatherCode: code,
                maxTemp: weatherData.daily.temperature_2m_max[index],
                minTemp: weatherData.daily.temperature_2m_min[index],
                precipitation: weatherData.daily.precipitation_sum[index],
                snowfall: weatherData.daily.snowfall[index],
                windSpeed: weatherData.daily.wind_speed_10m_max[index]
            }));
        
        const prompt = `You are an expert meteorologist and snow day prediction specialist. Analyze this detailed 7-day weather forecast for ${city}, ${state} and provide a comprehensive snow day prediction.

Weather Forecast:
${JSON.stringify(weatherSummary, null, 2)}

Provide a detailed analysis including:
1. **Snow Day Probability**: Percentage chance (0-100%) of school closure due to snow in next 7 days
2. **Most Likely Day**: Which day is most probable for snow conditions
3. **Weather Analysis**: Detailed reasoning based on temperatures, precipitation, snowfall, and wind
4. **Key Factors**: Specific conditions that would trigger school closure (snow accumulation, ice, visibility)
5. **Confidence Level**: How confident you are in this prediction

Be specific, use the actual data provided, and format clearly.`;
        
        const requestBody = {
            model: 'mistral-small-latest',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a professional weather forecaster specializing in snow day predictions for schools. Provide detailed, data-driven analysis.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 800
        };
        
        console.log(`%c💮 Request prepared, calling Mistral API...`, 'color: #667eea;');
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
            const errorData = await response.text();
            throw new Error(`Mistral API error ${response.status}: ${errorData}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid response from Mistral API');
        }
        
        const analysis = data.choices[0].message.content;
        console.log(`%c✓ AI analysis complete!`, 'color: #667eea;');
        setProgress(95, 3, `✓ Analysis complete!`);
        return analysis;
    } catch (error) {
        console.error(`%c❌ AI error: ${error.message}`, 'color: #ff6b6b;');
        throw error;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    console.log('%c🚀 Prediction page loaded', 'color: #667eea; font-weight: bold;');
    
    const apiKey = sessionStorage.getItem('mistralApiKey');
    const state = sessionStorage.getItem('state');
    const city = sessionStorage.getItem('city');
    const location = sessionStorage.getItem('location');
    
    const loadingSection = document.getElementById('loadingSection');
    const predictionResult = document.getElementById('predictionResult');
    const locationDisplay = document.getElementById('locationDisplay');
    
    // Validation
    if (!apiKey || !location || !state || !city) {
        console.error('%c❌ Missing required data', 'color: #ff6b6b; font-weight: bold;');
        clearTimeout(timeoutHandle);
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
        return;
    }
    
    locationDisplay.innerHTML = `<p style="font-size: 1.1em; color: #667eea; font-weight: 600;">📍 ${location}</p>`;
    
    // Set timeout
    timeoutHandle = setTimeout(() => {
        console.error('%c❌ TIMEOUT: Analysis exceeded 30 seconds', 'color: #ff6b6b; font-weight: bold;');
        stopProgressAnimation();
        updateProgressBar(100);
        
        if (loadingSection) loadingSection.style.display = 'none';
        
        predictionResult.innerHTML = `
            <div class="error-box">
                <h3>⏰ Request Timeout</h3>
                <p>The prediction analysis took longer than 30 seconds.</p>
                <p><strong>Common causes:</strong></p>
                <ul>
                    <li>🚫 Mistral API is slow or unresponsive</li>
                    <li>🌐 Slow internet connection</li>
                    <li>🔑 Invalid or rate-limited API key</li>
                    <li>📋 API quota exceeded</li>
                </ul>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
                <p style="color: #999; font-size: 0.85em; margin-top: 15px;">Press F12 and check Console for details.</p>
            </div>
        `;
    }, TIMEOUT_MS);
    
    try {
        console.log('%c🚀 Starting prediction workflow...', 'color: #667eea; font-weight: bold;');
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
                <h2>❄️ Snow Day Analysis</h2>
                <p style="color: #667eea; font-weight: 600; font-size: 1.05em;">${city}, ${state}</p>
                <hr>
                <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">${escapeHtml(analysis)}</div>
                <hr>
                <p style="color: #999; font-size: 0.9em; margin-top: 15px;">
                    📚 Data Sources: Open-Meteo API | 🤖 Analysis: Mistral AI<br>
                    📍 Location: ${coordinates.name}, ${coordinates.state}
                </p>
            </div>
        `;
        
        console.log('%c✓ Prediction complete and displayed!', 'color: #667eea; font-weight: bold; font-size: 14px;');
        
    } catch (error) {
        console.error(`%c❌ Error: ${error.message}`, 'color: #ff6b6b; font-weight: bold;');
        stopProgressAnimation();
        clearTimeout(timeoutHandle);
        
        if (loadingSection) loadingSection.style.display = 'none';
        
        predictionResult.innerHTML = `
            <div class="error-box">
                <h3>❌ Prediction Failed</h3>
                <p><strong>Error:</strong> ${escapeHtml(error.message)}</p>
                <p><strong>Troubleshooting:</strong></p>
                <ul>
                    <li>🔑 Verify API key at console.mistral.ai</li>
                    <li>📍 Ensure city is selected from dropdown</li>
                    <li>🚫 Check if API quota/rate limit exceeded</li>
                    <li>🌐 Verify internet connection</li>
                </ul>
                <p style="margin-top: 15px;">
                    <button class="back-button" onclick="window.location.href='index.html'">← Try Again</button>
                </p>
                <p style="color: #999; font-size: 0.85em; margin-top: 15px;">Debug info: Press F12 → Console for full error details.</p>
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
