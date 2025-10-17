# Endo4Life Frontend

AI-integrated e-Learning platform for endometriosis education - Frontend Application

## Project Structure

This is an Nx monorepo with the following structure:

- `apps/admin-web` - Admin dashboard for managing users, courses, and resources
- `libs/feature-*` - Feature-specific libraries (auth, course, user, etc.)
- `libs/shared` - Shared utilities, components, and data access

## Technology Stack

- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite with Nx
- **Authentication:** Keycloak JS
- **State Management:** Redux Toolkit & React Query
- **UI Library:** Material-UI (MUI)
- **Styling:** Tailwind CSS
- **API Client:** Auto-generated from OpenAPI spec

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install --legacy-peer-deps
```

### Environment Configuration

Create environment files in the `env/` directory:

- `.env.local` - Local development
- `.env.dev` - Development server
- `.env.prod` - Production

Required environment variables:

```
VITE_ENDO4LIFE_SERVICE_URL=http://localhost:8080
VITE_ENDO4LIFE_APP_URL=https://keycloak.mydevopsproject2023.id.vn
VITE_ENDO4LIFE_ADMIN_WEB_URL=http://localhost:4200
VITE_ENDO4LIFE_USER_WEB_URL=http://localhost:4201
VITE_ENDO4LIFE_APP_REALM=endo4life
VITE_ENDO4LIFE_APP_CLIENT=endo4life_app
VITE_ENDO4LIFE_USER_SERVICE_URL=http://localhost:8080
```

### Development

```bash
# Start admin portal (local)
npm run start:admin

# Start admin portal (development)
npm run start:admin:dev

# Start admin portal (production)
npm run start:admin:prod
```

### Build

```bash
# Build for development
npm run build:admin:dev

# Build for production
npm run build:admin:prod
```

### API Code Generation

When the backend OpenAPI spec changes, regenerate the TypeScript client:

```bash
npm run codegen
```

## Backend Integration

The frontend integrates with the Endo4Life Spring Boot backend:

- **Base URL:** Configured via `VITE_ENDO4LIFE_SERVICE_URL`
- **Authentication:** Keycloak with JWT tokens
- **API Endpoints:** `/api/v1/*`

### Key Features

1. **User Management**
   - Create, invite, and manage users
   - Role-based access control (ADMIN, SPECIALIST, COORDINATOR, CUSTOMER)

2. **Course Management**
   - Create and manage courses
   - Course sections and content

3. **Resource Management**
   - Upload and manage educational resources
   - Images, videos, and documents

4. **Authentication**
   - Keycloak SSO integration
   - Automatic token refresh

## Development Notes

- Uses generated TypeScript API client from backend OpenAPI spec
- Follows the backend's security model with Keycloak
- Environment-specific configuration for different deployment stages
- Modular architecture with Nx workspace for scalability
