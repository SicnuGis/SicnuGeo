# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SicnuGeo is a city planning/geospatial visualization platform with a Vue.js frontend and Java Spring Boot backend. It enables users to view, manage, and interact with city projects through map visualization, featuring AI-powered assistance and SMS-based authentication.

## Architecture

### Frontend (Vue 2 + Vite)

**Tech Stack:**
- Vue 2.6.14 + Vue Router + Vuex/Pinia
- Vite 4.3.9 for build tool
- Element UI for components
- MapLibre GL for mapping functionality
- ECharts for data visualization

**Key Directories:**
- `frontend/src/views/` - Main page components (Home, ProjectAdmin, Login, AIChat, SubscribedProjects)
- `frontend/src/components/` - Reusable components
  - `gis/` - Map-related components (ProjectMapEditor, ProjectLocationViewer, LayerSwitcher)
  - `charts/` - Data visualization components
- `frontend/src/store/` - State management (project.store.js, user.store.js)
- `frontend/src/services/` - API integration layer

**Important Notes:**
- The project uses Vite proxy to forward API requests to backend (port 8085)
- Mock mode is configurable in `vite.config.js` (ENABLE_MOCK constant) - disabled by default for real backend
- Authentication token is stored in sessionStorage with key 'userSession'

### Backend (Spring Boot 3.3.3)

**Tech Stack:**
- Java 17
- Spring Boot 3.3.3 with Spring Data JPA
- MySQL 8.0+ (primary database)
- PostgreSQL (optional, kept for reference)
- Redis (session storage and SMS verification codes)
- Spring AI 1.1.2 (OpenAI/Ollama integration)

**Package Structure:**
- `backend/src/main/java/com/sicnu/geo/`
  - `config/` - Configuration classes (Redis, Web MVC, Session)
  - `controller/` - REST controllers (User, Project, Chat, Feature, Comment)
  - `entity/` - JPA entity models (User, Project, Comment, FeatureDocument)
  - `repository/` - Data access layer
  - `service/` - Service interfaces and implementations
  - `enums/` - ProjectCategory enum with localized category info

**Key Controllers:**
- `/api/user` - User authentication (SMS-based login)
- `/api/projects` - Project CRUD operations
- `/api/chat` - AI chat functionality
- `/api/features` - GeoJSON feature management
- `/api/comments` - Project comments

## Development Commands

### Frontend
```bash
# Navigate to frontend directory first
cd frontend

# Install dependencies
npm install

# Development server with hot reload (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Lint and fix files
npm run lint

# Preview production build
npm run preview
```

### Backend
```bash
# Navigate to backend directory first
cd backend

# Run the application (ensure MySQL and Redis are running)
mvn spring-boot:run

# Build the project
mvn clean package

# Run tests
mvn test

# Skip tests during build
mvn clean package -DskipTests
```

### Database Setup

**MySQL Configuration:**
- Database: `sicnugeo`
- Username: `root`
- Password: `123456`
- Port: `3306`
- Timezone: `Asia/Shanghai`

**Redis Configuration:**
- Host: `localhost`
- Port: `6379`
- Used for session storage and SMS verification codes

## Authentication System

### SMS-Based Login
1. User enters phone number
2. System generates 6-digit verification code
3. Code stored in Redis with 5-minute expiration
4. User enters code for authentication
5. Session created and stored in Redis (30-minute timeout)

### Protected Routes
- Most routes require authentication (indicated by `meta: { requiresAuth: true }`)
- Unauthenticated users redirected to `/login`
- Session token required for API access to protected endpoints

## AI Integration

The system integrates with AI services (OpenAI/Ollama) for chat functionality:
- Model: Configurable (default: Qwen)
- System prompt: "你是城市共享愿景的ai助手小成，为你提供专业的地理信息服务"
- Includes chat memory for conversation context
- Endpoint: `/api/chat`

## GIS/Map Features

- Map visualization using MapLibre GL
- Project location editing with GeoJSON feature support
- Layer management through LayerSwitcher component
- Coordinate system: WGS84 (EPSG:4326)

## State Management

**Frontend:**
- Pinia stores for project and user management
- Project store handles CRUD operations and filtering
- User store manages authentication state

**Backend:**
- JPA Repositories for data access
- Service layer implements business logic
- DTO pattern for API responses

## Important Configuration Files

- `frontend/vite.config.js` - Build configuration and proxy settings
- `frontend/src/router/index.js` - Route definitions and auth guards
- `backend/src/main/resources/application.yml` - Main Spring Boot config
- `backend/src/main/resources/application-mysql.yml` - MySQL-specific settings
- `backend/src/main/resources/application-dev.yml` - Development environment settings

## Common Development Patterns

### Adding New API Endpoint
1. Create controller method in appropriate controller class
2. Define request/response DTOs if needed
3. Implement service layer logic
4. Add repository query if database access required
5. Update frontend service layer

### Adding New Vue Component
1. Create component in appropriate directory under `frontend/src/components/`
2. Import and register component in parent view or globally if needed
3. Use props for data passing and events for communication
4. Access Pinia stores for shared state

### Working with GIS Features
1. GeoJSON format for spatial data
2. FeatureController handles CRUD operations for project geometries
3. ProjectMapEditor component provides interactive editing capabilities
4. All coordinates in WGS84 (longitude, latitude)
