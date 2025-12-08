// This will handle the API key submission and interaction with Mistral API
document.getElementById('submitKey').addEventListener('click', function() {
    const location = document.getElementById('location').value;
    const apiKey = document.getElementById('apiKey').value;
    const loadingElement = document.getElementById('loading');
    const predictionResultElement = document.getElementById('predictionResult');

    if (apiKey && location) {
        // Show loading animation
        loadingElement.style.display = 'block';
        predictionResultElement.innerHTML = '';

        // Store the API key and location in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('location', location);

        // Simulate API call with a timeout
        setTimeout(function() {
            // Hide loading animation
            loadingElement.style.display = 'none';

            // Display prediction result
            predictionResultElement.innerHTML = `<p>Predicting snow days for ${location} using Mistral API...</p>`;

            // Here you would typically redirect to another page or update the UI
            // window.location.href = 'prediction.html';
        }, 2000);
    } else {
        alert('Please enter both your location and API key.');
    }
});