# Use an official Node runtime as a parent image
FROM node:22-slim

# Install necessary system dependencies for Puppeteer/Chrome
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      libasound2 \
      libatk-bridge2.0-0 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgbm1 \
      libgcc1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
      lsb-release \
      wget \
      xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Set environment variable to store Puppeteer's Chrome in a known location
ENV PUPPETEER_CACHE_DIR=/usr/src/app/.cache/puppeteer

# Install app dependencies
COPY package*.json ./
# Running npm install will trigger the 'postinstall' script which downloads Chrome
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 8789

# Start the app
CMD [ "npm", "start" ]
