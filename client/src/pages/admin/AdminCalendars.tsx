import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Plus, Pencil, Trash2, Loader2, ArrowLeft, CalendarDays } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LawnCalendar {
  id: number;
  title: string;
  imageUrl: string;
  routeName: string;
  beginnerPdfUrl: string;
  intermediatePdfUrl: string;
  advancedPdfUrl: string;
  displayOrder: number;
  isActive: boolean;
}

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

const emptyCalendarForm = {
  title: "",
  imageUrl: "",
  routeName: "",
  beginnerPdfUrl: "",
  intermediatePdfUrl: "",
  advancedPdfUrl: "",
  displayOrder: 0,
};

const emptyEventForm = {
  header: "",
  feature: "",
  eventDate: "",
  imageUrl: "",
  displayOrder: 0,
};

export function AdminCalendars() {
  const { toast } = useToast();

  // Calendar state
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<LawnCalendar | null>(null);
  const [calendarForm, setCalendarForm] = useState(emptyCalendarForm);

  // Event management state
  const [selectedCalendar, setSelectedCalendar] = useState<LawnCalendar | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);

  // ── Calendars ──────────────────────────────────────────────────────────────

  const { data: calendars = [], isLoading: calendarsLoading } = useQuery<LawnCalendar[]>({
    queryKey: ["/api/admin/calendars"],
    queryFn: async () => {
      const res = await fetch("/api/admin/calendars", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createCalendarMutation = useMutation({
    mutationFn: (data: typeof calendarForm) =>
      apiRequest("/api/admin/calendars", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Calendar created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
      setIsCalendarDialogOpen(false);
      setCalendarForm(emptyCalendarForm);
    },
    onError: () => toast({ title: "Failed to create calendar", variant: "destructive" }),
  });

  const updateCalendarMutation = useMutation({
    mutationFn: (data: { id: number } & typeof calendarForm) =>
      apiRequest(`/api/admin/calendars/${data.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Calendar updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
      setIsCalendarDialogOpen(false);
      setEditingCalendar(null);
      setCalendarForm(emptyCalendarForm);
    },
    onError: () => toast({ title: "Failed to update calendar", variant: "destructive" }),
  });

  const deleteCalendarMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/calendars/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Calendar deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars"] });
      if (selectedCalendar) setSelectedCalendar(null);
    },
    onError: () => toast({ title: "Failed to delete calendar", variant: "destructive" }),
  });

  // ── Calendar Events ────────────────────────────────────────────────────────

  const { data: events = [], isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/admin/calendars", selectedCalendar?.id, "events"],
    enabled: !!selectedCalendar,
    queryFn: async () => {
      const res = await fetch(`/api/admin/calendars/${selectedCalendar!.id}/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const json = await res.json();
      return json.data || json;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (data: typeof eventForm) =>
      apiRequest(`/api/admin/calendars/${selectedCalendar!.id}/events`, {
        method: "POST", body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: "Event added" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars", selectedCalendar?.id, "events"] });
      setIsEventDialogOpen(false);
      setEventForm(emptyEventForm);
    },
    onError: () => toast({ title: "Failed to add event", variant: "destructive" }),
  });

  const updateEventMutation = useMutation({
    mutationFn: (data: { id: number } & typeof eventForm) =>
      apiRequest(`/api/admin/calendars/${selectedCalendar!.id}/events/${data.id}`, {
        method: "PUT", body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: "Event updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars", selectedCalendar?.id, "events"] });
      setIsEventDialogOpen(false);
      setEditingEvent(null);
      setEventForm(emptyEventForm);
    },
    onError: () => toast({ title: "Failed to update event", variant: "destructive" }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: number) =>
      apiRequest(`/api/admin/calendars/${selectedCalendar!.id}/events/${eventId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Event deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendars", selectedCalendar?.id, "events"] });
    },
    onError: () => toast({ title: "Failed to delete event", variant: "destructive" }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAddCalendar = () => {
    setEditingCalendar(null);
    setCalendarForm(emptyCalendarForm);
    setIsCalendarDialogOpen(true);
  };

  const openEditCalendar = (cal: LawnCalendar) => {
    setEditingCalendar(cal);
    setCalendarForm({
      title: cal.title,
      imageUrl: cal.imageUrl || "",
      routeName: cal.routeName || "",
      beginnerPdfUrl: cal.beginnerPdfUrl || "",
      intermediatePdfUrl: cal.intermediatePdfUrl || "",
      advancedPdfUrl: cal.advancedPdfUrl || "",
      displayOrder: cal.displayOrder,
    });
    setIsCalendarDialogOpen(true);
  };

  const submitCalendar = () => {
    if (editingCalendar) {
      updateCalendarMutation.mutate({ id: editingCalendar.id, ...calendarForm });
    } else {
      createCalendarMutation.mutate(calendarForm);
    }
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm(emptyEventForm);
    setIsEventDialogOpen(true);
  };

  const openEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEventForm({
      header: ev.header,
      feature: ev.feature || "",
      eventDate: ev.eventDate,
      imageUrl: ev.imageUrl || "",
      displayOrder: ev.displayOrder,
    });
    setIsEventDialogOpen(true);
  };

  const submitEvent = () => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, ...eventForm });
    } else {
      createEventMutation.mutate(eventForm);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCalendar && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCalendar(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {selectedCalendar ? selectedCalendar.title : "Lawn Calendars"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {selectedCalendar ? "Manage events for this calendar" : "Manage grass type calendars with PDF plans"}
              </p>
            </div>
          </div>

          {selectedCalendar ? (
            <Button onClick={openAddEvent} data-testid="button-add-event">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          ) : (
            <Button onClick={openAddCalendar} data-testid="button-add-calendar">
              <Plus className="h-4 w-4 mr-2" />
              Add Calendar
            </Button>
          )}
        </div>

        {/* ── Calendar list view ── */}
        {!selectedCalendar && (
          <>
            {calendarsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : calendars.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No calendars yet. Click "Add Calendar" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calendars.map((cal) => (
                  <Card key={cal.id} className="overflow-hidden" data-testid={`card-calendar-${cal.id}`}>
                    {cal.imageUrl && (
                      <img src={cal.imageUrl} alt={cal.title} className="w-full h-32 object-cover" />
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span className="text-base">{cal.title}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" onClick={() => openEditCalendar(cal)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteCalendarMutation.mutate(cal.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {cal.routeName && <p>Route: {cal.routeName}</p>}
                        <p>Beginner PDF: {cal.beginnerPdfUrl ? "✅ Set" : "—"}</p>
                        <p>Intermediate PDF: {cal.intermediatePdfUrl ? "✅ Set" : "—"}</p>
                        <p>Advanced PDF: {cal.advancedPdfUrl ? "✅ Set" : "—"}</p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        variant="outline"
                        onClick={() => setSelectedCalendar(cal)}
                        data-testid={`button-manage-events-${cal.id}`}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Manage Events
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Events view for selected calendar ── */}
        {selectedCalendar && (
          <>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                  <CalendarDays className="h-10 w-10 mx-auto opacity-30" />
                  <p className="font-medium">No events yet</p>
                  <p className="text-sm">Click "Add Event" to create the first event for this calendar.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <Card key={ev.id} data-testid={`card-event-${ev.id}`}>
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        {ev.imageUrl && (
                          <img src={ev.imageUrl} alt={ev.header} className="h-16 w-16 object-cover rounded-lg shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{ev.header}</h3>
                            <Badge variant="outline" className="text-xs">
                              {new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                            </Badge>
                          </div>
                          {ev.feature && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ev.feature}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEditEvent(ev)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteEventMutation.mutate(ev.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Calendar dialog ── */}
      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCalendar ? "Edit Calendar" : "Add Calendar"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title (Grass Type)</Label>
              <Input
                value={calendarForm.title}
                onChange={(e) => setCalendarForm({ ...calendarForm, title: e.target.value })}
                placeholder="Kentucky Bluegrass"
                data-testid="input-calendar-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Route Name</Label>
              <Input
                value={calendarForm.routeName}
                onChange={(e) => setCalendarForm({ ...calendarForm, routeName: e.target.value })}
                placeholder="KentuckyBluegrass"
                data-testid="input-route-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <FileUpload
                value={calendarForm.imageUrl}
                onChange={(url) => setCalendarForm({ ...calendarForm, imageUrl: url })}
                accept="image/*"
                uploadType="image"
                placeholder="Upload image or paste URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Beginner PDF</Label>
              <FileUpload
                value={calendarForm.beginnerPdfUrl}
                onChange={(url) => setCalendarForm({ ...calendarForm, beginnerPdfUrl: url })}
                accept=".pdf,application/pdf"
                uploadType="pdf"
                placeholder="Upload PDF or paste URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Intermediate PDF</Label>
              <FileUpload
                value={calendarForm.intermediatePdfUrl}
                onChange={(url) => setCalendarForm({ ...calendarForm, intermediatePdfUrl: url })}
                accept=".pdf,application/pdf"
                uploadType="pdf"
                placeholder="Upload PDF or paste URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Advanced PDF</Label>
              <FileUpload
                value={calendarForm.advancedPdfUrl}
                onChange={(url) => setCalendarForm({ ...calendarForm, advancedPdfUrl: url })}
                accept=".pdf,application/pdf"
                uploadType="pdf"
                placeholder="Upload PDF or paste URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={calendarForm.displayOrder}
                onChange={(e) => setCalendarForm({ ...calendarForm, displayOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <Button
              className="w-full mt-2"
              onClick={submitCalendar}
              disabled={createCalendarMutation.isPending || updateCalendarMutation.isPending}
              data-testid="button-submit-calendar"
            >
              {(createCalendarMutation.isPending || updateCalendarMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingCalendar ? "Update Calendar" : "Create Calendar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Event dialog ── */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title / Header *</Label>
              <Input
                value={eventForm.header}
                onChange={(e) => setEventForm({ ...eventForm, header: e.target.value })}
                placeholder="e.g. Apply pre-emergent herbicide"
                data-testid="input-event-header"
              />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={eventForm.eventDate}
                onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                data-testid="input-event-date"
              />
            </div>
            <div className="space-y-2">
              <Label>Description / Notes</Label>
              <Textarea
                value={eventForm.feature}
                onChange={(e) => setEventForm({ ...eventForm, feature: e.target.value })}
                placeholder="Additional details, reminder notes, product recommendations…"
                rows={3}
                data-testid="input-event-feature"
              />
            </div>
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <FileUpload
                value={eventForm.imageUrl}
                onChange={(url) => setEventForm({ ...eventForm, imageUrl: url })}
                accept="image/*"
                uploadType="image"
                placeholder="Upload image or paste URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={eventForm.displayOrder}
                onChange={(e) => setEventForm({ ...eventForm, displayOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <Button
              className="w-full mt-2"
              onClick={submitEvent}
              disabled={createEventMutation.isPending || updateEventMutation.isPending || !eventForm.header || !eventForm.eventDate}
              data-testid="button-submit-event"
            >
              {(createEventMutation.isPending || updateEventMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingEvent ? "Update Event" : "Add Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
