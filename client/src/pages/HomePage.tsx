import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Play, Sun, Droplets, Calendar, Camera, ShoppingBag, 
  MessageCircle, Trophy, CheckCircle, Star, ArrowRight, 
  Thermometer, CloudSun, ChevronDown, Menu, X, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import logoUrl from "@assets/logo_1768933994269.jpeg";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  title: string;
  content: string;
}

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface SiteSettings {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
}

const features = [
  {
    icon: Calendar,
    title: "Personalized Lawn Plans",
    description: "Custom care schedules based on your region, grass type, and local weather conditions."
  },
  {
    icon: Play,
    title: "Video Lessons",
    description: "Expert tutorials from TurfguyRoss, a golf course superintendent with 30+ years experience."
  },
  {
    icon: Camera,
    title: "AI Lawn Diagnosis",
    description: "Upload photos to identify weeds, diseases, and pests. Get treatment recommendations instantly."
  },
  {
    icon: Thermometer,
    title: "Soil Temperature Tracking",
    description: "Real-time soil temps to time your applications perfectly for maximum effectiveness."
  },
  {
    icon: ShoppingBag,
    title: "Product Deals",
    description: "Curated deals on fertilizers, seeds, and equipment from trusted retailers."
  },
  {
    icon: Trophy,
    title: "Monthly Competitions",
    description: "Show off your lawn in our Lawn of the Month contests and win bragging rights."
  },
  {
    icon: MessageCircle,
    title: "Expert Q&A",
    description: "Get answers from lawn care professionals when you need personalized advice."
  },
  {
    icon: CloudSun,
    title: "Weather Integration",
    description: "Local forecasts and alerts help you plan treatments and watering schedules."
  }
];

const grassTypes = [
  { name: "Kentucky Bluegrass", image: "https://images.unsplash.com/photo-1558635924-b60e6954279a?w=300" },
  { name: "Tall Fescue", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300" },
  { name: "Perennial Ryegrass", image: "https://images.unsplash.com/photo-1592917963117-68f38c6c8b0a?w=300" },
  { name: "Fine Fescue", image: "https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=300" },
];

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover-elevate rounded-md px-2"
        data-testid={`faq-toggle-${faq.id}`}
      >
        <span className="font-medium text-foreground pr-4">{faq.question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-4 px-2 text-muted-foreground"
        >
          {faq.answer}
        </motion.div>
      )}
    </div>
  );
}

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const featuredTestimonials = testimonials.filter((t: any) => t.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="Lawncare Workshop" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-bold text-xl text-foreground">Lawncare Workshop</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/lessons" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-lessons">
                Lessons
              </Link>
              <Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-deals">
                Deals
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-blog">
                Blog
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button data-testid="nav-dashboard">Dashboard</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" data-testid="nav-profile">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" data-testid="nav-login">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button data-testid="nav-signup">Start Free Trial</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover-elevate rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-border"
            >
              <div className="flex flex-col gap-4">
                <Link href="/lessons" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Lessons
                </Link>
                <Link href="/deals" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Deals
                </Link>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Blog
                </Link>
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  {user ? (
                    <>
                      <Link href="/dashboard">
                        <Button className="w-full">Dashboard</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" className="w-full">Log In</Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full">Start Free Trial</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                Built for Cool-Season Lawns
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
                {settings?.heroTitle || "Master Your Lawn With Confidence"}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                {settings?.heroSubtitle || "Professional lawn care guidance from TurfguyRoss, a golf course superintendent with 30+ years of experience. Get personalized plans, expert videos, and AI-powered diagnosis tools."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="hero-cta-primary">
                    Start Your 7-Day Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="hero-cta-secondary">
                    <Play className="w-4 h-4" />
                    Watch Free Lessons
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grass Types We Support */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Designed for Cool-Season Grasses</h2>
            <p className="text-muted-foreground">Expert guidance for the most popular lawn grasses in northern climates</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {grassTypes.map((grass, index) => (
              <motion.div
                key={grass.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                  <img 
                    src={grass.image} 
                    alt={grass.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-foreground">{grass.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Everything You Need for a Perfect Lawn</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From personalized care plans to AI-powered diagnosis, we provide all the tools and knowledge you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-elevate border-border">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 7-day free trial. Cancel anytime.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Monthly</CardTitle>
                  <CardDescription>Perfect for trying things out</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${settings?.monthlyPrice || "9.99"}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Personalized lawn care plans",
                      "All premium video lessons",
                      "AI lawn diagnosis tool",
                      "Weather & soil temperature data",
                      "Expert Q&A access",
                      "Exclusive deals",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full" data-testid="pricing-monthly-cta">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Yearly Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-primary relative overflow-visible">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Best Value - Save 25%</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Yearly</CardTitle>
                  <CardDescription>Best value for serious lawn enthusiasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${settings?.yearlyPrice || "89.99"}</span>
                    <span className="text-muted-foreground">/year</span>
                    <div className="text-sm text-primary font-medium mt-1">That's just $7.50/month</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Everything in Monthly, plus:",
                      "Priority expert support",
                      "Early access to new features",
                      "Competition entry priority",
                      "Downloadable lawn care guides",
                      "2 months free vs monthly",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup?plan=yearly">
                    <Button className="w-full" data-testid="pricing-yearly-cta">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Loved by Lawn Enthusiasts</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what our members are saying about their lawn transformations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <h3 className="font-semibold mb-2 text-foreground">{testimonial.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{testimonial.name}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Got questions? We've got answers.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-6">
                  {faqs.slice(0, 6).map((faq) => (
                    <FAQItem key={faq.id} faq={faq} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Lawn?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of homeowners who've achieved the lawn of their dreams with expert guidance from TurfguyRoss.
            </p>
            <Link href="/signup">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
                data-testid="cta-signup"
              >
                Start Your Free 7-Day Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-sm opacity-75 mt-4">No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoUrl} alt="Lawncare Workshop" className="w-10 h-10 rounded-full object-cover" />
                <span className="font-bold text-lg text-foreground">Lawncare Workshop</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional lawn care guidance built for cool-season grass enthusiasts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Learn</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/lessons" className="hover:text-foreground transition-colors">Video Lessons</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/diagnosis" className="hover:text-foreground transition-colors">Lawn Diagnosis</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/competitions" className="hover:text-foreground transition-colors">Competitions</Link></li>
                <li><Link href="/deals" className="hover:text-foreground transition-colors">Product Deals</Link></li>
                <li><Link href="/expert-qa" className="hover:text-foreground transition-colors">Expert Q&A</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help-center" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link href="/page/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/page/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Lawncare Workshop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
