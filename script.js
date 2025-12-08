// This will handle the API key submission and interaction with Mistral API
document.getElementById('submitKey').addEventListener('click', function() {
    const location = document.getElementById('location').value;
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey && location) {
        // Store the API key and location in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        sessionStorage.setItem('location', location);
        alert('API key and location stored in this session. You can now use the predictor.');
        // Here you would typically redirect to another page or update the UI
        window.location.href = 'prediction.html';
    } else {
        alert('Please enter both your location and API key.');
    }
});