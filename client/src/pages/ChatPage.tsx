import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, Send, ArrowLeft, User, Image, 
  Paperclip, Phone, Video, MoreVertical, Search,
  Plus, Check, CheckCheck
} from "lucide-react";
import type { EmbeddedPageProps } from "@/components/MemberPageWrapper";
import { PageShell, PageContainer } from "@/components/MemberPageWrapper";

interface Conversation {
  id: number;
  recipientId: number;
  recipientName: string;
  recipientAvatar: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  messageType: string;
  content: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isRead: boolean;
  createdAt: string;
}

export function ChatPage({ embedded = false }: EmbeddedPageProps = {}) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/chats"],
  });

  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      return apiRequest(`/api/chats/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          messageType: "text",
          content,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", selectedConversation?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setNewMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, refetchMessages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr).id;
      } catch {
        return null;
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  const filteredConversations = conversations?.filter((conv) =>
    conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUserId) {
    return (
      <PageShell embedded={embedded}>
        {!embedded && <Navbar />}
        <PageContainer embedded={embedded} className={embedded ? "py-16 text-center" : ""}>
          <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">Please login to access your messages</p>
          <Button onClick={() => navigate("/login")} data-testid="button-login">
            Login
          </Button>
        </PageContainer>
      </PageShell>
    );
  }

  return (
    <PageShell embedded={embedded}>
      {!embedded && <Navbar />}
      <PageContainer embedded={embedded} className={embedded ? "py-4 h-[calc(100vh-12rem)]" : "py-4 h-[calc(100vh-80px)]"}>
        <div className="flex h-full gap-4">
          <Card className={`${selectedConversation ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96`}>
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <span>Messages</span>
                <Button size="icon" variant="ghost" data-testid="button-new-chat">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {conversationsLoading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-center gap-3 hover-elevate text-left ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                      data-testid={`conversation-${conv.id}`}
                    >
                      <Avatar>
                        <AvatarImage src={conv.recipientAvatar || undefined} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{conv.recipientName}</span>
                          {conv.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage || "No messages yet"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedConversation ? (
            <Card className="flex flex-col flex-1">
              <CardHeader className="flex-shrink-0 flex flex-row items-center gap-4 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                  data-testid="button-back-to-list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedConversation.recipientAvatar || undefined} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedConversation.recipientName}</h3>
                  <p className="text-sm text-muted-foreground">Active now</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? "w-2/3 ml-auto" : "w-2/3"}`} />
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <>
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === currentUserId;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              {message.messageType === "text" && (
                                <p>{message.content}</p>
                              )}
                              {message.messageType === "image" && message.mediaUrl && (
                                <img src={message.mediaUrl} alt="Shared" className="rounded-lg max-w-full" />
                              )}
                              {message.messageType === "video" && message.mediaUrl && (
                                <video
                                  src={message.mediaUrl}
                                  controls
                                  className="rounded-lg max-w-full"
                                  poster={message.thumbnailUrl || undefined}
                                />
                              )}
                              {message.messageType === "document" && (
                                <a
                                  href={message.mediaUrl || "#"}
                                  className="flex items-center gap-2 text-sm underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Paperclip className="w-4 h-4" />
                                  {message.fileName || "Document"}
                                </a>
                              )}
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isOwn ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                              }`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isOwn && (
                                  message.isRead ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="flex-shrink-0 p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newMessage.trim()) {
                        sendMessageMutation.mutate({
                          conversationId: selectedConversation.id,
                          content: newMessage,
                        });
                      }
                    }}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button
                    size="icon"
                    onClick={() =>
                      sendMessageMutation.mutate({
                        conversationId: selectedConversation.id,
                        content: newMessage,
                      })
                    }
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </Card>
          )}
        </div>
      </PageContainer>
    </PageShell>
  );
}
