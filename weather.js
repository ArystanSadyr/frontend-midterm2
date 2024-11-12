const apiKey = '1839cc7428b29cd4dff5284e9f47eb72'; 
let usingCelsius = true;
let searchTimeout;

document.getElementById("city-search").addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performWeatherSearch, 500);
});

async function performWeatherSearch() {
    const cityName = document.getElementById("city-search").value.trim();
    if (cityName.length < 3) {
        console.log("City search requires at least 3 characters.");
        return;
    }

    try {
        const measurementUnits = usingCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${measurementUnits}`);
        
        if (response.status === 404) {
            console.log(`City "${cityName}" not found.`);
            return;
        }
        
        if (!response.ok) throw new Error("Could not retrieve current weather");

        const weatherData = await response.json();
        updateCurrentWeather(weatherData);

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${measurementUnits}`);
        
        if (forecastResponse.status === 404) {
            console.log(`Forecast for "${cityName}" not available.`);
            return;
        }
        
        if (!forecastResponse.ok) throw new Error("Could not retrieve forecast data");

        const forecastData = await forecastResponse.json();
        renderForecast(forecastData.list);
    } catch (error) {
        console.error("Weather data error:", error);
    }
}

function updateCurrentWeather(data) {
    const currentWeatherEl = document.getElementById("current-weather-display");

    if (!data || !data.weather || !data.main) {
        currentWeatherEl.innerHTML = "<p>Weather data not available at the moment.</p>";
        return;
    }

    currentWeatherEl.innerHTML = `
        <h2>${data.name}</h2>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°${usingCelsius ? 'C' : 'F'}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${usingCelsius ? 'm/s' : 'mph'}</p>
    `;
}

function renderForecast(forecastData) {
    const forecastContainer = document.getElementById("five-day-forecast");
    if (!forecastData || forecastData.length === 0) {
        forecastContainer.innerHTML = "<p>No forecast data available.</p>";
        return;
    }

    forecastContainer.innerHTML = forecastData
        .filter((_, idx) => idx % 8 === 0)
        .map(day => {
            const forecastDate = new Date(day.dt_txt);
            return `
                <div class="forecast-box">
                    <h3>${forecastDate.toLocaleDateString(undefined, { weekday: 'short' })}</h3>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                    <p>High: ${day.main.temp_max}°${usingCelsius ? 'C' : 'F'}</p>
                    <p>Low: ${day.main.temp_min}°${usingCelsius ? 'C' : 'F'}</p>
                </div>
            `;
        }).join('');
}

function switchUnits() {
    usingCelsius = !usingCelsius;
    const cityName = document.getElementById("city-search").value;
    if (cityName.length >= 3) {
        performWeatherSearch();
    }
}
