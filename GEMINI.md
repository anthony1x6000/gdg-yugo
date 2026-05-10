# Project Instructions (Website Guessr)

This document outlines the architecture, tech stack, and conventions for the Website Guessr project.

## Project Overview
Website Guessr is a game where users guess a website based on its layout, with all images, icons, logos, and text stripped out.

## Features
- **Gameplay:** Guess the website from its bare layout.
- **Scraper:** A simple backend function that returns anonymized HTML of a site for guessing.

## Tech Stack & Conventions

### Frontend
- **React**: Core UI framework.
- **TypeScript**: Strict typing is enforced.
- **TanStack Router**: Used for all client-side routing.
- **TanStack Query**: Used for data fetching, caching, and synchronization.
- **Zustand**: Used for local state management.

### Backend
- **Cloudflare Workers**: Handles scraping and HTML proxying.
- **TypeScript**: Strict typing across all backend worker scripts.

## Development Rules
- Enforce strict TypeScript types.
- Maintain a clear separation between frontend components and backend logic.
