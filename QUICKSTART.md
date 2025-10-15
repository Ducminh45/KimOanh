# 🚀 NutriScanVN - Quick Start Guide

## ⚡ Khởi Động Nhanh (5 Phút)

### Yêu Cầu
- Node.js 18+
- Docker & Docker Compose
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### Bước 1: Clone Repository
```bash
git clone https://github.com/yourusername/nutriscanvn.git
cd nutriscanvn
```

### Bước 2: Cấu Hình Environment
```bash
# Tạo file .env
cp backend/.env.example .env

# Chỉnh sửa .env và thêm:
# - GEMINI_API_KEY=your_key_here
# - JWT_SECRET=your_secret_min_32_chars
# - DB_PASSWORD=your_postgres_password
nano .env
```

### Bước 3: Khởi Động Bằng Docker (Recommended)
```bash
cd docker
docker-compose up -d
```

✅ Backend sẽ chạy tại: `http://localhost:5000`
✅ PostgreSQL: `localhost:5432`
✅ Redis: `localhost:6379`

### Bước 4: Kiểm Tra Health
```bash
curl http://localhost:5000/health
```

### Bước 5: Chạy Mobile App
```bash
# Cửa sổ terminal mới
cd mobile
npm install
npm start
```

Scan QR code bằng Expo Go app!

---

## 🎯 Hoặc Chạy Thủ Công

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env

# Setup database
createdb nutriscanvn
psql -d nutriscanvn -f ../database/schema.sql
psql -d nutriscanvn -f ../database/seeds.sql

# Start
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npm start
```

---

## 🔑 API Keys Cần Thiết

### Gemini API Key (Bắt buộc)
1. Truy cập: https://makersuite.google.com/app/apikey
2. Tạo API key
3. Copy vào `.env`: `GEMINI_API_KEY=your_key`

### FatSecret API (Tùy chọn)
1. Truy cập: https://platform.fatsecret.com/api/
2. Register application
3. Get Client ID & Secret
4. Add to `.env`

---

## 🧪 Test Account

Để test nhanh, sử dụng demo account:

```
Email: demo@nutriscanvn.com
Password: Demo123!
```

Hoặc tạo account mới trong app.

---

## 📱 Mobile App Testing

### iOS Simulator
```bash
cd mobile
npm run ios
```

### Android Emulator
```bash
cd mobile
npm run android
```

### Expo Go (Physical Device)
1. Install Expo Go từ App Store/Play Store
2. Chạy `npm start` trong mobile folder
3. Scan QR code

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d nutriscanvn
```

---

## 🔍 Troubleshooting

### Backend không start
```bash
# Check logs
docker-compose logs backend

# Restart
docker-compose restart backend
```

### Database connection error
```bash
# Check PostgreSQL
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

### Mobile app error
```bash
# Clear cache
cd mobile
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📚 Tài Liệu Đầy Đủ

- [README.md](./README.md) - Comprehensive guide
- [API.md](./docs/API.md) - API documentation
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture docs

---

## 🎉 Bạn Đã Sẵn Sàng!

- ✅ Backend running
- ✅ Database setup
- ✅ Mobile app connected
- ✅ Ready to develop!

**Happy Coding! 🚀**

---

## 💡 Next Steps

1. Explore the code structure
2. Try the demo features
3. Read the documentation
4. Start contributing!

## 📞 Support

- 📧 Email: support@nutriscanvn.com
- 💬 Discord: [Join our server](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/nutriscanvn/issues)
