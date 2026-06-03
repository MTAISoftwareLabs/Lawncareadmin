import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Clock, Sun, Leaf, 
  ChevronRight, Filter, MapPin, Thermometer,
  CheckCircle
} from "lucide-react";

interface LawnCarePlan {
  id: number;
  title: string;
  description: string | null;
  season: string | null;
  grassTypeId: number | null;
  region: string | null;
  tasks: any[];
  duration: string | null;
  difficulty: string | null;
  imageUrl: string | null;
  isPremium: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

interface GrassType {
  id: number;
  name: string;
  type: string;
  description: string | null;
}

export function CarePlansPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const { data: plans, isLoading } = useQuery<LawnCarePlan[]>({
    queryKey: ["/api/lawn-care-plans"],
  });

  const { data: grassTypes } = useQuery<GrassType[]>({
    queryKey: ["/api/grass-types"],
  });

  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "Northwest", "Pacific"];

  const filteredPlans = plans?.filter((plan) => {
    if (selectedSeason !== "all" && plan.season?.toLowerCase() !== selectedSeason.toLowerCase()) {
      return false;
    }
    if (selectedRegion !== "all" && plan.region?.toLowerCase() !== selectedRegion.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getSeasonIcon = (season: string | null) => {
    switch (season?.toLowerCase()) {
      case "spring":
        return <Leaf className="w-4 h-4 text-green-500" />;
      case "summer":
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case "fall":
        return <Leaf className="w-4 h-4 text-orange-500" />;
      case "winter":
        return <Thermometer className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getGrassTypeName = (grassTypeId: number | null) => {
    if (!grassTypeId || !grassTypes) return null;
    return grassTypes.find((g) => g.id === grassTypeId)?.name;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lawn Care Plans</h1>
          <p className="text-muted-foreground">
            Personalized care plans based on your region, grass type, and season
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[150px]" data-testid="select-season">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season} value={season.toLowerCase()}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[150px]" data-testid="select-region">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region.toLowerCase()}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlans && filteredPlans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`hover-elevate transition-all ${
                  expandedPlan === plan.id ? "ring-2 ring-primary" : ""
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.imageUrl && (
                  <div className="relative h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={plan.imageUrl}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                    />
                    {plan.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500">
                        Premium
                      </Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    {plan.season && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSeasonIcon(plan.season)}
                        {plan.season}
                      </Badge>
                    )}
                  </div>
                  {plan.description && (
                    <CardDescription className="line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.region && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {plan.region}
                      </Badge>
                    )}
                    {plan.duration && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.duration}
                      </Badge>
                    )}
                    {plan.difficulty && (
                      <Badge className={getDifficultyColor(plan.difficulty)}>
                        {plan.difficulty}
                      </Badge>
                    )}
                  </div>

                  {getGrassTypeName(plan.grassTypeId) && (
                    <p className="text-sm text-muted-foreground mb-4">
                      <Leaf className="w-4 h-4 inline mr-1" />
                      Best for: {getGrassTypeName(plan.grassTypeId)}
                    </p>
                  )}

                  {expandedPlan === plan.id && plan.tasks && plan.tasks.length > 0 && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <h4 className="font-semibold text-sm">Tasks:</h4>
                      {plan.tasks.map((task: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{typeof task === "string" ? task : task.title || task.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                    data-testid={`button-view-plan-${plan.id}`}
                  >
                    {expandedPlan === plan.id ? "Show Less" : "View Plan Details"}
                    <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${
                      expandedPlan === plan.id ? "rotate-90" : ""
                    }`} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No plans found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedSeason !== "all" || selectedRegion !== "all"
                  ? "Try adjusting your filters to see more plans"
                  : "Care plans will be added soon. Check back later!"}
              </p>
              {(selectedSeason !== "all" || selectedRegion !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSeason("all");
                    setSelectedRegion("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
