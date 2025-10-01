# PlantProp - Smart Plant Propagation Guide

## Overview

PlantProp is a web application that helps users determine the optimal time and method to propagate their plants. The application provides personalized propagation recommendations based on user inputs including plant type, growing zone, maturity level, soil conditions, and experience level. It features a comprehensive plant database with detailed propagation instructions, success rates, and care guidelines tailored to different hardiness zones and seasonal timing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom plant-themed design tokens

**Design Patterns:**
- Component composition with reusable UI primitives (cards, forms, buttons, etc.)
- Custom hooks for mobile detection and toast notifications
- Form validation using react-hook-form with Zod schema validation
- Query-based data fetching with centralized API request handling
- Path aliases for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- ESM module system throughout the application
- Drizzle ORM for database interactions with PostgreSQL dialect
- Neon Database serverless PostgreSQL

**API Design:**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Request logging middleware for API calls
- Zod schema validation for request payloads
- In-memory storage implementation with interface-based design for easy database migration

**Key Endpoints:**
- `GET /api/plants` - Retrieve all plants
- `GET /api/plants/search?q=` - Search plants by name
- `GET /api/plants/:id` - Get specific plant details
- `POST /api/propagation-requests` - Create propagation request
- `GET /api/propagation-requests/:id` - Retrieve propagation request

**Key Pages:**
- `/` - Homepage with plant search and popular plants showcase
- `/all-plants` - Complete alphabetical list of all plants in database
- `/propagation-form/:plantId` - Plant-specific propagation form with auto zone detection
- `/results/:requestId` - Propagation results and recommendations

### Data Storage

**Database Schema (PostgreSQL via Drizzle):**
- **plants table**: Core plant data including scientific/common names, difficulty levels, success rates, propagation methods, seasonal timing, zone recommendations, step-by-step instructions, and care guidelines
- **propagation_requests table**: User propagation requests with plant references, zone information, maturity levels, soil conditions, environment types, preferred methods, and experience levels
- **users table**: User authentication data (username, password)

**Current Implementation:**
- **Supabase Integration**: Live plant search connected to Supabase PostgreSQL database via DATABASE_URL
- **Hybrid Storage**: Queries Supabase first for plant data, falls back to in-memory storage
- Pre-populated with curated plant database (TOP_PLANTS array) for fallback
- Interface-based storage abstraction (IStorage) for flexibility
- Uses node-postgres (pg) adapter with SSL for Supabase pooler compatibility

**Data Models:**
- JSON fields for complex data (propagation methods, monthly arrays, zone-specific recommendations, step-by-step instructions)
- Zod schemas generated from Drizzle tables for runtime validation
- Type-safe TypeScript interfaces derived from database schema

### External Dependencies

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui configuration for component styling and theming
- Custom neutral-based color scheme with plant/nature theme

**Development Tools:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error overlay)
- TypeScript for type safety across client and server
- esbuild for production server bundling

**Database & ORM:**
- Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- Drizzle ORM for type-safe database queries and migrations
- drizzle-kit for schema management and database push operations

**Form & Validation:**
- react-hook-form for form state management
- Zod for schema validation
- @hookform/resolvers for Zod integration with react-hook-form
- drizzle-zod for generating Zod schemas from Drizzle tables

**Utility Libraries:**
- date-fns for date manipulation
- class-variance-authority (cva) for component variant styling
- clsx and tailwind-merge for conditional class management
- embla-carousel-react for carousel functionality
- nanoid for unique ID generation

**State Management:**
- TanStack React Query for server state, caching, and synchronization
- Query client configured with custom fetch function and error handling
- Infinite stale time for development efficiency

### Smart Features

**Auto-Detection of USDA Hardiness Zone:**
- Automatically detects user's USDA growing zone based on IP location
- Uses free APIs (no API keys required):
  - ipapi.co (HTTPS) for IP-based geolocation and ZIP code
  - phzmapi.org (HTTPS) for ZIP code to hardiness zone conversion
- Auto-populates zone field on propagation form load
- Retry logic for network resilience (500ms backoff, 1 retry per API)
- Supports all USDA zones 1a-13b
- User can manually override auto-detected zone
- Silent fallback when detection fails (user selects manually)
- Validates 5-digit ZIP codes regardless of country name for US territories