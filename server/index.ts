import express from "express";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./routes";
import { seedDatabaseIfEmpty } from "./seed";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { isLocalStorageMode, registerLocalObjectStorageRoutes } from "./localObjectStorage";
import { runSchemaMigrations } from "./dbMigrations";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq, and } from "drizzle-orm";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect production using REPLIT_DEPLOYMENT or NODE_ENV
const isProduction = process.env.REPLIT_DEPLOYMENT === "1" || process.env.NODE_ENV === "production";
// Use PORT env var in production, fallback to 3000 for both environments
const PORT = parseInt(process.env.PORT || '3000', 10);

// Validate required environment variables in production
if (isProduction) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DEPLOYMENT ERROR: Missing DATABASE_URL');
    process.exit(1);
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ DEPLOYMENT ERROR: Missing JWT_SECRET');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  
  // Log database connection info (masking password for security)
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlMasked = dbUrl.replace(/:[^:@]+@/, ':***@'); // Mask password
  
  console.log('🗄️  Database URL:', dbUrlMasked);
  
  // Extract database host to verify which database we're connecting to
  const hostMatch = dbUrl.match(/@([^/]+)/);
  if (hostMatch) {
    console.log('📍 Database Host:', hostMatch[1]);
  }
}

if (!isProduction) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });
}

// Stripe webhook route MUST be registered BEFORE express.json()
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin/competitions')) {
    console.log(`[REQUEST] ${req.method} ${req.path}`);
  }
  next();
});

// Serve uploaded files (legacy - local filesystem, will be removed after migration)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Serve attached assets (generated images, etc.)
app.use('/attached_assets', express.static(join(__dirname, '../attached_assets')));

// Register object storage routes for persistent file storage.
// Local disk on a VPS, Replit Object Storage on Replit — auto-detected.
if (isLocalStorageMode()) {
  registerLocalObjectStorageRoutes(app);
} else {
  registerObjectStorageRoutes(app);
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running", timestamp: new Date().toISOString() });
});

// Root health check for deployment
app.get("/", (req, res, next) => {
  // In production, this is handled by static file serving
  // In dev or if no static files, return health check
  if (!isProduction) {
    return res.json({ status: "ok" });
  }
  next();
});

app.use(routes);

if (isProduction) {
  const distPath = join(__dirname, "../client/dist");
  app.use(express.static(distPath));
  
  // SPA fallback middleware - serves index.html for all non-API routes
  app.use((req, res, next) => {
    // Don't handle API routes or static file requests
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(join(distPath, "index.html"));
  });
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Multer upload errors (file too large, etc.) — return a clear message
  // instead of a confusing generic 500.
  if (err && err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ status: false, error: "File is too large. Please choose a smaller file." });
    }
    return res.status(400).json({ status: false, error: err.message || "Upload failed" });
  }
  // File-type rejections from our multer fileFilter throw a plain Error.
  if (err && typeof err.message === "string" && /Only .* are allowed|Unsupported file type/.test(err.message)) {
    return res.status(400).json({ status: false, error: err.message });
  }
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const HOST = '0.0.0.0'; // Bind to all interfaces for better proxy compatibility

// Initialize Stripe schema and sync data (runs in background, non-blocking)
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('⚠️  DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('✅ Stripe schema ready');

    const stripeSync = await getStripeSync();
    
    // If Stripe is not configured, skip the rest
    if (!stripeSync) {
      console.log('⚠️  Stripe not configured, app will run without payment features');
      return;
    }

    console.log('Setting up managed webhook...');
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    if (webhookBaseUrl && webhookBaseUrl !== 'https://undefined') {
      try {
        const { webhook } = await stripeSync.findOrCreateManagedWebhook(
          `${webhookBaseUrl}/api/stripe/webhook`
        );
        console.log(`✅ Webhook configured: ${webhook.url}`);
      } catch (webhookError) {
        console.log('⚠️  Webhook setup skipped:', webhookError);
      }
    }

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => console.log('✅ Stripe data synced'))
      .catch((err: any) => console.log('⚠️  Stripe data sync skipped:', err.message));
  } catch (error: any) {
    console.log('⚠️  Stripe initialization skipped:', error.message);
  }
}

// Start server with error handling - Server starts FIRST for fast health checks
async function startServer() {
  // Start HTTP server immediately for health checks
  const server = app.listen(PORT, HOST, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server successfully started`);
    console.log(`📍 Host: ${HOST}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'development'}`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
    
    if (isProduction) {
      console.log(`🚀 Production server ready for external traffic`);
      console.log(`📦 Serving static files from: client/dist`);
      console.log(`🔗 API routes: /api/*`);
    } else {
      console.log(`🛠️  Development mode`);
      console.log(`🔗 API endpoints: http://${HOST}:${PORT}/api/*`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Run background initialization AFTER server is listening
    runBackgroundInit();
  });

  // Handle server errors
  server.on('error', (error: any) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ SERVER ERROR:');
    
    if (error.code === 'EADDRINUSE') {
      console.error(`   Port ${PORT} is already in use`);
      console.error(`   Try a different port or stop the conflicting process`);
    } else if (error.code === 'EACCES') {
      console.error(`   Permission denied for port ${PORT}`);
      console.error(`   Try using a port above 1024`);
    } else {
      console.error(`   ${error.message}`);
      console.error(`   Code: ${error.code}`);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Auto-complete competitions that have ended and mark winners
async function autoCompleteCompetitions() {
  try {
    const { competitions, competitionEntries } = await import('../shared/schema');
    const { db } = await import('./db');
    const { eq, and, lte, desc, ne } = await import('drizzle-orm');
    
    // Find competitions that have ended but not yet completed
    // Uses status != 'completed' to prevent reprocessing
    const endedCompetitions = await db.select().from(competitions)
      .where(and(
        lte(competitions.endDate, new Date()),
        ne(competitions.status, 'completed')
      ));
    
    for (const comp of endedCompetitions) {
      // Get top voted entry
      const [topEntry] = await db.select().from(competitionEntries)
        .where(eq(competitionEntries.competitionId, comp.id))
        .orderBy(desc(competitionEntries.votes))
        .limit(1);
      
      if (topEntry) {
        // Mark winner and set status to completed
        await db.update(competitions)
          .set({ winnerId: topEntry.userId, status: 'completed', isActive: false })
          .where(eq(competitions.id, comp.id));
        
        await db.update(competitionEntries)
          .set({ isWinner: true, rank: 1 })
          .where(eq(competitionEntries.id, topEntry.id));
        
        console.log(`Competition "${comp.title}" completed. Winner: User ${topEntry.userId}`);
      } else {
        // No entries, mark as completed to prevent reprocessing
        await db.update(competitions)
          .set({ status: 'completed', isActive: false })
          .where(eq(competitions.id, comp.id));
        console.log(`Competition "${comp.title}" completed with no entries.`);
      }
    }
  } catch (error) {
    console.error('Error auto-completing competitions:', error);
  }
}

// Background initialization - runs after server is listening
async function runBackgroundInit() {
  try {
    // Run schema migrations first (adds any missing columns)
    await runSchemaMigrations();
    
    // Seed database on startup (idempotent - only seeds if empty)
    await seedDatabaseIfEmpty();
    
    // Ensure admin user name is "Admin"
    try {
      await db.update(users)
        .set({ name: "Admin" })
        .where(and(eq(users.role, "admin"), eq(users.email, "lapagebrands@gmail.com")));
      console.log('✅ Admin user name verified as "Admin"');
    } catch (e) {
      console.log('⚠️  Could not update admin name:', e);
    }
    
    // Initialize Stripe integration (optional, won't block app)
    await initStripe();
    
    // Run competition auto-completion check
    await autoCompleteCompetitions();
    
    // Schedule competition check every hour
    setInterval(autoCompleteCompetitions, 60 * 60 * 1000);
    
    console.log('✅ Background initialization complete');
  } catch (error: any) {
    console.log('⚠️  Background initialization error (non-fatal):', error.message);
  }
}

// Start the server
startServer();
