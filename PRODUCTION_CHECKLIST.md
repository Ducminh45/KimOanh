# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Quality & Testing
- [x] All tests passing (106+ tests)
- [x] Test coverage ≥ 85%
- [x] No console.log in production code
- [x] No commented-out code
- [x] TypeScript strict mode enabled
- [x] ESLint warnings resolved
- [x] Code review completed

### 2. Security
- [ ] Environment variables configured
- [ ] API keys secured (not in code)
- [ ] JWT secret is strong (256+ bits)
- [ ] Database credentials secured
- [ ] HTTPS/SSL certificates ready
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled (Helmet.js)
- [ ] CORS configured correctly

### 3. Performance
- [x] Bundle size optimized (9MB)
- [x] Images optimized
- [x] Lazy loading implemented
- [x] Database indexes created
- [x] API response times < 200ms
- [x] Frontend load time < 3s
- [ ] CDN configured for static assets
- [x] Caching strategies implemented

### 4. Database
- [x] Migrations tested
- [x] Indexes optimized
- [x] Backup strategy configured
- [ ] Connection pooling configured
- [x] Database credentials secured
- [ ] Scaling plan documented

### 5. Monitoring & Logging
- [x] Sentry configured for error tracking
- [x] Performance monitoring enabled
- [ ] Log aggregation setup (Winston)
- [ ] Uptime monitoring configured
- [ ] Alert system configured
- [ ] Health check endpoints working

### 6. Documentation
- [x] API documentation complete
- [x] README updated
- [x] Deployment guide ready
- [x] Architecture documented
- [x] Environment variables documented
- [x] Troubleshooting guide available

---

## 🔧 Backend Deployment

### Environment Variables Required
```bash
# Application
NODE_ENV=production
PORT=5000
APP_URL=https://api.nutriscanvn.com

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=nutriscanvn_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_SSL=true

# Redis
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=your-redis-password

# Authentication
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Push Notifications
FIREBASE_SERVICE_ACCOUNT=your-firebase-json
```

### Deployment Steps

#### Option 1: Docker (Recommended)
```bash
# 1. Build Docker image
docker build -t nutriscanvn-backend:1.2.0 -f docker/Dockerfile .

# 2. Run with docker-compose
cd docker
docker-compose up -d

# 3. Verify health
curl https://api.nutriscanvn.com/health
```

#### Option 2: Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link project
railway link

# 4. Deploy
railway up

# 5. Add environment variables via dashboard
# https://railway.app/dashboard
```

#### Option 3: Heroku
```bash
# 1. Create Heroku app
heroku create nutriscanvn-api

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 3. Add Redis
heroku addons:create heroku-redis:hobby-dev

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... (set all variables)

# 5. Deploy
git push heroku main

# 6. Run migrations
heroku run npm run migrate
```

#### Option 4: AWS EC2
```bash
# 1. SSH into EC2
ssh -i your-key.pem ubuntu@your-ip

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/your/repo.git
cd repo/backend

# 5. Install dependencies
npm install --production

# 6. Create .env file
nano .env
# (paste production variables)

# 7. Run migrations
npm run migrate

# 8. Start with PM2
pm2 start src/index.js --name nutriscanvn-api
pm2 save
pm2 startup

# 9. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/nutriscanvn
# (configure as per nginx.conf)

sudo ln -s /etc/nginx/sites-available/nutriscanvn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📱 Mobile App Deployment

### Environment Configuration
```bash
# mobile/.env.production
API_URL=https://api.nutriscanvn.com
SENTRY_DSN=your-mobile-sentry-dsn
ENVIRONMENT=production
```

### iOS Deployment

#### 1. Prepare App
```bash
cd mobile

# Update version
# Edit app.json: version and buildNumber

# Install dependencies
npm install

# Run tests
npm test
```

#### 2. Build with EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### 3. App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Fill in metadata
4. Upload screenshots
5. Set privacy policy URL
6. Submit for review

### Android Deployment

#### 1. Build with EAS
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

#### 2. Google Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Fill in store listing
4. Upload screenshots
5. Set content rating
6. Submit for review

---

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Backend health
curl https://api.nutriscanvn.com/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-14T...",
#   "uptime": 123,
#   "database": "connected",
#   "redis": "connected"
# }

# Database connection
curl https://api.nutriscanvn.com/api/health/db

# Redis connection
curl https://api.nutriscanvn.com/api/health/redis
```

### 2. API Testing
```bash
# Test registration
curl -X POST https://api.nutriscanvn.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'

# Test login
curl -X POST https://api.nutriscanvn.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Performance Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test (100 requests, 10 concurrent)
ab -n 100 -c 10 https://api.nutriscanvn.com/health

# Expected:
# - Requests per second: > 50
# - Time per request: < 200ms
# - Failed requests: 0
```

### 4. Mobile App Verification
- [ ] App installs successfully
- [ ] Splash screen displays
- [ ] Login works
- [ ] Registration works
- [ ] Camera permissions work
- [ ] Food scanning works
- [ ] Push notifications work
- [ ] Offline mode works
- [ ] All screens accessible
- [ ] No crashes

---

## 📊 Monitoring Setup

### Sentry Dashboard
1. Check error rates
2. Set up alerts for critical errors
3. Monitor release health
4. Track performance metrics

### Database Monitoring
```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('nutriscanvn_prod'));
```

### Server Monitoring
```bash
# CPU usage
top

# Memory usage
free -h

# Disk usage
df -h

# Network traffic
nethogs

# PM2 status
pm2 status
pm2 logs
```

---

## 🔄 Rollback Plan

### If Deployment Fails

#### Backend Rollback
```bash
# Docker
docker-compose down
docker-compose -f docker-compose.backup.yml up -d

# Railway
railway rollback

# Heroku
heroku rollback

# PM2
pm2 restart nutriscanvn-api --update-env
```

#### Database Rollback
```bash
# Restore from backup
pg_restore -d nutriscanvn_prod backup.dump

# Or run down migration
npm run migrate:down
```

#### Mobile App Rollback
- Previous version still available in stores
- Users will update gradually
- Can force update via API if critical

---

## 📈 Success Metrics

### Week 1
- [ ] 0 critical errors in Sentry
- [ ] API uptime > 99.5%
- [ ] Average response time < 200ms
- [ ] 0 user-reported crashes
- [ ] Successful onboarding rate > 80%

### Month 1
- [ ] 100+ active users
- [ ] 10+ premium conversions
- [ ] App Store rating > 4.0
- [ ] No security incidents
- [ ] Daily active users growing

---

## 🆘 Emergency Contacts

### Technical Issues
- **DevOps Lead**: devops@nutriscanvn.com
- **Backend Lead**: backend@nutriscanvn.com
- **Mobile Lead**: mobile@nutriscanvn.com

### Service Providers
- **Hosting**: Railway Support
- **Database**: PostgreSQL Support
- **CDN**: CloudFlare Support
- **Monitoring**: Sentry Support

---

## ✅ Final Checklist

Before announcing launch:

- [ ] All critical bugs fixed
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Backups verified
- [ ] Documentation complete
- [ ] Team trained on production system
- [ ] Support email configured
- [ ] Analytics tracking verified
- [ ] Privacy policy published
- [ ] Terms of service published

---

**Ready to Launch! 🚀**

**Remember**: Monitor closely for first 24-48 hours after launch.

Good luck with your production deployment!
