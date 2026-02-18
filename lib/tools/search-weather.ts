import { tool } from 'ai';
import { z } from 'zod';

// Alys Beach, FL coordinates
const ALYS_BEACH_LAT = 30.3685;
const ALYS_BEACH_LON = -86.0467;

// WMO weather code descriptions
const weatherCodes: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
}

interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
}

export const searchWeather = tool({
  description:
    'Get the current weather and forecast for Alys Beach, Florida. Use this for any weather-related questions, what to wear outdoors, or whether events might be affected by weather.',
  parameters: z.object({
    query: z
      .string()
      .describe('The weather-related question'),
  }),
  execute: async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${ALYS_BEACH_LAT}&longitude=${ALYS_BEACH_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=5`;

      const response = await fetch(url);
      if (!response.ok) {
        return 'Weather data is temporarily unavailable. Alys Beach typically enjoys mild February weather with highs in the mid-60s°F. Check weather.com for the latest forecast.';
      }

      const data = await response.json();
      const current = data.current as CurrentWeather;
      const daily = data.daily as DailyWeather;

      const lines: string[] = [];

      // Current conditions
      lines.push('CURRENT CONDITIONS AT ALYS BEACH:');
      lines.push(`Temperature: ${Math.round(current.temperature_2m)}°F (feels like ${Math.round(current.apparent_temperature)}°F)`);
      lines.push(`Conditions: ${weatherCodes[current.weather_code] || 'Unknown'}`);
      lines.push(`Humidity: ${current.relative_humidity_2m}%`);
      lines.push(`Wind: ${Math.round(current.wind_speed_10m)} mph (gusts up to ${Math.round(current.wind_gusts_10m)} mph)`);

      // 5-day forecast
      lines.push('\n5-DAY FORECAST:');
      for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i] + 'T12:00:00');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const high = Math.round(daily.temperature_2m_max[i]);
        const low = Math.round(daily.temperature_2m_min[i]);
        const condition = weatherCodes[daily.weather_code[i]] || 'Unknown';
        const rainChance = daily.precipitation_probability_max[i];
        const wind = Math.round(daily.wind_speed_10m_max[i]);

        lines.push(`${dayName}: ${condition}, High ${high}°F / Low ${low}°F, ${rainChance}% chance of rain, Wind up to ${wind} mph`);
      }

      // Sunrise/sunset for today (API returns local time strings like "2026-02-18T06:21")
      if (daily.sunrise[0] && daily.sunset[0]) {
        const formatLocalTime = (isoLocal: string) => {
          const timePart = isoLocal.split('T')[1]; // "06:21"
          const [h, m] = timePart.split(':').map(Number);
          const ampm = h >= 12 ? 'PM' : 'AM';
          const hour12 = h % 12 || 12;
          return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
        };
        lines.push(`\nToday's sunrise: ${formatLocalTime(daily.sunrise[0])} CT | Sunset: ${formatLocalTime(daily.sunset[0])} CT`);
      }

      return lines.join('\n');
    } catch {
      return 'Weather data is temporarily unavailable. Alys Beach typically enjoys mild February weather with highs in the mid-60s°F and lows in the upper 40s°F. Check weather.com for the latest forecast.';
    }
  },
});
