FROM node:22-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Run pending migrations, then start the server. DATABASE_URL and the JWT/
# integration secrets are provided by the host's environment variables.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
