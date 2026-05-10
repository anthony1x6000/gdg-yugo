# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Puppeteer installation is skipped because we use system chromium in the final stage
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Install all dependencies (including devDependencies like typescript)
RUN npm install
COPY . .
# Compile TypeScript to JavaScript
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

# Copy only the production dependencies from the builder
COPY package*.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm install --production

# Copy compiled JavaScript from builder
COPY --from=builder /usr/src/app/dist ./dist

# Environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 8789
CMD [ "node", "dist/index.js" ]
