import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserCog, Mail, Calendar, Ban, Crown, Shield, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function AdminUsersContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalType, setModalType] = useState<"role" | "ban" | "subscription">("role");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", role: "user" });

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditModal(false);
      toast({ title: "Success", description: "User role updated" });
    },
  });

  const updateBanMutation = useMutation({
    mutationFn: async ({ userId, isBanned, bannedReason }: { userId: number; isBanned: boolean; bannedReason?: string }) => {
      return apiRequest(`/api/admin/users/${userId}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned, bannedReason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditModal(false);
      toast({ title: "Success", description: "User ban status updated" });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, subscriptionStatus, subscriptionPlan, subscriptionExpiresAt }: any) => {
      return apiRequest(`/api/admin/users/${userId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus, subscriptionPlan, subscriptionExpiresAt }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditModal(false);
      toast({ title: "Success", description: "Subscription updated" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; role: string }) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddModal(false);
      setNewUserForm({ name: "", email: "", password: "", role: "user" });
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create user", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (newUserForm.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUserForm);
  };

  const openModal = (user: any, type: "role" | "ban" | "subscription") => {
    setEditingUser({ ...user });
    setModalType(type);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">User Management</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Users: {users?.length || 0}
              </div>
              <Button
                onClick={() => { setShowAddModal(true); setShowPassword(false); setNewUserForm({ name: "", email: "", password: "", role: "user" }); }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                data-testid="button-add-user"
              >
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subscription</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users?.map((user: any) => (
                    <tr key={user.id} className={`hover:bg-gray-50 ${user.isBanned ? "bg-red-50" : ""}`} data-testid={`row-user-${user.id}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {user.role === "admin" && <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${user.subscriptionStatus === "premium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                          {user.subscriptionStatus === "premium" && <Crown className="h-3 w-3" />}
                          {user.subscriptionStatus || "free"}
                        </span>
                        {user.subscriptionExpiresAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            <Ban className="h-3 w-3" /> Banned
                          </span>
                        ) : (
                          <span className="text-xs text-green-600">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openModal(user, "role")} title="Change Role" data-testid={`button-role-${user.id}`}>
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openModal(user, "subscription")} title="Manage Subscription" data-testid={`button-subscription-${user.id}`}>
                            <Crown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openModal(user, "ban")} title={user.isBanned ? "Unban User" : "Ban User"} data-testid={`button-ban-${user.id}`}>
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                            if (confirm(`Delete user "${user.name}"?`)) deleteUserMutation.mutate(user.id);
                          }} data-testid={`button-delete-${user.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" /> Add New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Name</Label>
                  <Input
                    id="new-name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Full name"
                    data-testid="input-new-user-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@example.com"
                    data-testid="input-new-user-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      data-testid="input-new-user-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-new-user-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <select
                    id="new-role"
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    data-testid="select-new-user-role"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" disabled={createUserMutation.isPending} data-testid="button-submit-new-user">
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              {modalType === "role" && (
                <>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCog className="h-5 w-5" /> Change Role</h2>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">{editingUser.name} ({editingUser.email})</p>
                    <select className="w-full border rounded px-3 py-2" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} data-testid="select-role">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={() => updateRoleMutation.mutate({ userId: editingUser.id, role: editingUser.role })} disabled={updateRoleMutation.isPending} data-testid="button-save-role">Save</Button>
                  </div>
                </>
              )}

              {modalType === "ban" && (
                <>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Ban className="h-5 w-5" /> {editingUser.isBanned ? "Unban User" : "Ban User"}</h2>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">{editingUser.name} ({editingUser.email})</p>
                    {!editingUser.isBanned && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reason for ban</label>
                        <textarea className="w-full border rounded px-3 py-2" placeholder="Enter reason..." value={editingUser.bannedReason || ""} onChange={(e) => setEditingUser({ ...editingUser, bannedReason: e.target.value })} data-testid="input-ban-reason" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant={editingUser.isBanned ? "default" : "destructive"} className="flex-1" onClick={() => updateBanMutation.mutate({ userId: editingUser.id, isBanned: !editingUser.isBanned, bannedReason: editingUser.bannedReason })} disabled={updateBanMutation.isPending} data-testid="button-confirm-ban">
                      {editingUser.isBanned ? "Unban" : "Ban User"}
                    </Button>
                  </div>
                </>
              )}

              {modalType === "subscription" && (
                <>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Crown className="h-5 w-5" /> Manage Subscription</h2>
                  <div className="mb-4 space-y-4">
                    <p className="text-sm text-gray-600">{editingUser.name} ({editingUser.email})</p>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full border rounded px-3 py-2" value={editingUser.subscriptionStatus || "free"} onChange={(e) => setEditingUser({ ...editingUser, subscriptionStatus: e.target.value })} data-testid="select-subscription-status">
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Plan</label>
                      <select className="w-full border rounded px-3 py-2" value={editingUser.subscriptionPlan || ""} onChange={(e) => setEditingUser({ ...editingUser, subscriptionPlan: e.target.value })} data-testid="select-subscription-plan">
                        <option value="">None</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expires At</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={editingUser.subscriptionExpiresAt ? new Date(editingUser.subscriptionExpiresAt).toISOString().split('T')[0] : ""} onChange={(e) => setEditingUser({ ...editingUser, subscriptionExpiresAt: e.target.value })} data-testid="input-subscription-expires" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={() => updateSubscriptionMutation.mutate({ userId: editingUser.id, subscriptionStatus: editingUser.subscriptionStatus, subscriptionPlan: editingUser.subscriptionPlan, subscriptionExpiresAt: editingUser.subscriptionExpiresAt })} disabled={updateSubscriptionMutation.isPending} data-testid="button-save-subscription">Save</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export function AdminUsers() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}
