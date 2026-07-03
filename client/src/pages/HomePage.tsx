import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Star,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  User,
  Leaf,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AppStoreButtons } from "@/components/AppStoreButtons";
import { LandingBannerCarousel } from "@/components/landing/LandingBannerCarousel";
import { LandingAppCategories } from "@/components/landing/LandingAppCategories";
import { AppImage } from "@/components/media/AppImage";
import { fetchHomeData } from "@/lib/memberHome";
import logoUrl from "@assets/logo_1768933994269.jpeg";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  title: string;
  content: string;
  isFeatured?: boolean;
}

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

interface LandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  heroImage2: string | null;
  heroButtonText: string;
  heroBadgeText: string;
  primaryColor: string;
  monthlyPrice: string;
  yearlyPrice: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  intervalType: string;
  trialDays: number | null;
  features: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md px-2 py-4 text-left hover-elevate"
        data-testid={`faq-toggle-${faq.id}`}
      >
        <span className="pr-4 font-medium text-foreground">{faq.question}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-2 pb-4 text-muted-foreground"
        >
          {faq.answer}
        </motion.div>
      )}
    </div>
  );
}

function parseFeatures(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

export function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: authData } = useQuery({ queryKey: ["/api/auth/me"], retry: false });
  const user = authData?.user;

  const { data: settings } = useQuery<LandingSettings>({
    queryKey: ["/api/settings/landing-page"],
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ["/api/faqs"],
  });

  const { data: home } = useQuery({
    queryKey: ["home-data"],
    queryFn: fetchHomeData,
  });

  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/stripe/plans"],
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const siteName = settings?.siteName || "Lawncare Workshop";
  const logo = settings?.logoUrl || logoUrl;
  const heroBg = settings?.heroImage || "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920";
  const monthlyPlan = plans.find((p) => p.slug === "monthly");
  const yearlyPlan = plans.find((p) => p.slug === "yearly");
  const monthlyPrice = monthlyPlan?.price || settings?.monthlyPrice || "9.99";
  const yearlyPrice = yearlyPlan?.price || settings?.yearlyPrice || "89.99";
  const yearlyMonthly = (Number(yearlyPrice) / 12).toFixed(2);
  const featuredTestimonials = testimonials.filter((t) => t.isFeatured).slice(0, 3);
  const banners = home?.banners ?? [];
  const heroFallbackImages = [
    settings?.heroImage,
    settings?.heroImage2,
    heroBg,
    "https://images.unsplash.com/photo-1592419044706-39796d40bcae?w=1920",
  ].filter(Boolean) as string[];

  const navLinkClass =
    "text-sm font-medium text-white/90 transition-colors hover:text-white";
  const heroButtonOutline =
    "border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white";

  return (
    <div className="min-h-screen bg-background">
      {/* Unified header + hero — nav overlays the banner carousel */}
      <section className="relative w-full">
        <LandingBannerCarousel
          variant="hero"
          banners={banners}
          fallbackImages={heroFallbackImages}
          overlay={
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <Badge className="mb-4 border-white/30 bg-white/15 text-white hover:bg-white/15">
                {settings?.heroBadgeText || "Built for Cool-Season Lawns"}
              </Badge>
              <h1 className="mb-4 max-w-3xl text-3xl font-bold leading-tight drop-shadow md:text-5xl lg:text-6xl">
                {settings?.heroTitle || "Master Your Lawn With Confidence"}
              </h1>
              <p className="mb-6 max-w-2xl text-base text-white/90 drop-shadow md:text-lg">
                {settings?.heroSubtitle ||
                  "Professional lawn care guidance from TurfguyRoss, a golf course superintendent with 30+ years of experience."}
              </p>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/signup">
                  <Button size="lg" className="w-full gap-2 bg-white text-green-800 hover:bg-white/90 sm:w-auto" data-testid="hero-cta-primary">
                    {settings?.heroButtonText || "Start Your 7-Day Free Trial"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app">
                  <Button size="lg" variant="outline" className={`w-full sm:w-auto ${heroButtonOutline}`}>
                    <Leaf className="mr-2 h-4 w-4" />
                    Open Web App
                  </Button>
                </Link>
              </div>

              <AppStoreButtons
                appStoreUrl={settings?.appStoreUrl}
                playStoreUrl={settings?.playStoreUrl}
                size="md"
                className="mb-4"
              />

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  7-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  iOS & Android apps
                </span>
              </div>
            </motion.div>
          }
        />

        <header
          className={`absolute inset-x-0 top-0 z-50 transition-colors ${
            mobileMenuOpen ? "bg-black/90 backdrop-blur-md" : "bg-gradient-to-b from-black/60 via-black/30 to-transparent"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between md:h-20">
              <Link href="/" className="flex items-center gap-2">
                <AppImage src={logo} alt={siteName} className="h-10 w-10 rounded-full border-2 border-white/30 object-cover shadow-md" />
                <span className="text-xl font-bold text-white drop-shadow">{siteName}</span>
              </Link>

              <div className="hidden items-center gap-6 md:flex">
                <Link href="/lessons" className={navLinkClass}>Lessons</Link>
                <Link href="/deals" className={navLinkClass}>Deals</Link>
                <Link href="/blog" className={navLinkClass}>Blog</Link>
                <Link href="#explore" className={navLinkClass}>Features</Link>
                <Link href="/pricing" className={navLinkClass}>Pricing</Link>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/app">
                      <Button className="bg-white text-green-800 hover:bg-white/90">Open App</Button>
                    </Link>
                    <Link href="/app/profile">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                        <User className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Log In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-white text-green-800 hover:bg-white/90">Start Free Trial</Button>
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/10 py-4 md:hidden"
              >
                <div className="flex flex-col gap-4">
                  <Link href="/lessons" className="py-2 text-white/90" onClick={() => setMobileMenuOpen(false)}>Lessons</Link>
                  <Link href="/deals" className="py-2 text-white/90" onClick={() => setMobileMenuOpen(false)}>Deals</Link>
                  <Link href="/blog" className="py-2 text-white/90" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                  <Link href="#explore" className="py-2 text-white/90" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                  <Link href="/pricing" className="py-2 text-white/90" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                  <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
                    {user ? (
                      <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-white text-green-800 hover:bg-white/90">Open App</Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className={`w-full ${heroButtonOutline}`}>Log In</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full bg-white text-green-800 hover:bg-white/90">Start Free Trial</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </header>
      </section>

      {/* Mobile app categories — same grid as the app home screen */}
      <LandingAppCategories home={home} />

      {/* Recent video lessons from CMS */}
      {home?.videos && home.videos.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Video lessons</h2>
                <p className="text-sm text-muted-foreground">From the same library as the mobile app</p>
              </div>
              <Link href="/lessons" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {home.videos.slice(0, 4).map((video) => (
                <Link key={video.id} href="/lessons">
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    {video.thumbnail_url ? (
                      <AppImage src={video.thumbnail_url} alt={video.name || "Video lesson"} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="flex h-36 items-center justify-center bg-green-100">
                        <Play className="h-10 w-10 text-green-600" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <p className="line-clamp-2 text-sm font-medium">{video.name || "Video lesson"}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download apps CTA */}
      {(settings?.appStoreUrl || settings?.playStoreUrl) && (
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Get the mobile app</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Take TurfguyRoss with you — weather alerts, AI diagnosis, and your full lawn library in your pocket.
            </p>
            <AppStoreButtons appStoreUrl={settings.appStoreUrl} playStoreUrl={settings.playStoreUrl} size="lg" className="justify-center" />
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-20 bg-muted/30" id="pricing">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Start with a free trial. Subscribe on web or in the app.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Card className="h-full border-border">
              <CardHeader>
                <CardTitle className="text-2xl">{monthlyPlan?.name || "Monthly"}</CardTitle>
                <CardDescription>{monthlyPlan?.description || "Perfect for trying things out"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">${monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {(parseFeatures(monthlyPlan?.features ?? null).length > 0
                    ? parseFeatures(monthlyPlan?.features ?? null)
                    : ["Personalized lawn care plans", "All premium video lessons", "AI lawn diagnosis", "Expert Q&A access"]
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"><Button variant="outline" className="w-full">Start Free Trial</Button></Link>
              </CardContent>
            </Card>

            <Card className="relative h-full overflow-visible border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{yearlyPlan?.name || "Yearly"}</CardTitle>
                <CardDescription>{yearlyPlan?.description || "Best value for serious lawn enthusiasts"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">${yearlyPrice}</span>
                  <span className="text-muted-foreground">/year</span>
                  <div className="mt-1 text-sm font-medium text-primary">About ${yearlyMonthly}/month</div>
                </div>
                <ul className="mb-6 space-y-3">
                  {(parseFeatures(yearlyPlan?.features ?? null).length > 0
                    ? parseFeatures(yearlyPlan?.features ?? null)
                    : ["Everything in Monthly", "Priority expert support", "Early access to new features", "2 months free vs monthly"]
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup?plan=yearly"><Button className="w-full">Start Free Trial</Button></Link>
              </CardContent>
            </Card>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/pricing" className="text-primary hover:underline">View full pricing & checkout options →</Link>
          </p>
        </div>
      </section>

      {/* Blog preview */}
      {blogPosts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">From the blog</h2>
                <p className="text-muted-foreground">Tips from TurfguyRoss and the workshop team</p>
              </div>
              <Link href="/blog" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      {post.category && <Badge variant="outline" className="mb-2">{post.category}</Badge>}
                      <h3 className="mb-2 font-semibold text-foreground line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Loved by Lawn Enthusiasts</h2>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {featuredTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="h-full border-border">
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{testimonial.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
              <Link href="/help-center" className="text-sm text-primary hover:underline">Visit help center →</Link>
            </div>
            <div className="mx-auto max-w-2xl">
              <Card className="border-border">
                <CardContent className="p-6">
                  {faqs.slice(0, 8).map((faq) => (
                    <FAQItem key={faq.id} faq={faq} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Transform Your Lawn?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            {settings?.tagline || "Join homeowners who've achieved the lawn of their dreams with expert guidance."}
          </p>
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                {settings?.heroButtonText || "Start Your Free Trial"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <AppStoreButtons
            appStoreUrl={settings?.appStoreUrl}
            playStoreUrl={settings?.playStoreUrl}
            size="md"
            className="justify-center"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <AppImage src={logo} alt={siteName} className="h-10 w-10 rounded-full object-cover" />
                <span className="text-lg font-bold text-foreground">{siteName}</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{settings?.tagline}</p>
              <AppStoreButtons appStoreUrl={settings?.appStoreUrl} playStoreUrl={settings?.playStoreUrl} size="sm" />
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Learn</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/lessons" className="hover:text-foreground">Video Lessons</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/app/diagnosis" className="hover:text-foreground">Lawn Diagnosis</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/app/competitions" className="hover:text-foreground">Competitions</Link></li>
                <li><Link href="/deals" className="hover:text-foreground">Product Deals</Link></li>
                <li><Link href="/app/questions" className="hover:text-foreground">Expert Q&A</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help-center" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/page/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
