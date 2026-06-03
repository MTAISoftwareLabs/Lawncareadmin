import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ArrowLeft, Loader2, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Ticket {
  id: number;
  userId: number;
  subject: string;
  status: string;
  priority: string;
  adminUnread: number;
  userUnread: number;
  lastMessageAt: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface Message {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: "user" | "admin";
  messageType: string;
  content: string;
  mediaUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    avatar: string | null;
    role: string;
  };
}

function UserAvatar({ name, avatar, isAdmin, size = "md" }: { name?: string; avatar?: string | null; isAdmin?: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  
  if (avatar) {
    return (
      <img 
        src={avatar} 
        alt={name || "User"} 
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }
  
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-medium ${
      isAdmin 
        ? "bg-green-600 text-white" 
        : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
    }`}>
      {isAdmin ? "A" : (name?.charAt(0)?.toUpperCase() || "U")}
    </div>
  );
}

function AdminSupportTicketsContent() {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticketsData, isLoading } = useQuery<{ status: boolean; data: Ticket[] }>({
    queryKey: ["/api/admin/support/tickets"],
    queryFn: async () => {
      const response = await fetch("/api/admin/support/tickets", { credentials: "include" });
      return response.json();
    }
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ 
    status: boolean; 
    ticket: { ticket: any; user: any }; 
    messages: { message: Message; sender: any }[] 
  }>({
    queryKey: ["/api/admin/support/tickets", selectedTicketId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/support/tickets/${selectedTicketId}/messages`, { credentials: "include" });
      return response.json();
    },
    enabled: !!selectedTicketId,
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: number; content: string }) => {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets", selectedTicketId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      setNewMessage("");
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const tickets = ticketsData?.data || [];
  const messages = messagesData?.messages || [];
  const ticketInfo = messagesData?.ticket;
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicketId) return;
    sendMessageMutation.mutate({ ticketId: selectedTicketId, content: newMessage });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.messageType) {
      case "image":
        return (
          <div className="max-w-xs">
            <img 
              src={msg.mediaUrl || ""} 
              alt="Image" 
              className="rounded-lg max-h-48 object-cover cursor-pointer"
              onClick={() => msg.mediaUrl && window.open(msg.mediaUrl, "_blank")}
            />
            {msg.content && <p className="mt-2 text-sm">{msg.content}</p>}
          </div>
        );
      case "video":
        return (
          <div className="max-w-xs">
            <video 
              src={msg.mediaUrl || ""} 
              controls 
              className="rounded-lg max-h-48"
            />
            {msg.content && <p className="mt-2 text-sm">{msg.content}</p>}
          </div>
        );
      case "document":
        return (
          <a 
            href={msg.mediaUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FileText className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">{msg.fileName || "Document"}</p>
              {msg.fileSize && <p className="text-xs text-muted-foreground">{(msg.fileSize / 1024).toFixed(1)} KB</p>}
            </div>
          </a>
        );
      default:
        return <p className="text-sm">{msg.content}</p>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        <div className={`${selectedTicketId ? 'hidden md:block md:w-1/3 lg:w-1/4' : 'w-full'} border-r dark:border-gray-700 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground mt-1">Help users with their questions</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
                <p className="text-sm mt-2">Users will appear here when they need help</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer hover-elevate ${
                    selectedTicketId === ticket.id ? "bg-green-50 dark:bg-green-900/20" : ""
                  }`}
                  data-testid={`ticket-${ticket.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <UserAvatar name={ticket.user?.name} avatar={ticket.user?.avatar} />
                      {ticket.adminUnread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {ticket.adminUnread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{ticket.user?.name || "User"}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(ticket.lastMessageAt || ticket.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{ticket.subject}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {selectedTicketId ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedTicketId(null)}
                data-testid="back-to-list"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {(selectedTicket || ticketInfo) && (
                <div className="flex items-center gap-3">
                  <UserAvatar 
                    name={selectedTicket?.user?.name || ticketInfo?.user?.name} 
                    avatar={selectedTicket?.user?.avatar || ticketInfo?.user?.avatar} 
                  />
                  <div>
                    <h2 className="font-semibold">{selectedTicket?.user?.name || ticketInfo?.user?.name || "User"}</h2>
                    <p className="text-sm text-muted-foreground">User ID: {selectedTicket?.userId || ticketInfo?.user?.id}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map(({ message: msg, sender }) => {
                  const isAdmin = msg.senderType === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${isAdmin ? "flex-row-reverse" : ""}`}>
                        <UserAvatar 
                          name={sender?.name || (isAdmin ? "Admin" : "User")} 
                          avatar={sender?.avatar} 
                          isAdmin={isAdmin}
                          size="sm" 
                        />
                        <div>
                          <div className={`p-3 rounded-lg ${
                            isAdmin 
                              ? "bg-green-600 text-white" 
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            {renderMessageContent(msg)}
                          </div>
                          <p className={`text-xs text-muted-foreground mt-1 ${isAdmin ? "text-right" : ""}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="message-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a ticket</p>
              <p className="text-sm">Choose a support ticket to respond</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export function AdminSupportTickets() {
  return (
    <AdminGuard>
      <AdminSupportTicketsContent />
    </AdminGuard>
  );
}
