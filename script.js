// US States and Major Cities Database
const statesAndCities = {
    "Alabama": ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa"],
    "Alaska": ["Anchorage", "Juneau", "Fairbanks", "Ketchikan", "Palmer"],
    "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Flagstaff"],
    "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Fresno"],
    "Colorado": ["Denver", "Colorado Springs", "Boulder", "Fort Collins", "Aspen"],
    "Connecticut": ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury"],
    "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
    "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "Key West"],
    "Georgia": ["Atlanta", "Augusta", "Savannah", "Athens", "Macon"],
    "Hawaii": ["Honolulu", "Hilo", "Kailua", "Kaneohe", "Waipahu"],
    "Idaho": ["Boise", "Pocatello", "Idaho Falls", "Nampa", "Coeur d'Alene"],
    "Illinois": ["Chicago", "Aurora", "Rockford", "Springfield", "Peoria"],
    "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Bloomington"],
    "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
    "Kansas": ["Kansas City", "Wichita", "Topeka", "Overland Park", "Lawrence"],
    "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Covington", "Owensboro"],
    "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
    "Maine": ["Portland", "Lewiston", "Bangor", "Auburn", "Augusta"],
    "Maryland": ["Baltimore", "Frederick", "Gaithersburg", "Bowie", "Annapolis"],
    "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge"],
    "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],
    "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Saint Cloud", "Sartell", "Mankato", "Bloomington"],
    "Mississippi": ["Jackson", "Gulfport", "Biloxi", "Meridian", "Hattiesburg"],
    "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia", "St. Joseph"],
    "Montana": ["Billings", "Missoula", "Great Falls", "Butte", "Helena"],
    "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
    "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Carson City"],
    "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Portsmouth"],
    "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton"],
    "New Mexico": ["Albuquerque", "Las Cruces", "Santa Fe", "Rio Rancho", "Roswell"],
    "New York": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
    "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
    "North Dakota": ["Bismarck", "Fargo", "Grand Forks", "Minot", "Williston"],
    "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
    "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"],
    "Oregon": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
    "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "Newport"],
    "South Carolina": ["Charleston", "Columbia", "Greenville", "Spartanburg", "Sumter"],
    "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Watertown", "Mitchell"],
    "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
    "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"],
    "Utah": ["Salt Lake City", "West Valley City", "Provo", "Ogden", "Sandy"],
    "Vermont": ["Burlington", "Rutland", "South Burlington", "Barre", "Montpelier"],
    "Virginia": ["Virginia Beach", "Richmond", "Arlington", "Alexandria", "Roanoke"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"],
    "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Wheeling", "Weirton"],
    "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Appleton"],
    "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"]
};

console.log('DEBUG: Script loaded - Version 2.0');

// Initialize dropdowns on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: DOMContentLoaded event fired.');
    
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');

    if (!stateSelect || !citySelect) {
        console.error('DEBUG: State or City select element not found!');
        return;
    }

    // Populate states
    Object.keys(statesAndCities).sort().forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    console.log('DEBUG: All 50 states populated in dropdown');

    // When state is selected, populate cities
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        console.log('DEBUG: State selected:', selectedState);
        
        // Clear city dropdown
        citySelect.innerHTML = '';
        
        if (selectedState) {
            // Enable city dropdown and populate with cities
            const cities = statesAndCities[selectedState];
            cities.sort().forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
            console.log('DEBUG: Cities populated for', selectedState, ':', cities);
        } else {
            // Reset city dropdown
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Choose a state first --';
            citySelect.appendChild(option);
            citySelect.disabled = true;
        }
    });

    // Check if elements exist
    if (!document.getElementById('submitKey')) {
        console.error('DEBUG: Submit button not found.');
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

// Function to geocode city/state to coordinates using OpenWeatherMap Geocoding API
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

// Function to get weather from Open-Meteo (free NOAA data)
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

// Function to call Mistral AI for reasoning
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

Be concise and specific.`;
        
        console.log('DEBUG: Prompt for Mistral:', prompt);
        
        const requestBody = {
            model: 'mistral-small-latest',
            messages: [
                { role: 'system', content: 'You are a helpful weather analysis expert.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        };
        
        console.log('DEBUG: Mistral request body:', JSON.stringify(requestBody).substring(0, 200) + '...');
        
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

// Main submit button handler
document.getElementById('submitKey').addEventListener('click', async function() {
    console.log('DEBUG: Submit button clicked.');

    const state = document.getElementById('state').value.trim();
    const city = document.getElementById('city').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');

    console.log('DEBUG: State value:', state);
    console.log('DEBUG: City value:', city);
    console.log('DEBUG: API key provided:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');

    // Validation
    if (!state || !city || !apiKey) {
        console.error('DEBUG: Missing required values.');
        alert('Please select your state, city, and enter your Mistral API key.');
        return;
    }

    try {
        // Show loading state
        loadingElement.style.display = 'block';
        predictionResultElement.innerHTML = '<p>Loading... analyzing weather patterns...</p>';
        console.log('DEBUG: Loading state shown.');

        // Store values in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('state', state);
        sessionStorage.setItem('city', city);
        console.log('DEBUG: Values stored in sessionStorage.');

        // Step 1: Get coordinates from city/state
        console.log('DEBUG: Step 1 - Getting coordinates...');
        const coordinates = await getCoordinates(city, state);
        predictionResultElement.innerHTML = `<p>📍 Found ${coordinates.name}, ${coordinates.state}</p><p>Fetching weather data...</p>`;

        // Step 2: Get weather data
        console.log('DEBUG: Step 2 - Getting weather data...');
        const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
        predictionResultElement.innerHTML += `<p>📊 Weather data retrieved. Analyzing with AI...</p>`;

        // Step 3: Analyze with Mistral AI
        console.log('DEBUG: Step 3 - Analyzing with Mistral AI...');
        const analysis = await analyzeSnowDayChance(city, state, weatherData, apiKey);
        
        // Display results
        predictionResultElement.innerHTML = `
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h2>❄️ Snow Day Prediction for ${city}, ${state}</h2>
                <h3>AI Analysis:</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${analysis}</p>
                <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Location: ${coordinates.name}, ${coordinates.state}</p>
            </div>
        `;
        console.log('DEBUG: Prediction results displayed.');

    } catch (error) {
        console.error('DEBUG: Error in prediction flow:', error);
        predictionResultElement.innerHTML = `
            <div style="background: #ffcccc; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>❌ Error</h3>
                <p>${error.message}</p>
                <p style="color: #666; font-size: 0.9em; margin-top: 10px;">Check the browser console (F12) for detailed debugging information.</p>
            </div>
        `;
    } finally {
        // Hide loading animation
        loadingElement.style.display = 'none';
        console.log('DEBUG: Loading state hidden.');
    }
});
