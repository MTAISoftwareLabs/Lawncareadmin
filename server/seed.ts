import { db } from "./db";
import { 
  users, grassTypes, videoLessons, lawnCarePlans, deals, testimonials, faqs, 
  blogPosts, siteSettings, competitions
} from "../shared/schema";
import { hashPassword } from "./auth";

export async function seedDatabaseIfEmpty() {
  try {
    console.log("Checking if database needs seeding...");
    
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping seed.");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Create admin user
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      email: "admin@lawncareworkshop.com",
      password: adminPassword,
      name: "Admin",
      role: "admin",
      subscriptionStatus: "premium"
    });
    console.log("Created admin user: admin@lawncareworkshop.com / admin123");
    
    // Create grass types
    const grassTypesData = [
      { name: "Kentucky Bluegrass", category: "cool-season", description: "Premium lawn grass known for its rich color and dense growth", idealTemperature: "60-75°F", waterNeeds: "Medium-High", sunRequirements: "Full Sun", maintenanceLevel: "Medium", isActive: true },
      { name: "Tall Fescue", category: "cool-season", description: "Durable grass with deep roots, great for high-traffic areas", idealTemperature: "60-80°F", waterNeeds: "Medium", sunRequirements: "Full Sun to Part Shade", maintenanceLevel: "Low-Medium", isActive: true },
      { name: "Perennial Ryegrass", category: "cool-season", description: "Fast-germinating grass with fine texture", idealTemperature: "55-75°F", waterNeeds: "Medium", sunRequirements: "Full Sun", maintenanceLevel: "Medium", isActive: true },
      { name: "Fine Fescue", category: "cool-season", description: "Shade-tolerant grass with fine blades", idealTemperature: "50-70°F", waterNeeds: "Low-Medium", sunRequirements: "Part Shade to Shade", maintenanceLevel: "Low", isActive: true },
      { name: "Creeping Bentgrass", category: "cool-season", description: "Premium putting green grass requiring high maintenance", idealTemperature: "55-65°F", waterNeeds: "High", sunRequirements: "Full Sun", maintenanceLevel: "High", isActive: true }
    ];
    await db.insert(grassTypes).values(grassTypesData);
    console.log("Created 5 grass types");
    
    // Create video lessons
    const lessonsData = [
      { title: "Introduction to Cool-Season Lawns", description: "Learn the basics of maintaining cool-season grasses", videoUrl: "https://example.com/video1", category: "Basics", difficulty: "beginner", instructor: "TurfguyRoss", isPremium: false, displayOrder: 1, isActive: true },
      { title: "Understanding Soil Temperature", description: "How to use soil temperature for optimal lawn treatments", videoUrl: "https://example.com/video2", category: "Science", difficulty: "intermediate", instructor: "TurfguyRoss", isPremium: false, displayOrder: 2, isActive: true },
      { title: "Spring Lawn Revival Guide", description: "Step-by-step guide to bring your lawn back after winter", videoUrl: "https://example.com/video3", category: "Seasonal", difficulty: "beginner", instructor: "TurfguyRoss", isPremium: true, displayOrder: 3, isActive: true },
      { title: "Proper Mowing Techniques", description: "Master the art of mowing for a healthier lawn", videoUrl: "https://example.com/video4", category: "Maintenance", difficulty: "beginner", instructor: "TurfguyRoss", isPremium: false, displayOrder: 4, isActive: true },
      { title: "Fertilization Fundamentals", description: "When and how to fertilize your cool-season lawn", videoUrl: "https://example.com/video5", category: "Nutrition", difficulty: "intermediate", instructor: "TurfguyRoss", isPremium: true, displayOrder: 5, isActive: true },
      { title: "Weed Identification & Control", description: "Identify common weeds and learn control strategies", videoUrl: "https://example.com/video6", category: "Problem Solving", difficulty: "intermediate", instructor: "TurfguyRoss", isPremium: true, displayOrder: 6, isActive: true },
      { title: "Aeration and Overseeding", description: "Fall lawn renovation techniques", videoUrl: "https://example.com/video7", category: "Seasonal", difficulty: "intermediate", instructor: "TurfguyRoss", isPremium: true, displayOrder: 7, isActive: true },
      { title: "Disease Prevention", description: "Protect your lawn from common diseases", videoUrl: "https://example.com/video8", category: "Problem Solving", difficulty: "advanced", instructor: "TurfguyRoss", isPremium: true, displayOrder: 8, isActive: true }
    ];
    await db.insert(videoLessons).values(lessonsData);
    console.log("Created 8 video lessons");
    
    // Create lawn care plans
    const plansData = [
      { title: "Early Spring Wake-Up", description: "First treatments of the season", season: "spring", month: 3, taskType: "fertilization", instructions: "Apply a balanced fertilizer when soil temps reach 55°F", tips: "Wait for consistent temps above 55°F before applying pre-emergent", priority: "high", isPremium: false, displayOrder: 1, isActive: true },
      { title: "Pre-Emergent Application", description: "Prevent crabgrass and other weeds", season: "spring", month: 3, taskType: "weed-control", instructions: "Apply pre-emergent when soil temps reach 50-55°F", tips: "Split applications work better than single heavy application", priority: "high", isPremium: false, displayOrder: 2, isActive: true },
      { title: "Spring Mowing Start", description: "Begin regular mowing schedule", season: "spring", month: 4, taskType: "mowing", instructions: "Set mower to 3-3.5 inches, never remove more than 1/3 of blade", tips: "Keep blades sharp for clean cuts", priority: "medium", isPremium: false, displayOrder: 3, isActive: true },
      { title: "Summer Stress Management", description: "Help your lawn survive summer heat", season: "summer", month: 7, taskType: "watering", instructions: "Water deeply and infrequently, 1-1.5 inches per week", tips: "Water early morning to reduce disease risk", priority: "high", isPremium: true, displayOrder: 4, isActive: true },
      { title: "Fall Aeration", description: "Core aeration for root development", season: "fall", month: 9, taskType: "aeration", instructions: "Core aerate when soil is moist but not saturated", tips: "Leave cores on lawn to decompose naturally", priority: "high", isPremium: true, displayOrder: 5, isActive: true },
      { title: "Fall Overseeding", description: "Thicken your lawn before winter", season: "fall", month: 9, taskType: "seeding", instructions: "Overseed immediately after aeration", tips: "Keep seed moist until germination (7-21 days)", priority: "high", isPremium: true, displayOrder: 6, isActive: true },
      { title: "Winterizer Application", description: "Final fertilization of the year", season: "fall", month: 11, taskType: "fertilization", instructions: "Apply high-potassium fertilizer before first hard freeze", tips: "This is the most important fertilization of the year", priority: "high", isPremium: true, displayOrder: 7, isActive: true }
    ];
    await db.insert(lawnCarePlans).values(plansData);
    console.log("Created 7 lawn care plans");
    
    // Create deals
    const dealsData = [
      { title: "Scotts Turf Builder 40lb Bag", description: "Premium lawn fertilizer for all grass types", originalPrice: "59.99", salePrice: "44.99", discountPercent: 25, store: "Home Depot", storeUrl: "https://homedepot.com", category: "Fertilizer", isFeatured: true, isActive: true },
      { title: "Sun Joe Electric Dethatcher", description: "13-inch electric scarifier and dethatcher", originalPrice: "129.99", salePrice: "89.99", discountPercent: 31, store: "Amazon", storeUrl: "https://amazon.com", category: "Equipment", isFeatured: true, isActive: true },
      { title: "Jonathan Green Grass Seed", description: "Black Beauty Ultra grass seed mix", originalPrice: "89.99", salePrice: "69.99", discountPercent: 22, store: "Ace Hardware", storeUrl: "https://acehardware.com", category: "Seed", isFeatured: false, isActive: true },
      { title: "Milorganite Organic Fertilizer", description: "Slow-release organic nitrogen fertilizer 32lb", originalPrice: "24.99", salePrice: "18.99", discountPercent: 24, store: "Lowes", storeUrl: "https://lowes.com", category: "Fertilizer", isFeatured: true, isActive: true }
    ];
    await db.insert(deals).values(dealsData);
    console.log("Created 4 deals");
    
    // Create testimonials
    const testimonialsData = [
      { name: "Mike Johnson", location: "Ohio", rating: 5, title: "Best lawn I've ever had!", content: "Following TurfguyRoss's advice, my lawn went from patchy and thin to the envy of the neighborhood in just one season.", isFeatured: true, isActive: true },
      { name: "Sarah Williams", location: "Pennsylvania", rating: 5, title: "Finally understand lawn care", content: "The video lessons break everything down so simply. I used to be intimidated by lawn care but now I actually enjoy it!", isFeatured: true, isActive: true },
      { name: "David Chen", location: "Michigan", rating: 5, title: "Worth every penny", content: "The premium subscription paid for itself in the first month. No more guessing on treatments or timing.", isFeatured: false, isActive: true },
      { name: "Jennifer Brown", location: "Illinois", rating: 5, title: "Expert advice that works", content: "The diagnosis tool helped me identify a fungus issue before it spread. Saved my entire lawn!", isFeatured: true, isActive: true },
      { name: "Robert Taylor", location: "Indiana", rating: 5, title: "Professional results at home", content: "30 years of golf course experience shows in every video. My lawn looks like a putting green now.", isFeatured: false, isActive: true }
    ];
    await db.insert(testimonials).values(testimonialsData);
    console.log("Created 5 testimonials");
    
    // Create FAQs
    const faqsData = [
      { category: "Getting Started", question: "What grass types does this app support?", answer: "Lawncare Workshop is specifically designed for cool-season grasses including Kentucky Bluegrass, Tall Fescue, Perennial Ryegrass, Fine Fescue, and Creeping Bentgrass.", displayOrder: 1, isActive: true },
      { category: "Getting Started", question: "How do I know which grass type I have?", answer: "Use our grass identification tool or upload a photo for analysis. Most cool-season lawns in the northern US are Kentucky Bluegrass, Tall Fescue, or a mix.", displayOrder: 2, isActive: true },
      { category: "Subscription", question: "What's included in the premium subscription?", answer: "Premium includes all video lessons, personalized care plans, unlimited diagnoses, direct expert access, and exclusive deals. Monthly ($9.99) or yearly ($89.99) options available.", displayOrder: 3, isActive: true },
      { category: "Subscription", question: "Can I cancel my subscription anytime?", answer: "Yes! You can cancel anytime from your account settings. You'll continue to have access until the end of your billing period.", displayOrder: 4, isActive: true },
      { category: "Lawn Care", question: "When should I fertilize my lawn?", answer: "For cool-season grasses, the best times are early spring (when soil reaches 55°F), early fall, and late fall (winterizer). Avoid fertilizing in summer heat.", displayOrder: 5, isActive: true },
      { category: "Lawn Care", question: "How often should I water my lawn?", answer: "Water deeply but infrequently - about 1 to 1.5 inches per week including rainfall. This encourages deep root growth.", displayOrder: 6, isActive: true }
    ];
    await db.insert(faqs).values(faqsData);
    console.log("Created 6 FAQs");
    
    // Create blog posts
    const blogData = [
      { title: "5 Spring Lawn Care Mistakes to Avoid", slug: "spring-lawn-care-mistakes", excerpt: "Don't sabotage your lawn this spring. Here are the most common mistakes I see homeowners make.", content: "Spring is an exciting time for lawn enthusiasts, but it's also when many homeowners make critical errors that set their lawns up for failure...", category: "Seasonal Tips", author: "TurfguyRoss", isPublished: true, publishedAt: new Date() },
      { title: "Understanding Soil Temperature for Lawn Treatments", slug: "soil-temperature-guide", excerpt: "Why soil temperature matters more than air temperature for your lawn care timing.", content: "One of the biggest secrets in professional turf management is understanding soil temperature. While most homeowners watch the weather forecast, pros are checking soil temps...", category: "Science", author: "TurfguyRoss", isPublished: true, publishedAt: new Date() },
      { title: "The Ultimate Guide to Fall Aeration and Overseeding", slug: "fall-aeration-overseeding", excerpt: "Transform your lawn with these proven fall renovation techniques.", content: "Fall is the absolute best time to renovate your cool-season lawn. The combination of warm soil and cool air creates perfect conditions for grass seed germination...", category: "Seasonal Tips", author: "TurfguyRoss", isPublished: true, publishedAt: new Date() }
    ];
    await db.insert(blogPosts).values(blogData);
    console.log("Created 3 blog posts");
    
    // Create site settings
    await db.insert(siteSettings).values({
      siteName: "Lawncare Workshop",
      tagline: "Professional lawncare guidance—built for cool-season lawns",
      heroTitle: "Master Your Lawn With Confidence",
      heroSubtitle: "Professional lawn care guidance from TurfguyRoss, a golf course superintendent with 30+ years of experience",
      primaryColor: "#22c55e",
      secondaryColor: "#16a34a",
      contactEmail: "support@lawncareworkshop.com",
      monthlyPrice: "9.99",
      yearlyPrice: "89.99"
    });
    console.log("Created site settings");
    
    // Create a sample competition
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await db.insert(competitions).values({
      title: "Lawn of the Month - December 2025",
      description: "Show off your best lawn photos for a chance to win bragging rights and a $50 gift card!",
      rules: "Submit one photo of your lawn. Photos must be taken this month. Winner determined by community votes.",
      prize: "$50 Home Depot Gift Card",
      startDate: new Date(),
      endDate: nextMonth,
      votingEndsAt: nextMonth,
      status: "active",
      isActive: true
    });
    console.log("Created sample competition");
    
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
