# NutriScanVN Deployment Guide

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
- Docker & Docker Compose (for containerized deployment)
- Git
- Gemini API Key

---

## 🐳 Docker Deployment (Recommended)

### 1. Setup Environment

```bash
# Clone repository
git clone https://github.com/yourusername/nutriscanvn.git
cd nutriscanvn

# Copy environment file
cp backend/.env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Configure Environment Variables

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=postgres
DB_NAME=nutriscanvn
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Build and Start Services

```bash
cd docker
docker-compose up -d
```

### 4. Verify Services

```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost:5000/health
```

### 5. Stop Services

```bash
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

---

## 🖥️ Manual Deployment

### Backend Setup

#### 1. Install Dependencies

```bash
cd backend
npm install
```

#### 2. Setup Database

```bash
# Create database
createdb nutriscanvn

# Run schema
psql -d nutriscanvn -f ../database/schema.sql

# Seed initial data
psql -d nutriscanvn -f ../database/seeds.sql
```

#### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

#### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🚂 Railway Deployment

### 1. Setup Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project

### 2. Deploy Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Add environment variables in Railway dashboard
# - NODE_ENV=production
# - DATABASE_URL (provided by Railway)
# - JWT_SECRET
# - GEMINI_API_KEY

# Deploy
railway up
```

### 3. Add PostgreSQL Service

1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL"
3. Railway will automatically set DATABASE_URL

### 4. Run Migrations

```bash
# Connect to Railway project
railway connect

# Run migrations
railway run npm run migrate
```

---

## 🌊 Heroku Deployment

### 1. Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Create Heroku App

```bash
cd backend
heroku login
heroku create nutriscanvn-api
```

### 3. Add PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

### 4. Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GEMINI_API_KEY=your_api_key
```

### 5. Deploy

```bash
git push heroku main
```

### 6. Run Migrations

```bash
heroku run npm run migrate
```

---

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance

1. Go to AWS Console
2. Launch Ubuntu 22.04 LTS instance
3. Configure security group (ports 22, 80, 443, 5000)
4. Download key pair

### 2. Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
```

### 4. Setup Application

```bash
# Clone repository
git clone https://github.com/yourusername/nutriscanvn.git
cd nutriscanvn

# Setup environment
cp backend/.env.example .env
nano .env

# Run with Docker
cd docker
docker-compose up -d
```

### 5. Setup Nginx

```bash
sudo apt install -y nginx

# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/nutriscanvn
sudo ln -s /etc/nginx/sites-available/nutriscanvn /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📱 Mobile App Deployment

### iOS App Store

#### 1. Setup

```bash
cd mobile
npm install -g eas-cli
eas login
```

#### 2. Configure

```bash
eas build:configure
```

#### 3. Build

```bash
# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android Play Store

#### 1. Build

```bash
# Production build
eas build --platform android --profile production
```

#### 2. Submit

```bash
eas submit --platform android
```

---

## 🔧 Configuration Files

### Backend Dockerfile

Located at `docker/Dockerfile`:
- Multi-stage build
- Non-root user
- Health checks
- Production optimized

### Docker Compose

Located at `docker/docker-compose.yml`:
- Backend service
- PostgreSQL service
- Redis service
- Nginx reverse proxy

### Nginx Configuration

Located at `docker/nginx.conf`:
- Reverse proxy
- SSL configuration
- Rate limiting
- Gzip compression

---

## 🔍 Health Checks

### Backend Health Check

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "success": true,
  "message": "NutriScanVN API is running",
  "timestamp": "2025-10-14T10:30:00.000Z",
  "uptime": 3600
}
```

### Database Health Check

```bash
# In Docker
docker-compose exec postgres pg_isready

# Manual
psql -h localhost -U postgres -d nutriscanvn -c "SELECT 1"
```

---

## 📊 Monitoring

### View Logs

```bash
# Docker logs
docker-compose logs -f backend

# Application logs
tail -f backend/logs/combined.log

# Error logs
tail -f backend/logs/error.log
```

### Database Monitoring

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d nutriscanvn

# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔄 Backup & Restore

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres nutriscanvn > backup_$(date +%Y%m%d).sql

# Or use script
bash scripts/backup.sh
```

### Database Restore

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres nutriscanvn < backup_20251014.sql
```

---

## 🔐 Security Checklist

- [x] Strong JWT secrets (min 32 characters)
- [x] HTTPS enabled
- [x] Rate limiting configured
- [x] Helmet.js security headers
- [x] CORS properly configured
- [x] Password hashing with bcrypt
- [x] Input validation and sanitization
- [x] SQL injection prevention
- [x] XSS protection
- [x] Environment variables secured
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Backup automation

---

## 🚀 Performance Optimization

1. **Enable Redis Caching**
```bash
# In .env
REDIS_HOST=redis
REDIS_PORT=6379
```

2. **Database Indexing**
- Already configured in schema.sql
- Monitor slow queries

3. **Image Optimization**
- Compress images before upload
- Use CDN for image delivery

4. **API Response Caching**
- Enable Redis caching
- Set appropriate TTL

---

## 🆘 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec postgres pg_isready

# Restart services
docker-compose restart
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
docker-compose exec postgres psql -U postgres -d nutriscanvn
```

### Out of Memory

```bash
# Increase Docker memory limit
# Edit docker-compose.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## 📞 Support

- **Email**: support@nutriscanvn.com
- **GitHub Issues**: https://github.com/yourusername/nutriscanvn/issues
- **Documentation**: https://docs.nutriscanvn.com

---

**Last Updated**: October 2025
