import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Droplets, Loader2, Wind } from "lucide-react";
import { useWeather } from "@/hooks/useLocationWeather";

export function WeatherBanner({ zipCode }: { zipCode?: string | null }) {
  const { data, isLoading, isError } = useWeather(zipCode);

  return (
    <Card className="overflow-hidden border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-900 dark:text-sky-100">
          <Cloud className="h-4 w-4" />
          Current weather
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading weather...
          </div>
        ) : isError || !data?.current ? (
          <p className="text-sm text-muted-foreground">Weather data unavailable. Add a zip code in profile settings.</p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold">{Math.round(data.current.temp_f ?? 0)}°F</p>
              <p className="text-sm text-muted-foreground">
                {data.location?.name}
                {data.location?.region ? `, ${data.location.region}` : ""}
              </p>
              <p className="text-sm">{data.current.condition?.text}</p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Droplets className="h-4 w-4" />
                {data.current.humidity ?? 0}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-4 w-4" />
                {Math.round(data.current.wind_mph ?? 0)} mph
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
