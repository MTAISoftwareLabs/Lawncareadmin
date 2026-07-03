import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { MemberLayout } from "@/components/MemberLayout";
import { MemberGuard } from "@/components/MemberGuard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bot, Copy, Loader2, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
}

function AiChatContent() {
  const { isPremium } = useSubscription();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isPremium) {
    return (
      <MemberLayout>
        <Card className="p-8 text-center">
          <Bot className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="text-2xl font-bold">AI Turf Talk</h1>
          <p className="mt-2 text-muted-foreground">
            Premium members can chat with the lawn care AI assistant — same feature as the mobile app.
          </p>
          <Link href="/pricing">
            <Button className="mt-6">Upgrade to premium</Button>
          </Link>
        </Card>
      </MemberLayout>
    );
  }

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: prompt, isUser: true },
    ]);
    setLoading(true);

    try {
      const response = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const content = response?.data?.content;
      if (!content) throw new Error("No response from AI");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), content, isUser: false },
      ]);
    } catch (error: any) {
      toast({
        title: "AI error",
        description: error?.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-3xl flex-col">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">AI Turf Talk</h1>
            <p className="text-sm text-muted-foreground">Powered by your admin-configured OpenAI key</p>
          </div>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="mb-3 h-12 w-12 text-green-600" />
                <p className="font-medium text-foreground">Ask anything about lawn care</p>
                <p className="mt-1 text-sm">Why does my lawn look purple in patches?</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.isUser
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {!message.isUser && (
                    <button
                      type="button"
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your lawn care question..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MemberLayout>
  );
}

export function AiChatPage() {
  return (
    <MemberGuard>
      <AiChatContent />
    </MemberGuard>
  );
}
