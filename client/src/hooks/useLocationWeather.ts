import { useQuery } from "@tanstack/react-query";

interface WeatherResponse {
  location?: { name?: string; region?: string };
  current?: {
    temp_f?: number;
    condition?: { text?: string; icon?: string };
    humidity?: number;
    wind_mph?: number;
  };
}

interface SoilTempResponse {
  currentSoilTemp?: number;
  avgSoilTemp?: number;
  hourly?: { time?: string[]; soil_temperature_6cm?: number[] };
}

async function getCoords(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      { timeout: 10000, maximumAge: 300000 },
    );
  });
}

export function useWeather(zipCode?: string | null) {
  return useQuery({
    queryKey: ["weather", zipCode],
    queryFn: async () => {
      let url = "/api/weather";
      if (zipCode) {
        url += `?zip=${encodeURIComponent(zipCode)}`;
      } else {
        const coords = await getCoords();
        url += `?lat=${coords.lat}&lng=${coords.lng}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Weather unavailable");
      return (await response.json()) as WeatherResponse;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useSoilTemp(zipCode?: string | null) {
  return useQuery({
    queryKey: ["soil-temp", zipCode],
    queryFn: async () => {
      let url = "/api/soil-temp";
      if (zipCode) {
        url += `?zip=${encodeURIComponent(zipCode)}`;
      } else {
        const coords = await getCoords();
        url += `?lat=${coords.lat}&lng=${coords.lng}`;
      }
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Soil temperature unavailable");
      return (await response.json()) as SoilTempResponse;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
