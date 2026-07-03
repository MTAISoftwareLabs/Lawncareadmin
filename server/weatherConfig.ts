import { loadAdminConfigKeys } from "./adminConfigStore";

export const WEATHER_CONFIG_KEYS = ["weather_api_key"] as const;

export async function loadWeatherApiKey(): Promise<string | undefined> {
  const dbValues = await loadAdminConfigKeys([...WEATHER_CONFIG_KEYS]);
  const key = (dbValues.weather_api_key || process.env.WEATHER_API_KEY || "").trim();
  return key || undefined;
}

export async function isWeatherConfigured(): Promise<boolean> {
  return !!(await loadWeatherApiKey());
}
