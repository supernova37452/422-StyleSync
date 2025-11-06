import { reactive } from "vue";

export const weatherStore = reactive<{
  temperature: number | null;
  shortForecast: string | null;
}>({
  temperature: null,
  shortForecast: null,
});

export function setWeather(temp: number, shortForecast: string | null = null) {
  weatherStore.temperature = temp;
  weatherStore.shortForecast = shortForecast;
  localStorage.setItem(
    "stylesync_weather",
    JSON.stringify({ temperature: temp, shortForecast })
  );
}

export function hydrateWeather() {
  const raw = localStorage.getItem("stylesync_weather");
  if (!raw) return;
  try {
    const { temperature, shortForecast } = JSON.parse(raw);
    setWeather(temperature, shortForecast);
  } catch {
    /* ignore */
  }
}