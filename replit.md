# plantpropagationguide.com - Smart Plant Propagation Guide

## Overview

plantpropagationguide.com is a web application that helps users determine the optimal time and method to propagate their plants. The application provides personalized propagation recommendations based on user inputs including plant type, growing zone, maturity level, and growing environment. It features a comprehensive plant database with detailed propagation instructions, success rates, and care guidelines tailored to different hardiness zones and seasonal timing.

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
- `GET /api/plants/slug/:slug` - Get plant by SEO-friendly slug (e.g., "monstera-deliciosa")
- `POST /api/propagation-requests` - Create propagation request
- `GET /api/propagation-requests/:id` - Retrieve propagation request

**Key Pages:**
- `/` - Homepage with plant search, popular plants, and zone selector in header
- `/all-plants` - Complete plant list with sorting (6 options) and difficulty filtering, simplified display
- `/guide/:plantSlug` - SEO-friendly plant propagation guide pages (e.g., /guide/monstera-deliciosa, /guide/snake-plant)

### Data Storage

**Database Schema (PostgreSQL via Drizzle):**
- **plants table**: Core plant data including name (display name), scientific/common names, difficulty levels, success rates, propagation methods, seasonal timing, zone recommendations, step-by-step instructions, and care guidelines. The `name` field serves as the primary display name, with `common_name` and `scientific_name` shown as secondary information.
- **propagation_requests table**: User propagation requests with plant references, zone information, maturity levels, and environment types (simplified to 3 essential fields)
- **users table**: User authentication data (username, password)

**Current Implementation:**
- **Supabase-Only Storage**: All plant data exclusively sourced from Supabase PostgreSQL database via DATABASE_URL
- No hardcoded plant fallbacks - returns empty arrays when database unavailable
- Interface-based storage abstraction (IStorage) for flexibility
- Uses node-postgres (pg) adapter with SSL for Supabase pooler compatibility
- **ID System**: Plant IDs use database primary key (bigint) converted to string for guaranteed uniqueness and consistency
- Database contains 30+ curated plants with full propagation details
- **Robust search**: searchPlants() includes fallback logic for databases with or without the `name` column - attempts query with `name` field first, falls back to `common_name` and `scientific_name` only if name column doesn't exist (error code 42703)
- **Connection safety**: All database operations (getAllPlants, getPlantById, searchPlants) use finally blocks to ensure pool cleanup, preventing connection leaks on both success and error paths

**Data Models:**
- JSON fields for complex data (propagation methods, monthly arrays, zone-specific recommendations, step-by-step instructions)
- Zod schemas generated from Drizzle tables for runtime validation
- Type-safe TypeScript interfaces derived from database schema

### External Dependencies

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui configuration for component styling and theming
- Nature-focused color scheme with deep forest greens (hsl(95, 60%, 25%)), cream backgrounds (hsl(40, 35%, 96%)), and organic rounded elements (0.75rem radius)
- Light theme emphasizes natural aesthetics with soft shadows and smooth transitions

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

**Instant Propagation Results:**
- Simplified UX eliminates multi-step forms - select a plant, get instant results
- Zone selector integrated into page headers (homepage + All Plants)
- Default values used automatically: maturity="mature", environment="inside"
- No form required - clicking any plant goes directly to personalized results
- Users can focus on browsing plants without data entry friction

**Zone Selection & Auto-Detection:**
- Zone selector visible in header with MapPin icon on Home and All Plants pages
- **Results page zone switching**: On propagation guide pages, zone selector appears below the plant name (not in header) - creates new request with updated zone and reloads content with zone-specific recommendations
- Auto-detects user's USDA hardiness zone on first visit using IP geolocation
- Uses free APIs (no API keys required):
  - ipapi.co (HTTPS) for IP-based geolocation and ZIP code
  - phzmapi.org (HTTPS) for ZIP code to hardiness zone conversion
- Zone persisted in localStorage across sessions (home/all-plants pages)
- Retry logic for network resilience (500ms backoff, 1 retry per API)
- Supports all USDA zones 1a-13b
- User can manually change zone at any time via header selector
- Silent fallback when detection fails (user selects manually)

**Plant Display System:**
- Consistent display hierarchy across all views (cards, search results, All Plants page)
- Primary header: `name` field (main display name)
- Secondary line: `common_name` • `scientific_name` (italicized) on same line with bullet separator
- Clean, minimal layout showing essential information only
- PlantCard and All Plants page also show difficulty level and success rate

**Sorting & Filtering (All Plants Page):**
- **6 Sort Options**: Name (A-Z), Name (Z-A), Difficulty (Easy to Hard), Difficulty (Hard to Easy), Success Rate (High to Low), Success Rate (Low to High)
- **Default Sort**: Alphabetically by name (A-Z) for easy browsing
- **Difficulty Filter**: All Difficulties, Easy, Medium, Hard - with dynamic count display showing number of filtered plants
- Real-time UI updates when sort or filter changes
- Clean, user-friendly controls with labeled dropdowns and visual feedback

**Component Architecture:**
- PlantCard and PlantSearch accept onPlantSelect callbacks for unified plant selection
- Direct-to-results flow bypasses legacy form route
- Toast notifications provide feedback when zone is missing

**SEO-Friendly URLs:**
- Plant guide pages use descriptive slugs: `/guide/:plantSlug` (e.g., `/guide/monstera-deliciosa`, `/guide/snake-plant`)
- Slug generation utility (`getPlantSlug`, `slugify`) converts plant names to URL-friendly format:
  - Lowercase conversion
  - Spaces replaced with hyphens
  - Special characters removed (except hyphens)
- Backend endpoint `GET /api/plants/slug/:slug` fetches plants by slug
- Navigation from home page and all-plants page uses slugs for clean, indexable URLs
- Improves SEO by including plant names directly in URLs instead of numeric IDs

**Ad Monetization Status (October 2025):**
- **AdSense Compliance**: All ad placeholder components have been removed from the site
- Removed to fix Google AdSense policy violation: "Google-served ads on screens without publisher-content"
- Site is now clean and ready for AdSense review
- AdPlaceholder component file still exists in codebase but is not imported or rendered anywhere
- Once AdSense is approved and real ad codes are provided, actual Google ad scripts can be added to pages
- **Next Steps**: Submit site for Google AdSense review, then integrate actual ad code once approved

**Logo Navigation:**
- Logo (Plant Propagation icon + name) is clickable from all pages to return to homepage
- Implemented consistently across Home, All Plants, Results, and Propagation Form pages
- Uses wouter Link component with href="/" and data-testid="link-home-logo"
- Hover effect (opacity-80) provides visual feedback for clickable state

**Image Display Status (October 2025):**
- Image display code has been uncommented and enabled
- All components (PlantCard, PlantSearch, propagation form) have image tags enabled with proper error handling
- Fallback green gradient with Sprout icon shows when images fail to load
- **Root Cause Identified**: Wikipedia image URLs in database are returning 404 errors (broken links)
  - Tested multiple image URLs - all returning HTTP 404
  - Wikipedia commons images have been moved or deleted
  - Image code is working correctly - fallback displays as designed when URLs are invalid
- **Solution Needed**: Database imageUrl values need to be updated with valid, working image URLs