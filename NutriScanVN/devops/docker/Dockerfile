# Simple Dockerfile for backend only build
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./backend/package.json
RUN npm install --prefix backend --omit=dev

COPY backend ./backend

EXPOSE 4000
CMD ["npm", "start", "--prefix", "backend"]
