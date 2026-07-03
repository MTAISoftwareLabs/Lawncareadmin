import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { uploadMediaFile } from "@/lib/uploadMedia";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { Loader2, Upload } from "lucide-react";

function ProfileSettingsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useMemberProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setPhone(profile.phone || "");
    setZipCode(profile.zipCode || "");
    setAvatar(profile.avatar || "");
    setNotificationsEnabled(profile.isNotificationEnabled !== false);
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          phone,
          zipCode,
          avatar,
          isNotificationEnabled: notificationsEnabled,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Profile updated" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadMediaFile(file);
      setAvatar(url);
      toast({ title: "Photo uploaded — save to apply" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Account settings</h1>
          <p className="text-sm text-muted-foreground">Update your profile — synced with the mobile app</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback>{name.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip code (for weather)</Label>
              <Input id="zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Push notifications</p>
                <p className="text-sm text-muted-foreground">Receive announcements in the app</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}

export function MemberProfileSettingsPage() {
  return (
    <MemberGuard>
      <ProfileSettingsContent />
    </MemberGuard>
  );
}
