import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { HomeContentItem } from "@/lib/memberHome";

const STORAGE_KEY = "lawncare_saved_items";

export interface SavedItem extends HomeContentItem {
  section?: string;
  savedAt: string;
}

function readLocalStorage(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(items: SavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function fetchServerSavedItems(): Promise<SavedItem[]> {
  const res = await apiRequest("/api/user/saved-items");
  const data = res?.data ?? res;
  return Array.isArray(data) ? data : [];
}

export function useSavedItems() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [guestItems, setGuestItems] = useState<SavedItem[]>([]);

  const { data: serverItems = [], isLoading } = useQuery({
    queryKey: ["/api/user/saved-items"],
    queryFn: fetchServerSavedItems,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      setGuestItems(readLocalStorage());
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const local = readLocalStorage();
    if (local.length === 0) return;

    apiRequest("/api/user/saved-items/sync", {
      method: "POST",
      body: JSON.stringify({ items: local }),
    })
      .then(() => {
        localStorage.removeItem(STORAGE_KEY);
        queryClient.invalidateQueries({ queryKey: ["/api/user/saved-items"] });
      })
      .catch(() => {
        // Non-fatal — server list still loads
      });
  }, [user, queryClient]);

  const items: SavedItem[] = user ? serverItems : guestItems;

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const toggleSave = useCallback(
    async (item: HomeContentItem, section?: string) => {
      if (user) {
        const res = await apiRequest("/api/user/saved-items", {
          method: "PUT",
          body: JSON.stringify({ item, section }),
        });
        await queryClient.invalidateQueries({ queryKey: ["/api/user/saved-items"] });
        return !!res?.saved;
      }

      const existing = guestItems.find((entry) => entry.id === item.id);
      if (existing) {
        const next = guestItems.filter((entry) => entry.id !== item.id);
        setGuestItems(next);
        writeLocalStorage(next);
        return false;
      }
      const next = [
        ...guestItems,
        { ...item, section, savedAt: new Date().toISOString() },
      ];
      setGuestItems(next);
      writeLocalStorage(next);
      return true;
    },
    [user, guestItems, queryClient],
  );

  const remove = useCallback(
    async (id: string) => {
      if (user) {
        await apiRequest(`/api/user/saved-items/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        await queryClient.invalidateQueries({ queryKey: ["/api/user/saved-items"] });
        return;
      }
      const next = guestItems.filter((item) => item.id !== id);
      setGuestItems(next);
      writeLocalStorage(next);
    },
    [user, guestItems, queryClient],
  );

  return { items, isSaved, toggleSave, remove, isLoading };
}
