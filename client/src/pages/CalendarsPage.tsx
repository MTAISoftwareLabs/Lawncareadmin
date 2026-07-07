import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Calendar, Download, ChevronRight, ChevronLeft, FileText, 
  Clock, Leaf, Sun, Snowflake, Cloud, Plus, Bell, Trash2, Check
} from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";
import { useReminders, type Reminder } from "@/hooks/useReminders";
import { resolveMediaUrl } from "@/lib/mediaUrl";

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
    return (
      <CalendarDetailView
        calendar={selectedCalendar}
        embedded={embedded}
        skillLevel={skillLevel}
        setSkillLevel={setSkillLevel}
        getPdfUrl={getPdfUrl}
        onBack={() => setSelectedCalendar(null)}
      />
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
              const imageSrc = resolveMediaUrl(calendar.imageUrl);
              const pdfLinks = [
                { label: "Beginner PDF", url: resolveMediaUrl(calendar.beginnerPdfUrl), level: "beginner" },
                { label: "Intermediate", url: resolveMediaUrl(calendar.intermediatePdfUrl), level: "intermediate" },
                { label: "Advanced", url: resolveMediaUrl(calendar.advancedPdfUrl), level: "advanced" },
              ].filter((link) => !!link.url);

              return (
                <Card key={calendar.id} className="overflow-hidden" data-testid={`card-calendar-${calendar.id}`}>
                  {imageSrc ? (
                    <img
                      src={imageSrc}
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
                  {pdfLinks.length > 0 && (
                    <CardContent className="flex flex-wrap gap-2">
                      {pdfLinks.map((link) => (
                        <a
                          key={link.level}
                          href={link.url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`link-${link.level}-pdf-${calendar.id}`}
                        >
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                            <FileText className="w-3 h-3 mr-1" />
                            {link.label}
                          </Badge>
                        </a>
                      ))}
                    </CardContent>
                  )}
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

interface CalendarDetailViewProps {
  calendar: LawnCalendar;
  embedded: boolean;
  skillLevel: string;
  setSkillLevel: (level: string) => void;
  getPdfUrl: (calendar: LawnCalendar) => string | null;
  onBack: () => void;
}

function CalendarDetailView({
  calendar,
  embedded,
  skillLevel,
  setSkillLevel,
  getPdfUrl,
  onBack,
}: CalendarDetailViewProps) {
  const pdfUrl = resolveMediaUrl(getPdfUrl(calendar));
  const events = calendar.events || [];
  const { reminders, addReminder, toggleComplete, removeReminder, getForDay } = useReminders();

  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), notes: "" });

  const upcomingReminders = useMemo(
    () => [...reminders].sort((a, b) => a.date.localeCompare(b.date)),
    [reminders],
  );

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsForDay = (day: Date) =>
    events.filter((e) => e.eventDate && isSameDay(new Date(e.eventDate), day));

  const openAddDialog = (day?: Date) => {
    const target = day ?? selectedDay;
    setForm({ title: "", date: format(target, "yyyy-MM-dd"), notes: "" });
    setDialogOpen(true);
  };

  const submitReminder = () => {
    if (!form.title.trim() || !form.date) return;
    addReminder(form.title, form.date, form.notes);
    setDialogOpen(false);
  };

  const selectedDayEvents = eventsForDay(selectedDay);
  const selectedDayReminders = getForDay(selectedDay);

  return (
    <PageShell embedded={embedded}>
      {!embedded && <Navbar />}
      <PageContainer embedded={embedded}>
        <Button variant="ghost" onClick={onBack} className="mb-6" data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Calendars
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{calendar.title}</h1>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {events.length} Events
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {reminders.length} Reminders
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
                <Button className="w-full" data-testid="button-download-pdf">
                  <Download className="w-4 h-4 mr-2" />
                  Download {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} PDF
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Month calendar grid */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">{format(month, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))} data-testid="button-prev-month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setMonth(new Date()); setSelectedDay(new Date()); }}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))} data-testid="button-next-month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {gridDays.map((day) => {
                  const inMonth = isSameMonth(day, month);
                  const isSelected = isSameDay(day, selectedDay);
                  const isToday = isSameDay(day, new Date());
                  const dayEvents = eventsForDay(day);
                  const dayReminders = getForDay(day);
                  const hasEvents = dayEvents.length > 0;
                  const hasReminders = dayReminders.length > 0;

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`relative aspect-square rounded-md border text-sm transition-colors flex flex-col items-center justify-center gap-1
                        ${isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"}
                        ${!inMonth ? "text-muted-foreground/40" : ""}
                        ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}
                      data-testid={`day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <span className={isToday ? "font-bold text-primary" : ""}>{format(day, "d")}</span>
                      <span className="flex gap-0.5 h-1.5">
                        {hasEvents && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                        {hasReminders && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Calendar event</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Your reminder</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected day + add reminder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">{format(selectedDay, "EEEE, MMM d")}</CardTitle>
              <Button size="sm" onClick={() => openAddDialog(selectedDay)} data-testid="button-add-reminder">
                <Plus className="h-4 w-4 mr-1" />
                Reminder
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayEvents.length === 0 && selectedDayReminders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nothing scheduled. Tap “Reminder” to add one.
                </p>
              ) : (
                <>
                  {selectedDayEvents.map((event) => (
                    <div key={event.id} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <p className="text-sm font-medium">{event.header}</p>
                      </div>
                      {event.feature && (
                        <p className="mt-1 text-xs text-muted-foreground">{event.feature}</p>
                      )}
                    </div>
                  ))}
                  {selectedDayReminders.map((reminder) => (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={() => toggleComplete(reminder.id)}
                      onDelete={() => removeReminder(reminder.id)}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Reminders list */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Bell className="h-5 w-5 text-amber-500" />
              My Reminders
            </h2>
            <Button variant="outline" size="sm" onClick={() => openAddDialog()} data-testid="button-add-reminder-list">
              <Plus className="h-4 w-4 mr-1" />
              Add Reminder
            </Button>
          </div>
          {upcomingReminders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No reminders yet</p>
                <p className="text-sm text-muted-foreground">
                  Add reminders for fertilizing, mowing, watering and more.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  showDate
                  onToggle={() => toggleComplete(reminder.id)}
                  onDelete={() => removeReminder(reminder.id)}
                />
              ))}
            </div>
          )}
        </div>

        {events.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            This calendar has no preset events yet — you can still add your own reminders above.
          </p>
        )}
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">What do you need to do?</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Apply spring fertilizer"
                data-testid="input-reminder-title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                data-testid="input-reminder-date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any details you want to remember"
                rows={3}
                data-testid="input-reminder-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitReminder} disabled={!form.title.trim() || !form.date} data-testid="button-save-reminder">
              Save Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function ReminderRow({
  reminder,
  showDate = false,
  onToggle,
  onDelete,
}: {
  reminder: Reminder;
  showDate?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3" data-testid={`reminder-${reminder.id}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors
          ${reminder.completed ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/40"}`}
        aria-label={reminder.completed ? "Mark incomplete" : "Mark complete"}
        data-testid={`reminder-toggle-${reminder.id}`}
      >
        {reminder.completed && <Check className="h-3 w-3" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>
          {reminder.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {showDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(reminder.date), "MMM d, yyyy")}
            </span>
          )}
          {reminder.notes && <span className="truncate">{reminder.notes}</span>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
        onClick={onDelete}
        data-testid={`reminder-delete-${reminder.id}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default CalendarsPage;
