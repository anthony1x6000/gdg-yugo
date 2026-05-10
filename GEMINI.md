# Project Instructions (Website Guessr)

This document outlines the architecture, tech stack, and conventions for the Website Guessr project.

## Project Overview
Website Guessr is a game where users guess a website based on its layout, with all images, icons, logos, and text stripped out. Users are given four multiple-choice options.

## Features
- **Gameplay:** Guess the website from its bare layout.
- **Leaderboard:** Track high scores.
- **Authentication:** Custom signup/login without email requirements. Profile pictures are handled via external URLs.

## Tech Stack & Conventions

### Frontend
- **React**: Core UI framework.
- **TypeScript**: Strict typing is enforced.
- **TanStack Router**: Used for all client-side routing.
- **TanStack Query**: Used for data fetching, caching, and synchronization.
- **Zustand**: Used for global state management, specifically for user authentication (`useAuthStore`).

### Backend
- **Cloudflare Workers**: Handles API requests and backend logic.
- **Cloudflare D1**: Serverless SQLite database.
- **Drizzle ORM**: Used for database schema definition and querying.
- **TypeScript**: Strict typing across all backend worker scripts.

## Development Rules
- Enforce strict TypeScript types. Avoid `any` or bypassing the type system.
- Use Zustand for auth state, and TanStack Query for remote state.
- Ensure all backend API interactions are fully type-safe.
- Maintain a clear separation between frontend components and backend logic.
