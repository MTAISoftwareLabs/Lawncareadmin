import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mail, Clock, MessageSquare, Send, Loader2 } from "lucide-react";

export default function Contact() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: supportSettings } = useQuery({
    queryKey: ["support-settings"],
    queryFn: async () => {
      const response = await fetch("/api/support/settings");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const startChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/support/start-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to start chat");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.status && data.data?.conversationId) {
        navigate(`/chat?conversation=${data.data.conversationId}`);
      }
    },
    onError: () => {
      alert("Failed to start chat. Please try again.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      alert("Your message has been sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    
    submitMutation.mutate(formData);
  };

  const handleStartChat = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    startChatMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-green-100 text-lg">
            We're here to help! Get in touch with our support team.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="space-y-6 mb-8">
              <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Live Chat Support</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {user ? "Chat directly with our support team" : "Log in to chat with our support team"}
                    </p>
                    <Button
                      onClick={handleStartChat}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={startChatMutation.isPending}
                      data-testid="button-start-chat"
                    >
                      {startChatMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      {user ? "Start Chat" : "Log in to Chat"}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone Support</h3>
                    <p className="text-muted-foreground">
                      {supportSettings?.supportPhone || "+1 (555) 123-4567"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Call us during business hours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-muted-foreground">
                      {supportSettings?.supportEmail || "support@lawncareworkshop.com"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      {supportSettings?.businessHours || "Mon-Fri: 9:00 AM - 6:00 PM EST"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Closed on weekends and holidays
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:border-green-600 focus:outline-none bg-background"
                    placeholder="Your full name"
                    data-testid="input-contact-name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:border-green-600 focus:outline-none bg-background"
                    placeholder="your.email@example.com"
                    data-testid="input-contact-email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:border-green-600 focus:outline-none bg-background"
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-contact-phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:border-green-600 focus:outline-none bg-background"
                    placeholder="How can we help you?"
                    data-testid="input-contact-subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:border-green-600 focus:outline-none resize-none bg-background"
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                    data-testid="textarea-contact-message"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-contact"
                >
                  <Send className="mr-2 h-5 w-5" />
                  {submitMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
