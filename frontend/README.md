# Frontend Setup Guide

This document explains how to set up and run the Website Guessr frontend application locally for development.

## Tech Stack Overview

The frontend is built using:
- **React** with **TypeScript**
- **Vite** as the build tool and development server
- **TanStack Router** for routing
- **TanStack Query** for data fetching
- **Zustand** for state management

## Prerequisites

Ensure you have Node.js installed on your machine. This project uses `pnpm` for package management. 

To install `pnpm` globally (if you haven't already):
```bash
npm install -g pnpm
```

## 1. Install Dependencies

Navigate to the `frontend` directory and install the necessary dependencies:

```bash
cd frontend
pnpm install
```

## 2. Environment Variables

If there is a `.env.example` file in the `frontend` directory, copy it to `.env.local` or `.env` and fill in any required configuration values (such as the backend API URL).

```bash
cp .env.example .env.local
```

## 3. Starting the Development Server

To start the local development server with Hot Module Replacement (HMR), run:

```bash
pnpm run dev
```

This command will typically start the application using Vite. You will see output in the terminal indicating the local URL where the app is running (usually `http://localhost:5173`).

Open that URL in your browser to view the application.

## 4. Building for Production

When you are ready to deploy the frontend to your VPS or a static hosting provider, you need to create an optimized production build.

```bash
pnpm run build
```

This will generate a `dist/` directory containing the minified and bundled static assets that can be served by Nginx, Caddy, or any other web server.

## Summary of Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Installs all project dependencies. |
| `pnpm run dev` | Starts the local development server (Vite). |
| `pnpm run build` | Creates a production-ready build in the `dist` directory. |
| `pnpm run preview` | Previews the production build locally. |
