# Debugging Guide for AI Snow Day Predictor

## 🐛 Issues That Were Fixed

### **1. Hardcoded Coordinates (CRITICAL)**
**Problem:** App was using Tokyo's coordinates (35.6895, 139.6917) for ALL locations!
```javascript
// ❌ BEFORE - Wrong!
const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&...`;
```
**Solution:** Added geocoding function to convert city/state to real coordinates
```javascript
// ✅ AFTER - Correct!
const coordinates = await getCoordinates(city, state);
const weatherData = await getWeatherData(coordinates.latitude, coordinates.longitude);
```

### **2. Missing Geocoding**
**Problem:** User entered city/state but no conversion to coordinates for API calls
**Solution:** Added `getCoordinates()` function using OpenMeteo Geocoding API (free, no key needed)

### **3. Mistral Model Version**
**Problem:** Used deprecated `mistral-tiny` model
```javascript
// ❌ BEFORE
model: 'mistral-tiny',
```
**Solution:** Updated to current model
```javascript
// ✅ AFTER
model: 'mistral-small-latest',
```

### **4. Weak Error Handling**
**Problem:** Generic error messages didn't help debug issues
**Solution:** Added detailed error messages and API response logging

### **5. sessionStorage Implementation** ✅
**Status:** Already correct! API key is properly stored in browser session

## 🔍 How to Debug

### **Step 1: Open Developer Console**
- Press `F12` on your keyboard
- Go to the "Console" tab
- You'll see detailed DEBUG messages

### **Step 2: Check Console Messages**
Look for these patterns:

**Good flow:**
```
DEBUG: DOMContentLoaded event fired.
DEBUG: Submit button clicked.
DEBUG: State value: Minnesota
DEBUG: City value: Sartell
DEBUG: API key provided: Yes (length: 42)
DEBUG: Step 1 - Getting coordinates...
DEBUG: Geocoding API URL: https://geocoding-api.open-meteo.com/v1/search?name=Sartell&state=Minnesota&...
DEBUG: Coordinates found: {latitude: 45.6034, longitude: -94.2119, name: "Sartell", state: "Minnesota"}
DEBUG: Step 2 - Getting weather data...
DEBUG: Weather data received: {daily: {...}}
DEBUG: Step 3 - Analyzing with Mistral AI...
DEBUG: Mistral API response: {choices: [{message: {content: "..."}}]}
```

**Common Errors:**
```
// Missing values
ERROR DEBUG: Missing required values.
Alert: Please enter your state, city, and Mistral API key.

// Bad API key
HTTP error! status: 401
Mistral API error! status: 401

// Bad city/state
No results found for InvalidCity, InvalidState

// Network issues
Failed to fetch (no 'Access-Control-Allow-Origin' header)
```

### **Step 3: Check Network Requests**
Go to Network tab to see actual API calls:
1. **Geocoding API** - Should return coordinates
2. **Open-Meteo Weather API** - Should return weather data
3. **Mistral API** - Should return AI analysis

## 🔑 Getting Your Mistral API Key

1. Visit https://console.mistral.ai
2. Sign up or log in
3. Click "API Keys" (left sidebar)
4. Create a new key
5. Copy and paste into the form

⚠️ **IMPORTANT:** Never share your API key with anyone!

## 📡 API Calls Explained

### **1. Geocoding API (Free, No Key)**
Converts city/state → latitude/longitude
```
https://geocoding-api.open-meteo.com/v1/search?
  name=Sartell&
  state=Minnesota&
  country=United%20States&
  count=1
```

### **2. Weather API (Free, No Key)**
Gets real weather data from NOAA via Open-Meteo
```
https://api.open-meteo.com/v1/forecast?
  latitude=45.6034&
  longitude=-94.2119&
  daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall&
  timezone=auto&
  forecast_days=7
```

### **3. Mistral API (Requires API Key)**
Sends weather data to AI for analysis
```
https://api.mistral.ai/v1/chat/completions

Headers: Authorization: Bearer YOUR_API_KEY
Body: {
  model: "mistral-small-latest",
  messages: [
    {role: "system", content: "You are a weather expert"},
    {role: "user", content: "Analyze this weather: ..."}
  ]
}
```

## ✅ Testing Checklist

- [ ] Console shows "DOMContentLoaded event fired"
- [ ] All input fields are recognized (no "not found" errors)
- [ ] Geocoding finds your city/state correctly
- [ ] Weather data returns 7 days of forecast
- [ ] Mistral API responds with AI analysis
- [ ] API key is stored in sessionStorage
- [ ] sessionStorage persists across page refreshes (in same tab)
- [ ] sessionStorage clears when tab is closed
- [ ] Error messages are helpful and specific

## 🚀 Performance Tips

1. **Geocoding is instant** (~100ms)
2. **Weather API is fast** (~200ms)
3. **Mistral AI takes 2-5 seconds** (normal - it's thinking)
4. **Total time:** 3-6 seconds

If slower, check your internet connection.

## 🔒 Security Notes

✅ **What's secure:**
- API key stored in sessionStorage (browser memory only)
- API key not logged to console (masked as "****")
- No server-side storage
- No third-party tracking

⚠️ **What to be careful of:**
- Don't commit API key to GitHub
- Don't share API key with others
- Check your Mistral dashboard for unauthorized usage
- sessionStorage is cleared when you close the tab

## 📝 Typical Conversation Flow

```javascript
// 1. User inputs city, state, API key
State: Minnesota
City: Sartell
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx

// 2. App geocodes location
API Call: geocoding-api.open-meteo.com
Response: lat=45.6034, lon=-94.2119

// 3. App gets weather
API Call: api.open-meteo.com/forecast
Response: 7-day forecast with temp, precipitation, snowfall

// 4. AI analyzes
API Call: api.mistral.ai/v1/chat/completions
Prompt: "You are a snow day expert. Analyze this weather data..."
Response: "Based on the forecast, there is a 65% chance of a snow day on Tuesday because temperatures will be 15-22°F with 4-6 inches of precipitation..."

// 5. Results displayed
Show: Location, weather summary, AI prediction, confidence percentage
```

## 🐛 Common Issues & Fixes

### **Issue: "No results found for [city], [state]"**
**Causes:**
- Spelling error (Sartel vs Sartell)
- Using abbreviation (MN vs Minnesota) - use full name
- City doesn't exist

**Fix:** Try with full state name, correct spelling

### **Issue: "Mistral API error! status: 401"**
**Cause:** Invalid or expired API key

**Fix:**
1. Check you copied the full key
2. No spaces before/after
3. Generate new key if lost

### **Issue: "Mistral API error! status: 429"**
**Cause:** Rate limited (too many requests)

**Fix:** Wait a minute, try again

### **Issue: Console shows "CORS error"**
**Cause:** Browser security blocking API call

**Fix:** This shouldn't happen - APIs used support CORS. Try different browser if persistent.

### **Issue: sessionStorage shows empty**
**Cause:** Using incognito/private mode, or sessionStorage disabled

**Fix:** Use normal browsing mode

## 📚 Files Explained

- **index.html** - UI structure and form
- **style.css** - Styling and animations
- **script.js** - All logic:
  - `getCoordinates()` - Geocoding function
  - `getWeatherData()` - Fetch weather from Open-Meteo
  - `analyzSnowDayChance()` - Call Mistral AI
  - Event listeners and error handling
- **prediction.html/js** - For future multi-page features

## 🎯 Next Steps to Improve

1. Add actual NOAA API integration (requires NOAA API key)
2. Show multi-day predictions
3. Add historical accuracy tracking
4. Cache results to avoid repeated API calls
5. Add location search autocomplete
6. Mobile-responsive improvements
7. Add dark mode

---

**Need help?** Check the console (F12) first - it tells you exactly what went wrong! 🎯
