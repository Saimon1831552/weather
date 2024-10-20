const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const LocationButton = document.querySelector(".location-btn");
const CurrentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_key = "d2d6011f5b4812370e70fc710920ded6";

const createWeatherCard = (cityName, weatherItem, index) => {
    
    const date = new Date(weatherItem.dt_txt);
    
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    
    
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    
    
    const fullDate = `${dayName}, ${day}/${month}/${year}`;
    
    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} <br> ${fullDate}</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else {
        return `
            <li class="card">
                <h3>${fullDate}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon">
                <h4>Temperature: ${(weatherItem.main.temp).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
}


const getWeatherDetails = (cityName,lat,lon) =>{
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => { 

            const uniqueForecastDays = [];
            const fivedaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if(!uniqueForecastDays.includes(forecastDate)){
                   return uniqueForecastDays.push(forecastDate);
                }
            })

            cityInput.value = "";
            CurrentWeatherDiv.innerHTML = "";
            weatherCardDiv.innerHTML = "";


            
            fivedaysForecast.forEach((weatherItem, index) => {
                if(index === 0){
                    CurrentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
                else{
                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })    
        .catch(() => {
            alert("An error occurred while fetching the Weather Forecasting!");
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => { 
            if(!data.length) return alert(`No coordinates found for ${cityName}`);
            const {name, lat, lon}  = data[0];
            getWeatherDetails(name, lat, lon) 
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
}

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const reverse_geoCoding_url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            
            fetch(reverse_geoCoding_url)
            .then(res => res.json())
            .then(data => { 
                const {name}  = data[0];
                getWeatherDetails(name, latitude, longitude) 

            })
            .catch(() => {
                alert("An error occurred while fetching the City!");
            });
        },
        error =>{
             if(error.code===error.PERMISSION_DENIED){
                alert("Please reset location access!");
             }

        }
    )
}

LocationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
