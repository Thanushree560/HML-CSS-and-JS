const API_KEY = "6c15403173438a88267ed4d2b436248d";

function updateDateTime(){

const now = new Date();

document.getElementById("dateTime").innerHTML =
now.toDateString() + " | " +
now.toLocaleTimeString();

}

setInterval(updateDateTime,1000);
updateDateTime();

async function getWeather(){

const city =
document.getElementById("cityInput").value;

if(!city) return;

try{

const response = await fetch(
`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
);

const data = await response.json();

document.getElementById("cityName").innerHTML =
data.name;

document.getElementById("temp").innerHTML =
Math.round(data.main.temp) + "°C";

document.getElementById("humidity").innerHTML =
data.main.humidity + "%";

document.getElementById("wind").innerHTML =
data.wind.speed + " km/h";

document.getElementById("condition").innerHTML =
data.weather[0].main;

updateHealthAdvice(
data.main.temp,
data.weather[0].main
);

}
catch(error){

alert("City not found");

}

}

function updateHealthAdvice(temp, condition){

let advice = "Maintain a healthy lifestyle.";

if(temp > 35){
advice =
"💧 Drink more water and avoid direct sunlight.";
}

if(condition === "Rain"){
advice =
"☂ Carry an umbrella and avoid stagnant water.";
}

if(temp < 15){
advice =
"🧥 Wear warm clothes and drink hot beverages.";
}

document.getElementById("healthAdvice").innerHTML =
advice;

}