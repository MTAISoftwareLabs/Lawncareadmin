import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, Download, ChevronRight, FileText, 
  Clock, Leaf, Sun, Snowflake, Cloud
} from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";

interface CalendarEvent {
  id: number;
  calendarId: number;
  header: string;
  feature: string | null;
  eventDate: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface LawnCalendar {
  id: number;
  title: string;
  imageUrl: string | null;
  routeName: string | null;
  beginnerPdfUrl: string | null;
  intermediatePdfUrl: string | null;
  advancedPdfUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  events: CalendarEvent[];
}

export function CalendarsPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [selectedCalendar, setSelectedCalendar] = useState<LawnCalendar | null>(null);
  const [skillLevel, setSkillLevel] = useState<string>("beginner");

  const { data: calendars = [], isLoading } = useQuery<LawnCalendar[]>({
    queryKey: ["/api/calendars"],
  });

  const getSeasonFromMonth = (month: number) => {
    if ([3, 4, 5].includes(month)) return "spring";
    if ([6, 7, 8].includes(month)) return "summer";
    if ([9, 10, 11].includes(month)) return "fall";
    return "winter";
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case "spring":
        return <Leaf className="w-4 h-4 text-green-500" />;
      case "summer":
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case "fall":
        return <Cloud className="w-4 h-4 text-orange-500" />;
      case "winter":
        return <Snowflake className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPdfUrl = (calendar: LawnCalendar): string | null => {
    switch (skillLevel) {
      case "beginner":
        return calendar.beginnerPdfUrl;
      case "intermediate":
        return calendar.intermediatePdfUrl;
      case "advanced":
        return calendar.advancedPdfUrl;
      default:
        return calendar.beginnerPdfUrl;
    }
  };

  if (selectedCalendar) {
    const pdfUrl = getPdfUrl(selectedCalendar);
    const events = selectedCalendar.events || [];

    return (
      <PageShell embedded={embedded}>
        {!embedded && <Navbar />}
        <PageContainer embedded={embedded}>
          <Button
            variant="ghost"
            onClick={() => setSelectedCalendar(null)}
            className="mb-6"
            data-testid="button-back"
          >
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Calendars
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{selectedCalendar.title}</h1>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {events.length} Events
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 mb-2">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <Button
                    key={level}
                    variant={skillLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSkillLevel(level)}
                    data-testid={`button-level-${level}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button data-testid="button-download-pdf">
                    <Download className="w-4 h-4 mr-2" />
                    Download {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} PDF
                  </Button>
                </a>
              )}
            </div>
          </div>

          {events.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} data-testid={`card-event-${event.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{event.header}</CardTitle>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  {event.feature && (
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{event.feature}</p>
                    </CardContent>
                  )}
                  {event.imageUrl && (
                    <CardContent className="pt-0">
                      <img
                        src={event.imageUrl}
                        alt={event.header}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground text-center">
                  Events for this calendar will appear here
                </p>
              </CardContent>
            </Card>
          )}
      </PageContainer>
    </PageShell>
    );
  }

  return (
    <PageShell embedded={embedded}>
      {!embedded && <Navbar />}
      <PageContainer embedded={embedded}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lawn Care Calendars</h1>
          <p className="text-muted-foreground">
            Seasonal schedules and downloadable care plans for your lawn
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : calendars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((calendar) => {
              const currentMonth = new Date().getMonth() + 1;
              const season = getSeasonFromMonth(currentMonth);
              
              return (
                <Card key={calendar.id} className="overflow-hidden" data-testid={`card-calendar-${calendar.id}`}>
                  {calendar.imageUrl ? (
                    <img
                      src={calendar.imageUrl}
                      alt={calendar.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-green-600 dark:text-green-300" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getSeasonIcon(season)}
                      <CardTitle>{calendar.title}</CardTitle>
                    </div>
                    <CardDescription>
                      {calendar.events?.length || 0} scheduled events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {calendar.beginnerPdfUrl && (
                      <a href={calendar.beginnerPdfUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-beginner-pdf-${calendar.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                          <FileText className="w-3 h-3 mr-1" />
                          Beginner PDF
                        </Badge>
                      </a>
                    )}
                    {calendar.intermediatePdfUrl && (
                      <a href={calendar.intermediatePdfUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-intermediate-pdf-${calendar.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                          <FileText className="w-3 h-3 mr-1" />
                          Intermediate
                        </Badge>
                      </a>
                    )}
                    {calendar.advancedPdfUrl && (
                      <a href={calendar.advancedPdfUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-advanced-pdf-${calendar.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                          <FileText className="w-3 h-3 mr-1" />
                          Advanced
                        </Badge>
                      </a>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedCalendar(calendar)}
                      data-testid={`button-view-${calendar.id}`}
                    >
                      View Calendar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Calendars Available</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Lawn care calendars will be added soon. Check back later for seasonal care schedules.
              </p>
            </CardContent>
          </Card>
        )}
      </PageContainer>
    </PageShell>
  );
}

export default CalendarsPage;
