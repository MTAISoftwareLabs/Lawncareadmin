import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Thermometer } from "lucide-react";
import { useSoilTemp } from "@/hooks/useLocationWeather";

export function SoilTempBanner({ zipCode }: { zipCode?: string | null }) {
  const { data, isLoading, isError } = useSoilTemp(zipCode);

  return (
    <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
          <Thermometer className="h-4 w-4" />
          Soil temperature
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading soil data...
          </div>
        ) : isError || data?.currentSoilTemp == null ? (
          <p className="text-sm text-muted-foreground">
            Soil temperature unavailable. Enable location or set your zip code in profile.
          </p>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-bold">{Math.round(data.currentSoilTemp)}°F</p>
              <p className="text-sm text-muted-foreground">Current at 6cm depth</p>
            </div>
            {data.avgSoilTemp != null && (
              <div className="text-right">
                <p className="text-lg font-semibold">{Math.round(data.avgSoilTemp)}°F</p>
                <p className="text-sm text-muted-foreground">7-day average</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
