import { reactive } from "vue";

export const weatherStore = reactive<{
  temperature: number | null;
  shortForecast: string | null;
  icon: string | null; 
}>({
  temperature: null,
  shortForecast: null,
  icon: null,
});

export function setWeather(temp: number, condition: string | null = null) {
  weatherStore.temperature = temp;
  weatherStore.shortForecast = condition;

  // choose icon image based on the forecast text
  if (!condition) {
    weatherStore.icon = "/icons/sun.png"; 
  } else {
    const lower = condition.toLowerCase();
      if (lower.includes("cloud")) {
      weatherStore.icon = "/icons/cloud.png";
    } else if (lower.includes("rain") || lower.includes("showers")) {
      weatherStore.icon = "/icons/rain.png";
    } else if (lower.includes("snow")) {
      weatherStore.icon = "/icons/snow.png";
    } else if (lower.includes("wind")) {
      weatherStore.icon = "/icons/wind.png";
    } else if (lower.includes("fog") || lower.includes("mist")) {
      weatherStore.icon = "/icons/fog.png";
    } else {
      weatherStore.icon = "/icons/sun.png";
    }
  }

  // save to localStorage if you want persistence
  localStorage.setItem(
    "stylesync_weather",
    JSON.stringify({
      temperature: temp,
      shortForecast: condition,
      icon: weatherStore.icon,
    })
  );
}

export function hydrateWeather() {
  const raw = localStorage.getItem("stylesync_weather");
  if (!raw) return;
  try {
    const { temperature, shortForecast, icon } = JSON.parse(raw);
    weatherStore.temperature = temperature;
    weatherStore.shortForecast = shortForecast;
    weatherStore.icon = icon;
  } catch {
    /* ignore */
  }
}