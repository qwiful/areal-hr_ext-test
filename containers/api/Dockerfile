FROM node:22-alpine

WORKDIR /api

COPY api/package*.json ./
RUN npm install

COPY api/migrations ./migrations
COPY api/src ./src

RUN mkdir -p ./uploads

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:up && node src/index.js"]