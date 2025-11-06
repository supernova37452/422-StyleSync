// LOT 77 70 is chicago area ish


export async function getCurrentTemperature(region = "LOT", gridX = 77, gridY = 70) {
  const url = `https://api.weather.gov/gridpoints/${region}/${gridX},${gridY}/forecast`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "(stylesync.app, contact@stylesync.app)",
        "Accept": "application/geo+json"
      }
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // The first period is usually the current/next forecast period
    const currentPeriod = data.properties?.periods?.[0];
    if (!currentPeriod) {
      throw new Error("No forecast data available");
    }

    return {
      temperature: currentPeriod.temperature,
      unit: currentPeriod.temperatureUnit,
      shortForecast: currentPeriod.shortForecast
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}