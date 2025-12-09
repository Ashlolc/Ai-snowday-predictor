console.log('%c🔥 Prediction.js V8.0 - Day Navigation + Better Formatting', 'color: #667eea; font-weight: bold; font-size: 14px;');

let currentProgress = 0;
let currentStep = 1;
let timeoutHandle;
let animationInterval;
let errorLog = [];
let allDaysData = [];
let currentDayIndex = 0;

const TIMEOUT_MS = 45000;

function logError(message) {
    errorLog.push(message);
    console.error(`%c❌ ${message}`, 'color: #ff6b6b; font-weight: bold;');
}

function logSuccess(message) {
    console.log(`%c✓ ${message}`, 'color: #667eea; font-weight: bold;');
}

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

async function getCoordinates(city, state) {
    logSuccess(`Geocoding: ${city}, ${state}`);
    setProgress(20, 1, '📍 Locating your city...');
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&admin1=${encodeURIComponent(state)}&country=US&count=1&language=en&format=json`;
        
        const response = await fetch(geoUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            logError(`Geocoding API returned ${response.status}: ${errorText}`);
            throw new Error(`Geocoding failed (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        
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

async function getWeatherData(latitude, longitude) {
    logSuccess(`Fetching weather for (${latitude}, ${longitude})`);
    setProgress(45, 2, '☁️ Downloading 7-day forecast...');
    animateProgressToMax();
    
    try {
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

async function analyzeSnowDayChance(city, state, weatherData, apiKey) {
    logSuccess(`Starting Mistral LARGE AI analysis`);
    setProgress(70, 3, '🧠 Mistral LARGE reasoning through scenarios...');
    animateProgressToMax();
    
    try {
        const weatherSummary = [];
        for (let i = 0; i < 7; i++) {
            weatherSummary.push({
                day: i + 1,
                date: weatherData.daily.time[i],
                maxTemp: Math.round(weatherData.daily.temperature_2m_max[i]) + '°F',
                minTemp: Math.round(weatherData.daily.temperature_2m_min[i]) + '°F',
                precipitation: weatherData.daily.precipitation_sum[i].toFixed(2) + '"',
                snowfall: weatherData.daily.snowfall_sum[i].toFixed(2) + '"',
                windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[i]) + ' mph'
            });
        }
        
        logSuccess(`Weather summary prepared for Mistral LARGE`);
        
        const prompt = `You are an expert school district meteorologist. Analyze this 7-day forecast for ${city}, ${state}:

${JSON.stringify(weatherSummary, null, 2)}

For EACH day, provide:
- **Day X (Date): [Detailed 3-5 sentence analysis]**
  🚫 Closure Probability: X%
  ⏰ Delay Probability: X%
  🏫 Early Dismissal: X%
  🌨️ Key Factors: [Temperature, snowfall, wind, timing]

Then provide overall summary at bottom.`;
        
        const requestBody = {
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: 'You are a professional school weather analyst. Provide detailed, day-by-day analysis.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2500
        };
        
        logSuccess(`Calling Mistral LARGE API`);
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
            logError(`Invalid Mistral API response`);
            throw new Error(`Mistral API returned invalid response`);
        }
        
        const analysis = data.choices[0].message.content;
        logSuccess(`Mistral LARGE analysis complete!`);
        setProgress(95, 3, `✓ Analysis complete!`);
        return analysis;
    } catch (error) {
        logError(`AI error: ${error.message}`);
        throw new Error(`🤖 AI Error: ${error.message}`);
    }
}

function formatAnalysisForDay(fullAnalysis, dayNumber) {
    const lines = fullAnalysis.split('\n');
    let dayContent = [];
    let inCurrentDay = false;
    
    for (let line of lines) {
        if (line.includes(`Day ${dayNumber}`) || line.includes(`Day ${dayNumber}`) ) {
            inCurrentDay = true;
        } else if (inCurrentDay && line.includes('Day') && !line.includes(`Day ${dayNumber}`)) {
            break;
        }
        
        if (inCurrentDay) {
            dayContent.push(line);
        }
    }
    
    return dayContent.join('\n') || `See full analysis for Day ${dayNumber}`;
}

function showPreviousDay() {
    if (currentDayIndex > 0) {
        currentDayIndex--;
        updateDayDisplay();
    }
}

function showNextDay() {
    const forecastType = sessionStorage.getItem('forecastType');
    const maxDays = forecastType === '1day' ? 1 : 7;
    
    if (currentDayIndex < maxDays - 1) {
        currentDayIndex++;
        updateDayDisplay();
    }
}

function updateDayDisplay() {
    const forecastType = sessionStorage.getItem('forecastType');
    const maxDays = forecastType === '1day' ? 1 : 7;
    
    if (maxDays === 1) {
        document.getElementById('dayNavigation').style.display = 'none';
        return;
    }
    
    const dayData = allDaysData[currentDayIndex];
    const predictionResult = document.getElementById('predictionResult');
    
    predictionResult.innerHTML = `
        <div class="result-box">
            <h2>🚫 Day ${currentDayIndex + 1} - ${dayData.date}</h2>
            <p style="color: #667eea; font-weight: 600;">${dayData.date}</p>
            <hr>
            <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">${escapeHtml(dayData.analysis)}</div>
            <hr>
            <div style="margin-top: 15px; font-size: 0.9em; color: #999;">
                <p>📚 High: ${dayData.maxTemp} | Low: ${dayData.minTemp}</p>
                <p>🌧️ Precipitation: ${dayData.precipitation} | Snowfall: ${dayData.snowfall}</p>
                <p>🌬 Wind: ${dayData.windSpeed}</p>
            </div>
        </div>
    `;
    
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const dayIndicator = document.getElementById('dayIndicator');
    
    prevBtn.disabled = currentDayIndex === 0;
    nextBtn.disabled = currentDayIndex === maxDays - 1;
    dayIndicator.textContent = `Day ${currentDayIndex + 1} of ${maxDays}`;
}

document.addEventListener('DOMContentLoaded', async function() {
    logSuccess('Prediction page loaded - MISTRAL LARGE VERSION');
    
    const apiKey = sessionStorage.getItem('mistralApiKey');
    const state = sessionStorage.getItem('state');
    const city = sessionStorage.getItem('city');
    const location = sessionStorage.getItem('location');
    const forecastType = sessionStorage.getItem('forecastType') || '7day';
    
    const loadingSection = document.getElementById('loadingSection');
    const predictionResult = document.getElementById('predictionResult');
    const locationDisplay = document.getElementById('locationDisplay');
    const forecastTypeDisplay = document.getElementById('forecastTypeDisplay');
    
    forecastTypeDisplay.textContent = forecastType === '1day' ? '📅 Tomorrow Only' : '📅 Full Week Forecast';
    
    if (!apiKey || !location || !state || !city) {
        logError('Missing required data');
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
        return;
    }
    
    locationDisplay.innerHTML = `<p style="font-size: 1.1em; color: #667eea; font-weight: 600;">📍 ${location}</p>`;
    
    timeoutHandle = setTimeout(() => {
        logError('TIMEOUT: Analysis exceeded 45 seconds');
        stopProgressAnimation();
        updateProgressBar(100);
        
        if (loadingSection) loadingSection.style.display = 'none';
        
        predictionResult.innerHTML = `
            <div class="error-box">
                <h3>⏰ Request Timeout (45s)</h3>
                <p>The analysis took too long. Mistral LARGE provides deeper reasoning which takes time.</p>
                <details style="margin-top: 15px; background: #fff; padding: 10px; border-radius: 6px;">
                    <summary style="cursor: pointer; font-weight: 600;">🐛 Error Log</summary>
                    <pre style="margin-top: 10px; font-size: 0.85em; color: #666;">${errorLog.join('\n')}</pre>
                </details>
                <button class="nav-button" style="margin-top: 15px;" onclick="window.location.href='index.html'">← Try Again</button>
            </div>
        `;
    }, TIMEOUT_MS);
    
    try {
        logSuccess('Starting prediction workflow');
        setProgress(10, 1, '🙋 Initializing...');
        
        const coordinates = await getCoordinates(city, state);
        const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
        
        stopProgressAnimation();
        const analysis = await analyzeSnowDayChance(city, state, weatherData, apiKey);
        
        clearTimeout(timeoutHandle);
        if (loadingSection) loadingSection.style.display = 'none';
        
        updateProgressBar(100);
        updateSteps(4);
        
        // Build day-by-day data
        for (let i = 0; i < 7; i++) {
            allDaysData.push({
                date: weatherData.daily.time[i],
                maxTemp: Math.round(weatherData.daily.temperature_2m_max[i]) + '°F',
                minTemp: Math.round(weatherData.daily.temperature_2m_min[i]) + '°F',
                precipitation: weatherData.daily.precipitation_sum[i].toFixed(2) + '"',
                snowfall: weatherData.daily.snowfall_sum[i].toFixed(2) + '"',
                windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[i]) + ' mph',
                analysis: formatAnalysisForDay(analysis, i + 1)
            });
        }
        
        currentDayIndex = 0;
        
        if (forecastType === '7day') {
            document.getElementById('dayNavigation').style.display = 'flex';
            updateDayDisplay();
        } else {
            // 1-day mode - show only tomorrow
            const tomorrow = allDaysData[0];
            predictionResult.innerHTML = `
                <div class="result-box">
                    <h2>❄️ Tomorrow's Snow Day Prediction</h2>
                    <p style="color: #667eea; font-weight: 600;">${tomorrow.date}</p>
                    <hr>
                    <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">${escapeHtml(tomorrow.analysis)}</div>
                    <hr>
                    <div style="margin-top: 15px; font-size: 0.9em; color: #999;">
                        <p>📚 High: ${tomorrow.maxTemp} | Low: ${tomorrow.minTemp}</p>
                        <p>🌧️ Precipitation: ${tomorrow.precipitation} | Snowfall: ${tomorrow.snowfall}</p>
                        <p>🌬 Wind: ${tomorrow.windSpeed}</p>
                    </div>
                </div>
            `;
        }
        
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
                    <li>🌐 Internet working</li>
                    <li>📋 API not rate-limited</li>
                </ul>
                <details style="margin-top: 15px; background: #fff; padding: 10px; border-radius: 6px;">
                    <summary style="cursor: pointer; font-weight: 600;">🐛 Full Error Log</summary>
                    <pre style="margin-top: 10px; font-size: 0.85em; color: #666;">${errorLog.join('\n')}</pre>
                </details>
                <button class="nav-button" style="margin-top: 15px;" onclick="window.location.href='index.html'">← Try Again</button>
            </div>
        `;
    }
});

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
