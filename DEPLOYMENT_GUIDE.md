# 🚀 AYUSHRATNA - Universal Deployment Guide

Complete guide to deploy this Ayurvedic e-commerce platform on **any hosting platform**.

---

## 📦 What You Need

Before deploying, ensure you have:

1. ✅ **PostgreSQL Database** (Neon, Supabase, Railway, AWS RDS, etc.)
2. ✅ **Node.js v18+** runtime environment
3. ✅ **Environment Variables** configured
4. ✅ **Git repository** (GitHub, GitLab, Bitbucket)

---

## 🌍 Platform-Specific Deployment

### 1. Replit Autoscale (Easiest - Recommended)

**Perfect for: Quick deployment with zero configuration**

**Steps:**
1. Fork this project to Replit
2. Click **"Deploy"** → Select **"Autoscale"**
3. Database auto-configures (Neon PostgreSQL)
4. Auto-seed runs on first deployment
5. Done! ✅

**Environment Variables:** Auto-configured by Replit
**Cost:** Free tier available, scales automatically
**See:** `DEPLOYMENT_READY.md` for details

---

### 2. Vercel (Frontend) + Railway/Render (Backend)

**Perfect for: Serverless frontend with managed backend**

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18.x

#### Backend (Railway)

1. Connect GitHub repository
2. Add service: Select your repo
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
4. Deploy automatically on git push

**OR Backend (Render)**

1. New Web Service → Connect GitHub
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add environment variables (same as above)

---

### 3. AWS (EC2 + RDS)

**Perfect for: Enterprise-grade deployment with full control**

#### Database (RDS)

1. Create PostgreSQL RDS instance
2. Note connection string:
   ```
   postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/ayushratna
   ```

#### Application (EC2)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL client
sudo yum install -y postgresql

# Clone repository
git clone <your-repo-url>
cd ayushratna

# Install dependencies
npm install

# Configure environment
nano .env
# Add DATABASE_URL and JWT_SECRET

# Push database schema
npm run db:push

# Seed database
npm run db:seed

# Build frontend
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "ayushratna" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL (Let's Encrypt):**
```bash
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### 4. DigitalOcean App Platform

**Perfect for: Managed deployment with easy scaling**

1. Create new app → Connect GitHub
2. Detect framework: Node.js
3. Configure build:
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. Add database component (PostgreSQL)
5. Set environment variables:
   ```
   DATABASE_URL=${db.DATABASE_URL}
   JWT_SECRET=your-secret-key
   ```
6. Deploy

---

### 5. Heroku

**Perfect for: Simple Git-based deployment**

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create ayushratna

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Deploy
git push heroku main

# Run database setup
heroku run npm run db:push
heroku run npm run db:seed

# Open app
heroku open
```

**Procfile:**
```
web: npm start
```

---

### 6. Docker (Any Platform)

**Perfect for: Containerized deployment**

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ayushratna
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ayushratna
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Deploy:**
```bash
docker-compose up -d
```

---

### 7. Google Cloud Platform (Cloud Run)

**Perfect for: Serverless container deployment**

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT/ayushratna

# Deploy to Cloud Run
gcloud run deploy ayushratna \
  --image gcr.io/YOUR_PROJECT/ayushratna \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

---

### 8. Azure (App Service)

**Perfect for: Microsoft Azure ecosystem**

```bash
# Login to Azure
az login

# Create resource group
az group create --name ayushratna-rg --location eastus

# Create App Service plan
az appservice plan create --name ayushratna-plan --resource-group ayushratna-rg --is-linux

# Create web app
az webapp create --resource-group ayushratna-rg --plan ayushratna-plan --name ayushratna --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set --resource-group ayushratna-rg --name ayushratna --settings \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="your-secret-key"

# Deploy from GitHub
az webapp deployment source config --name ayushratna --resource-group ayushratna-rg \
  --repo-url https://github.com/your-repo --branch main
```

---

## 🗄️ Database Setup (Universal)

### Option 1: Neon (Recommended)

**Serverless PostgreSQL - Perfect for this project**

1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/database?sslmode=require
   ```
4. No additional configuration needed!

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Settings → Database
4. Copy connection string (use "pooler" for production)

### Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy DATABASE_URL from variables

### Option 4: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE ayushratna;
CREATE USER ayushratna_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ayushratna TO ayushratna_user;
\q

# Connection string
DATABASE_URL=postgresql://ayushratna_user:secure_password@localhost:5432/ayushratna
```

---

## 🔐 Environment Variables

**Required on ALL platforms:**

```env
# Database (CRITICAL)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Authentication (CRITICAL)
JWT_SECRET=minimum-32-characters-random-string

# Optional
NODE_ENV=production
PORT=3000
```

**Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Test locally with `npm run dev`
- [ ] Build succeeds with `npm run build`
- [ ] Database migrations work with `npm run db:push`
- [ ] All environment variables configured
- [ ] Git repository is clean and pushed

### Post-Deployment

- [ ] Homepage loads correctly
- [ ] Products API returns data: `/api/products`
- [ ] Admin login works: `/admin/login`
- [ ] Database has 32 products (auto-seeded)
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (if applicable)

### Security Checks

- [ ] Change default admin password (admin123)
- [ ] JWT_SECRET is strong and unique
- [ ] DATABASE_URL is secure (SSL enabled)
- [ ] Secrets not exposed in frontend
- [ ] CORS configured properly

---

## 🚨 Common Deployment Issues

### Issue: "DATABASE_URL must be set"

**Solution:**
- Check environment variables in hosting platform
- Ensure variable name is exactly `DATABASE_URL`
- Restart deployment after adding variables

### Issue: "Database schema empty"

**Solution:**
```bash
# SSH into server or use platform CLI
npm run db:push
npm run db:seed
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Ensure all dependencies installed
npm ci
npm run build
```

### Issue: "Port already in use"

**Solution:**
- Most platforms auto-assign ports
- Use `process.env.PORT` in production
- Don't hardcode port 5000

### Issue: Frontend not connecting to backend

**Solution:**
- Ensure API calls use relative paths (`/api/...`)
- Check CORS configuration in `server/index.ts`
- Verify both are on same domain

---

## 📊 Monitoring & Logs

### Viewing Logs

**Replit:**
```bash
# Real-time logs in Replit console
```

**Heroku:**
```bash
heroku logs --tail
```

**Railway:**
- View in Railway dashboard

**PM2 (VPS):**
```bash
pm2 logs ayushratna
```

**Docker:**
```bash
docker logs -f container_name
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Example)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Platform
        run: |
          # Add your deployment commands here
```

---

## 🎯 Performance Optimization

### Production Build

```bash
# Build optimized frontend
npm run build

# Minifies JavaScript, CSS
# Optimizes images
# Tree-shakes unused code
```

### Database Optimization

```sql
-- Add indexes (already in schema)
-- Monitor slow queries
-- Use connection pooling
```

### Caching

- Enable CDN for static assets
- Use Redis for session storage (optional)
- Configure browser caching headers

---

## 📚 Additional Resources

- **Replit Docs**: https://docs.replit.com
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **AWS Docs**: https://docs.aws.amazon.com
- **Docker Docs**: https://docs.docker.com

---

## ✅ Success Criteria

Your deployment is successful when:

✅ Homepage loads with products  
✅ Admin panel accessible  
✅ Database populated (32 products)  
✅ API endpoints responding  
✅ SSL certificate active  
✅ No console errors  
✅ Mobile responsive  
✅ Fast page loads (<3 seconds)

---

## 🆘 Need Help?

1. Check platform-specific documentation
2. Review deployment logs for errors
3. Test database connection separately
4. Verify environment variables
5. Check firewall/security group settings

---

## 🎉 Ready to Deploy!

Choose your platform, follow the steps, and launch your Ayurvedic e-commerce platform!

**Good luck! 🌿✨**
