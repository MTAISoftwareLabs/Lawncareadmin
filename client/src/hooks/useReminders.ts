import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "lawncare_reminders";

export interface Reminder {
  id: string;
  title: string;
  /** ISO date string (yyyy-mm-dd or full ISO). */
  date: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

function readLocalStorage(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(items: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Personal lawn-care reminders, persisted in the browser (localStorage) —
 * mirrors the mobile app, which also stores user reminders on-device.
 */
export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    setReminders(readLocalStorage());

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setReminders(readLocalStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: Reminder[]) => {
    const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date));
    setReminders(sorted);
    writeLocalStorage(sorted);
  }, []);

  const addReminder = useCallback(
    (title: string, date: string, notes?: string) => {
      const reminder: Reminder = {
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        date,
        notes: notes?.trim() || undefined,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      persist([...reminders, reminder]);
      return reminder;
    },
    [reminders, persist],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      persist(
        reminders.map((r) =>
          r.id === id ? { ...r, completed: !r.completed } : r,
        ),
      );
    },
    [reminders, persist],
  );

  const removeReminder = useCallback(
    (id: string) => {
      persist(reminders.filter((r) => r.id !== id));
    },
    [reminders, persist],
  );

  const getForDay = useCallback(
    (date: Date) =>
      reminders.filter((r) => {
        const d = new Date(r.date);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      }),
    [reminders],
  );

  return { reminders, addReminder, toggleComplete, removeReminder, getForDay };
}
