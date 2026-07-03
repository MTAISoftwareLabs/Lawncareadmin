import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, Sun, Droplets, Thermometer, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Info, MapPin
} from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";

interface GrassType {
  id: number;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  characteristics: {
    waterNeeds?: string;
    sunlight?: string;
    soilType?: string;
    mowingHeight?: string;
    growthRate?: string;
    droughtTolerance?: string;
    coldTolerance?: string;
    heatTolerance?: string;
    wearTolerance?: string;
  } | null;
  maintenanceLevel: string | null;
  bestRegions: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  isActive: boolean;
}

export function GrassTypesPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedGrass, setExpandedGrass] = useState<number | null>(null);

  const { data: grassTypes, isLoading } = useQuery<GrassType[]>({
    queryKey: ["/api/grass-types"],
  });

  const filteredGrassTypes = grassTypes?.filter((grass) => {
    if (selectedType === "all") return true;
    return grass.type.toLowerCase() === selectedType.toLowerCase();
  });

  const getMaintenanceColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getToleranceLevel = (value: string | undefined) => {
    if (!value) return null;
    switch (value.toLowerCase()) {
      case "high":
      case "excellent":
        return { color: "text-green-500", icon: <CheckCircle className="w-4 h-4" /> };
      case "medium":
      case "moderate":
        return { color: "text-yellow-500", icon: <Info className="w-4 h-4" /> };
      case "low":
      case "poor":
        return { color: "text-red-500", icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { color: "text-muted-foreground", icon: null };
    }
  };

  return (
    <PageShell embedded={embedded}>
      {!embedded && <Navbar />}
      <PageContainer embedded={embedded}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Grass Types Guide</h1>
          <p className="text-muted-foreground">
            Learn about different grass varieties and find the best one for your lawn
          </p>
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-8">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All Types</TabsTrigger>
            <TabsTrigger value="cool-season" data-testid="tab-cool-season">Cool-Season</TabsTrigger>
            <TabsTrigger value="warm-season" data-testid="tab-warm-season">Warm-Season</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Cool-Season Grasses</h3>
              <p className="text-sm text-muted-foreground">
                Thrive in temperatures between 60-75°F. Best for northern regions with cold winters.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Warm-Season Grasses</h3>
              <p className="text-sm text-muted-foreground">
                Thrive in temperatures between 80-95°F. Best for southern regions with hot summers.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredGrassTypes && filteredGrassTypes.length > 0 ? (
          <div className="space-y-4">
            {filteredGrassTypes.map((grass) => (
              <Card
                key={grass.id}
                className="overflow-hidden"
                data-testid={`card-grass-${grass.id}`}
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedGrass(expandedGrass === grass.id ? null : grass.id)}
                >
                  <div className="flex items-start gap-4">
                    {grass.imageUrl ? (
                      <img
                        src={grass.imageUrl}
                        alt={grass.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-8 h-8 text-green-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{grass.name}</CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">
                              {grass.type}
                            </Badge>
                            {grass.maintenanceLevel && (
                              <Badge className={getMaintenanceColor(grass.maintenanceLevel)}>
                                {grass.maintenanceLevel} Maintenance
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" data-testid={`button-expand-${grass.id}`}>
                          {expandedGrass === grass.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                      {grass.description && (
                        <CardDescription className={`mt-2 ${expandedGrass === grass.id ? "" : "line-clamp-2"}`}>
                          {grass.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedGrass === grass.id && (
                  <CardContent className="border-t pt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grass.characteristics && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Characteristics
                          </h4>
                          <div className="space-y-2">
                            {grass.characteristics.waterNeeds && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Droplets className="w-4 h-4" />
                                  Water Needs
                                </span>
                                <span>{grass.characteristics.waterNeeds}</span>
                              </div>
                            )}
                            {grass.characteristics.sunlight && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Sun className="w-4 h-4" />
                                  Sunlight
                                </span>
                                <span>{grass.characteristics.sunlight}</span>
                              </div>
                            )}
                            {grass.characteristics.mowingHeight && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mowing Height</span>
                                <span>{grass.characteristics.mowingHeight}</span>
                              </div>
                            )}
                            {grass.characteristics.growthRate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Growth Rate</span>
                                <span>{grass.characteristics.growthRate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {grass.characteristics && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Tolerances
                          </h4>
                          <div className="space-y-2">
                            {grass.characteristics.droughtTolerance && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Drought</span>
                                <span className={`flex items-center gap-1 ${getToleranceLevel(grass.characteristics.droughtTolerance)?.color}`}>
                                  {getToleranceLevel(grass.characteristics.droughtTolerance)?.icon}
                                  {grass.characteristics.droughtTolerance}
                                </span>
                              </div>
                            )}
                            {grass.characteristics.coldTolerance && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Cold</span>
                                <span className={`flex items-center gap-1 ${getToleranceLevel(grass.characteristics.coldTolerance)?.color}`}>
                                  {getToleranceLevel(grass.characteristics.coldTolerance)?.icon}
                                  {grass.characteristics.coldTolerance}
                                </span>
                              </div>
                            )}
                            {grass.characteristics.heatTolerance && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Heat</span>
                                <span className={`flex items-center gap-1 ${getToleranceLevel(grass.characteristics.heatTolerance)?.color}`}>
                                  {getToleranceLevel(grass.characteristics.heatTolerance)?.icon}
                                  {grass.characteristics.heatTolerance}
                                </span>
                              </div>
                            )}
                            {grass.characteristics.wearTolerance && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Wear</span>
                                <span className={`flex items-center gap-1 ${getToleranceLevel(grass.characteristics.wearTolerance)?.color}`}>
                                  {getToleranceLevel(grass.characteristics.wearTolerance)?.icon}
                                  {grass.characteristics.wearTolerance}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {grass.bestRegions && grass.bestRegions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Best Regions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {grass.bestRegions.map((region, index) => (
                              <Badge key={index} variant="outline">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {(grass.pros || grass.cons) && (
                      <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                        {grass.pros && grass.pros.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Pros
                            </h4>
                            <ul className="space-y-2">
                              {grass.pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {grass.cons && grass.cons.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Cons
                            </h4>
                            <ul className="space-y-2">
                              {grass.cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Leaf className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No grass types found</h3>
              <p className="text-muted-foreground">
                {selectedType !== "all"
                  ? "Try selecting a different category"
                  : "Grass type information will be added soon."}
              </p>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </PageShell>
  );
}
