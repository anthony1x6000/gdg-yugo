# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install
COPY . .
RUN npx tsc

# Stage 2: Final Image
FROM node:22-alpine
WORKDIR /usr/src/app

# Install Chromium and necessary libraries
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

# Cloud Run sets PORT at runtime; default to 8080 if not provided
ENV PORT=8080
EXPOSE 8080

CMD [ "node", "dist/index.js" ]
