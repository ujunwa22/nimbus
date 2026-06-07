FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/prisma ./prisma

RUN npx prisma generate

COPY backend/.env.example ./.env.example

COPY backend/src ./src

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s \
  --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && src/index.js"]