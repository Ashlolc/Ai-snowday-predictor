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

console.log('%c🔥 Script loaded - Version 6.0 Complete Redesign', 'color: #667eea; font-weight: bold; font-size: 14px;');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c✓ DOMContentLoaded - Initializing', 'color: #667eea; font-weight: bold;');
    
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    const submitButton = document.getElementById('submitKey');
    const apiKeyInput = document.getElementById('apiKey');

    if (!stateSelect || !citySelect) {
        console.error('❌ State or City select element not found!');
        return;
    }

    // Populate states
    const states = Object.keys(statesAndCities).sort();
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
    console.log(`✓ Populated ${states.length} states`);

    // State change handler
    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        console.log(`📍 State selected: ${selectedState}`);
        
        citySelect.innerHTML = '';
        
        if (selectedState) {
            const cities = statesAndCities[selectedState].sort();
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
            console.log(`✓ Cities populated for ${selectedState}: ${cities.length} cities`);
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Choose a state first --';
            citySelect.appendChild(option);
            citySelect.disabled = true;
        }
    });

    // Submit handler
    submitButton.addEventListener('click', handleSubmit);
    
    // Allow Enter key to submit
    apiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });

    function handleSubmit() {
        const state = stateSelect.value.trim();
        const city = citySelect.value.trim();
        const apiKey = apiKeyInput.value.trim();

        console.log(`📤 Submit attempted - State: ${state}, City: ${city}, API Key: ${apiKey ? '✓ Provided' : '❌ Missing'}`);

        // Validation
        if (!state || !city || !apiKey) {
            console.warn('⚠️ Validation failed - Missing required values');
            alert('Please select your state, city, and enter your Mistral API key.');
            return;
        }

        // Store in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('state', state);
        sessionStorage.setItem('city', city);
        sessionStorage.setItem('location', `${city}, ${state}`);
        
        console.log('%c🚀 Data stored and redirecting to prediction page...', 'color: #667eea; font-weight: bold;');

        // Disable button during redirect
        submitButton.disabled = true;
        submitButton.textContent = '⏳ Loading...';

        // Redirect with slight delay for visual feedback
        setTimeout(() => {
            window.location.href = 'prediction.html';
        }, 300);
    }
});
