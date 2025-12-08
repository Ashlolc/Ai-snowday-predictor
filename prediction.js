// This will handle the prediction logic
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = sessionStorage.getItem('mistralApiKey');
    const location = sessionStorage.getItem('location');
    if (!apiKey || !location) {
        alert('Please enter your location and API key on the main page.');
        window.location.href = 'index.html';
    } else {
        // Here you would typically call the Mistral API to get predictions
        // For now, we'll just display a placeholder message
        document.getElementById('predictionResult').innerHTML = `<p>Predicting snow days for ${location} using Mistral API...</p>`;
    }
});