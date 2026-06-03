import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/AdminLayout";
import { MessageSquare, ArrowLeft, Loader2, FileText, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface Conversation {
  conversationId: number;
  user1: User;
  user2: User;
  lastMessage: {
    id: number;
    type: string;
    content: string;
    mediaUrl: string | null;
    senderId: number;
    createdAt: string;
  } | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface Message {
  id: number;
  senderId: number;
  messageType: string;
  content: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

function UserAvatar({ name, avatar, size = "md", isAdmin = false }: { name?: string; avatar?: string | null; size?: "sm" | "md"; isAdmin?: boolean }) {
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
        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
    }`}>
      {isAdmin ? "A" : (name?.charAt(0)?.toUpperCase() || "U")}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return format(date, "h:mm a");
  } else if (diffDays < 7) {
    return format(date, "EEE");
  } else {
    return format(date, "MMM d");
  }
}

function AdminUserChatsContent() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatsData, isLoading } = useQuery<{ status: boolean; data: Conversation[] }>({
    queryKey: ["/api/admin/chats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/chats", { credentials: "include" });
      return response.json();
    }
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ 
    status: boolean; 
    conversation: { id: number; user1: User; user2: User; createdAt: string }; 
    messages: Message[] 
  }>({
    queryKey: ["/api/admin/chats", selectedConversationId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/chats/${selectedConversationId}/messages`, { credentials: "include" });
      return response.json();
    },
    enabled: !!selectedConversationId,
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const response = await fetch(`/api/admin/chats/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, message_type: "text" })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chats", selectedConversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/chats"] });
      setNewMessage("");
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  const conversations = chatsData?.data || [];
  const selectedConversation = conversations.find(c => c.conversationId === selectedConversationId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({ conversationId: selectedConversationId, content: newMessage.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (msg: Message, isAdminMessage: boolean) => {
    const textColorClass = isAdminMessage ? "text-white" : "text-foreground";
    
    switch (msg.messageType) {
      case "image":
        return (
          <div className="max-w-[200px]">
            <img 
              src={msg.mediaUrl || ""} 
              alt="Shared" 
              className="rounded-lg max-w-full cursor-pointer"
              onClick={() => window.open(msg.mediaUrl || "", "_blank")}
            />
            {msg.content && <p className={`mt-1 text-sm ${textColorClass}`}>{msg.content}</p>}
          </div>
        );
      case "video":
        return (
          <div className="max-w-[200px]">
            <video 
              src={msg.mediaUrl || ""} 
              controls 
              className="rounded-lg max-w-full"
              poster={msg.thumbnailUrl || undefined}
            />
            {msg.content && <p className={`mt-1 text-sm ${textColorClass}`}>{msg.content}</p>}
          </div>
        );
      case "document":
        return (
          <a 
            href={msg.mediaUrl || ""} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg ${isAdminMessage ? "bg-green-700 hover:bg-green-800" : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"}`}
          >
            <FileText className={`h-8 w-8 ${isAdminMessage ? "text-white" : "text-blue-500"}`} />
            <div className="text-sm">
              <p className={`font-medium ${textColorClass}`}>{msg.fileName || "Document"}</p>
              {msg.fileSize && <p className={`text-xs ${isAdminMessage ? "text-green-200" : "text-gray-500"}`}>{(msg.fileSize / 1024).toFixed(1)} KB</p>}
            </div>
          </a>
        );
      default:
        return <p className={`whitespace-pre-wrap ${textColorClass}`}>{msg.content}</p>;
    }
  };

  // Check if a message is from admin (TurfguyRoss or any user with role admin)
  const isAdminUser = (senderId: number) => {
    // Admin user IDs - typically ID 1 or 7 based on the project
    return senderId === 1 || senderId === 7;
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <div className={`${selectedConversationId ? 'hidden md:block' : ''} w-full md:w-80 lg:w-96 border-r flex flex-col`}>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold" data-testid="text-page-title">Support Chat</h1>
            <p className="text-sm text-muted-foreground">Chat with users</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">User chats will appear here</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.conversationId}
                  data-testid={`chat-item-${conv.conversationId}`}
                  onClick={() => setSelectedConversationId(conv.conversationId)}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b hover-elevate ${
                    selectedConversationId === conv.conversationId 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : ''
                  }`}
                >
                  <div className="flex -space-x-2">
                    <UserAvatar name={conv.user1.name} avatar={conv.user1.avatar} size="sm" isAdmin={isAdminUser(conv.user1.id)} />
                    <UserAvatar name={conv.user2.name} avatar={conv.user2.avatar} size="sm" isAdmin={isAdminUser(conv.user2.id)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {conv.user1.name} & {conv.user2.name}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage?.type === "image" && "Photo"}
                      {conv.lastMessage?.type === "video" && "Video"}
                      {conv.lastMessage?.type === "document" && "Document"}
                      {conv.lastMessage?.type === "text" && conv.lastMessage.content}
                      {!conv.lastMessage && "No messages"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.messageCount} messages
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${selectedConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedConversationId && selectedConversation ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversationId(null)}
                  data-testid="button-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex -space-x-2">
                  <UserAvatar name={selectedConversation.user1.name} avatar={selectedConversation.user1.avatar} size="sm" isAdmin={isAdminUser(selectedConversation.user1.id)} />
                  <UserAvatar name={selectedConversation.user2.name} avatar={selectedConversation.user2.avatar} size="sm" isAdmin={isAdminUser(selectedConversation.user2.id)} />
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.user1.name} & {selectedConversation.user2.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.user1.email} & {selectedConversation.user2.email}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messagesData?.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages in this conversation</p>
                  </div>
                ) : (
                  messagesData?.messages.map((msg) => {
                    const isAdmin = isAdminUser(msg.senderId);
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <UserAvatar 
                            name={msg.sender?.name} 
                            avatar={msg.sender?.avatar} 
                            size="sm"
                            isAdmin={false}
                          />
                        )}
                        <div className={`max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`px-4 py-2 rounded-2xl ${
                              isAdmin 
                                ? 'bg-green-600 text-white rounded-br-md' 
                                : 'bg-white dark:bg-gray-800 text-foreground rounded-bl-md shadow-sm'
                            }`}
                          >
                            {renderMessageContent(msg, isAdmin)}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-muted-foreground">
                              {msg.sender?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.createdAt), "h:mm a")}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <UserAvatar 
                            name={msg.sender?.name} 
                            avatar={msg.sender?.avatar} 
                            size="sm"
                            isAdmin={true}
                          />
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-background">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="icon"
                    className="h-11 w-11 bg-green-600 hover:bg-green-700"
                    data-testid="button-send"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-muted-foreground mt-1">
                Choose a conversation to view and reply to messages
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminUserChats() {
  return (
    <AdminGuard>
      <AdminUserChatsContent />
    </AdminGuard>
  );
}
