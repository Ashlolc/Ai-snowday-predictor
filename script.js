// This will handle the API key submission and interaction with Mistral API
document.getElementById('submitKey').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey) {
        // Store the API key in sessionStorage
        sessionStorage.setItem('mistralApiKey', apiKey);
        alert('API key stored in this session. You can now use the predictor.');
    } else {
        alert('Please enter your API key.');
    }
});