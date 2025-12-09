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

console.log('DEBUG: Script loaded - Version 4.0');

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
});

// Main submit button handler
document.getElementById('submitKey').addEventListener('click', function() {
    console.log('DEBUG: Submit button clicked.');

    const state = document.getElementById('state').value.trim();
    const city = document.getElementById('city').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const loadingElement = document.getElementById('loading');

    console.log('DEBUG: State value:', state);
    console.log('DEBUG: City value:', city);
    console.log('DEBUG: API key provided:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');

    // Validation
    if (!state || !city || !apiKey) {
        console.error('DEBUG: Missing required values.');
        alert('Please select your state, city, and enter your Mistral API key.');
        return;
    }

    // Show loading state
    loadingElement.style.display = 'block';
    console.log('DEBUG: Loading state shown. Storing to sessionStorage and redirecting...');

    // Store values in sessionStorage
    sessionStorage.setItem('mistralApiKey', apiKey);
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('city', city);
    sessionStorage.setItem('location', city + ', ' + state);
    
    console.log('DEBUG: Values stored in sessionStorage:');
    console.log('  - State:', state);
    console.log('  - City:', city);
    console.log('  - Location:', city + ', ' + state);
    console.log('  - API Key length:', apiKey.length);
    console.log('DEBUG: Redirecting to prediction.html...');

    // Redirect to prediction page
    setTimeout(() => {
        window.location.href = 'prediction.html';
    }, 500);
});
