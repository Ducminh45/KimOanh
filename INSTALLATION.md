# 🔧 NutriScanVN - Hướng Dẫn Cài Đặt Chi Tiết

## 📋 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 14.0
- **Redis**: >= 7.0 (optional, for caching)
- **Docker**: >= 20.10 (recommended)
- **Docker Compose**: >= 2.0
- **Git**: >= 2.30
- **Expo CLI**: Latest version

### API Keys Cần Thiết
- **Gemini API Key**: [Get it here](https://makersuite.google.com/app/apikey)
- **FatSecret API** (optional): For nutrition data

---

## 🚀 Cài Đặt Với Docker (Khuyến Nghị)

### Bước 1: Clone Repository
```bash
git clone https://github.com/yourusername/nutriscanvn.git
cd nutriscanvn
```

### Bước 2: Cấu Hình Environment
```bash
# Copy environment template
cp backend/.env.example .env

# Edit với editor của bạn
nano .env
```

Cấu hình tối thiểu:
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
DB_PASSWORD=your_postgres_password
```

### Bước 3: Khởi Động Services
```bash
cd docker
docker-compose up -d
```

### Bước 4: Kiểm Tra
```bash
# Kiểm tra services
docker-compose ps

# Test API
curl http://localhost:5000/health

# Kiểm tra logs
docker-compose logs -f backend
```

### Bước 5: Chạy Mobile App
```bash
# Mở terminal mới
cd mobile
npm install
npm start

# Scan QR code với Expo Go app
```

✅ **Hoàn Thành!** Backend chạy tại `http://localhost:5000`

---

## 💻 Cài Đặt Thủ Công (Development)

### Backend Setup

#### 1. Install Node.js Dependencies
```bash
cd backend
npm install
```

#### 2. Setup PostgreSQL Database
```bash
# Tạo database
createdb nutriscanvn

# Chạy schema
psql -d nutriscanvn -f ../database/schema.sql

# Import seed data
psql -d nutriscanvn -f ../database/seeds.sql

# Verify
psql -d nutriscanvn -c "SELECT COUNT(*) FROM users;"
```

#### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```

Cấu hình đầy đủ:
```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nutriscanvn
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

GEMINI_API_KEY=your_gemini_api_key
```

#### 4. Start Backend Server
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:5000`

---

### Mobile App Setup

#### 1. Install Dependencies
```bash
cd mobile
npm install
```

#### 2. Install Expo CLI (nếu chưa có)
```bash
npm install -g expo-cli
```

#### 3. Configure API URL
Edit `mobile/src/constants/config.ts`:
```typescript
export const API_URL = __DEV__
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-api.com/api'; // Production
```

#### 4. Start Expo Development Server
```bash
npm start
```

#### 5. Run on Device/Simulator

**Option A: Physical Device**
- Install "Expo Go" từ App Store/Play Store
- Scan QR code từ terminal

**Option B: iOS Simulator**
```bash
npm run ios
```

**Option C: Android Emulator**
```bash
npm run android
```

---

## 🗄️ Database Setup Chi Tiết

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Download từ [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database & User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE nutriscanvn;
CREATE USER nutriadmin WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nutriscanvn TO nutriadmin;

# Exit
\q
```

### Import Schema & Data
```bash
# Import schema
psql -U postgres -d nutriscanvn -f database/schema.sql

# Import seed data
psql -U postgres -d nutriscanvn -f database/seeds.sql

# Verify tables
psql -U postgres -d nutriscanvn -c "\dt"
```

---

## 🔧 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

**Database connection error:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d nutriscanvn

# Check credentials in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nutriscanvn
DB_USER=postgres
DB_PASSWORD=correct_password
```

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Mobile Issues

**Metro bundler cache:**
```bash
cd mobile
npx expo start -c
```

**Dependencies issues:**
```bash
cd mobile
rm -rf node_modules
npm install
```

**iOS Simulator not starting:**
```bash
# Open Xcode and install iOS Simulator
xcode-select --install
```

**Android emulator issues:**
```bash
# Check Android Studio is installed
# Start emulator from Android Studio
# Or use command:
emulator -avd Pixel_5_API_33
```

### Docker Issues

**Services not starting:**
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild
docker-compose up -d --build
```

**Database initialization failed:**
```bash
# Remove volumes and recreate
docker-compose down -v
docker-compose up -d
```

---

## 🧪 Verification Steps

### 1. Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Register test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","fullName":"Test User"}'
```

### 2. Test Database
```bash
# Connect to database
psql -U postgres -d nutriscanvn

# Check tables
\dt

# Check foods
SELECT COUNT(*) FROM foods;

# Should return 15+ Vietnamese foods
```

### 3. Test Mobile App
- Open Expo Go app
- Scan QR code
- App should load without errors
- Try login with demo account:
  - Email: `demo@nutriscanvn.com`
  - Password: `Demo123!`

---

## 📱 Mobile Build Commands

### Development Build
```bash
cd mobile
npm start
```

### Production Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production
```

---

## 🔐 Security Setup

### Generate Secure JWT Secrets
```bash
# Generate 32+ character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use output for `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`

### SSL Certificate Setup (Production)
```bash
# With Let's Encrypt (Certbot)
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Performance Tuning

### PostgreSQL Optimization
```sql
-- Add to postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
work_mem = 4MB
```

### Node.js Optimization
```bash
# Increase memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

---

## 🆘 Support

### Get Help
- 📚 Documentation: See `/docs` folder
- 🐛 Report bugs: GitHub Issues
- 💬 Chat: Discord server
- 📧 Email: support@nutriscanvn.com

### Common Issues
- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Search GitHub Issues
- Ask in Discord #support channel

---

## ✅ Success!

Nếu bạn thấy:
- ✅ Backend running at http://localhost:5000
- ✅ Health check returns success
- ✅ Mobile app loads in Expo Go
- ✅ Can login and navigate

**Bạn đã cài đặt thành công!** 🎉

---

**Next Steps:**
1. Explore the app features
2. Read the documentation
3. Try the demo account
4. Start developing!

🚀 **Happy Coding!**
