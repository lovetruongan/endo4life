# Endo4Life

AI-integrated e-Learning platform for endometriosis education and support.

## Overview

Endo4Life is a comprehensive e-learning platform designed to provide educational resources, support, and community for individuals affected by endometriosis. The platform combines modern web technologies with AI capabilities to deliver personalized learning experiences.

## Architecture

The platform consists of two main components:

### Backend Service (Spring Boot)

- **Framework**: Spring Boot 3.3.1
- **Language**: Java 17
- **Database**: PostgreSQL
- **Authentication**: Keycloak OAuth2/OIDC
- **File Storage**: MinIO
- **API Documentation**: OpenAPI/Swagger

### Frontend Applications (React/TypeScript)

- **Admin Web**: Administrative interface for content management
- **Student Web**: Learning interface for end users
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Nx monorepo
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit

## Features

- 🎓 **Course Management**: Create and manage educational content
- 🎥 **Video Learning**: Integrated video player with progress tracking
- 📝 **Rich Text Editor**: Advanced content creation with Lexical
- 🧪 **Assessments & Tests**: Interactive quizzes and evaluations
- 🔐 **Secure Authentication**: Keycloak-based user management
- 📱 **Responsive Design**: Mobile-friendly interface
- 🌐 **Internationalization**: Multi-language support
- 💬 **Discussion Forums**: Community interaction features
- 📊 **Progress Tracking**: Learning analytics and reporting

## Requirements

### Backend

- JDK 17
- Maven 3
- Docker
- PostgreSQL
- Keycloak
- MinIO

### Frontend

- Node.js 18+
- Yarn or npm
- Docker (for deployment)

## Installation & Setup

### 1. Database Setup (PostgreSQL)

```bash
# Create volume for data persistence
docker volume create elearning_postgres_vol

# Run PostgreSQL container
docker run \
  --name elearning_postgres \
  -d \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -v elearning_postgres_vol:/var/lib/postgresql/data \
  postgres

# Create database
psql -U postgres -c "CREATE DATABASE elearning;"
```

### 2. Keycloak Setup

```bash
# Create volume for Keycloak data
docker volume create elearning_keycloak_vol

# Run Keycloak container
docker run \
  --name elearning_keycloak \
  -p 7070:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v elearning_keycloak_vol:/opt/keycloak/data \
  quay.io/keycloak/keycloak:25.0.1 \
  start-dev
```

### 3. MinIO Setup

```bash
# Create data directory
mkdir -p ~/miniodata

# Run MinIO container
docker run \
  -p 9000:9000 \
  -p 9001:9001 \
  --name elearning_minio \
  -v ~/miniodata:/data \
  -e "MINIO_ROOT_USER=minio" \
  -e "MINIO_ROOT_PASSWORD=minio123" \
  quay.io/minio/minio server \
  /data \
  --console-address ":9001"
```

### 4. Backend Service

```bash
# Clone and navigate to service directory
cd ai-endo-elearning-service

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Run with Maven
./mvnw spring-boot:run

# Or build and run with Docker
docker build -t endo4life-backend .
docker run -p 8080:8080 endo4life-backend
```

### 5. Frontend Applications

```bash
# Navigate to web directory
cd ai-endo-elearning-web

# Install dependencies
yarn install

# Start admin application (development)
yarn start:admin

# Start in different environments
yarn start:admin:dev    # Development
yarn start:admin:val    # Validation
yarn start:admin:prod   # Production
```

## Docker Deployment

### Build Images

```bash
# Backend
cd ai-endo-elearning-service
docker build -t endo4life-backend:latest .

# Admin Web
cd ai-endo-elearning-web
docker build -f ./docker/admin-web/Dockerfile -t endo4life-admin:latest . --build-arg APP_ENV=prod

# Student Web
docker build -f ./docker/student-web/Dockerfile -t endo4life-student:latest . --build-arg APP_ENV=prod
```

### Run Containers

```bash
# Backend
docker run -d -p 8080:8080 --name endo4life-backend endo4life-backend:latest

# Admin Web
docker run -d -p 3100:80 --name endo4life-admin endo4life-admin:latest

# Student Web
docker run -d -p 3101:80 --name endo4life-student endo4life-student:latest
```

## Development

### Code Generation

```bash
# Generate API clients from OpenAPI spec
yarn codegen
```

### Linting

```bash
# Run linters for all projects
yarn lint
```

### Building

```bash
# Build admin application
yarn build:admin:prod

# Build for different environments
yarn build:admin:dev    # Development
yarn build:admin:val    # Validation
```

## API Documentation

Once the backend is running, access the API documentation at:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/v3/api-docs`

## Environment Configuration

The application supports multiple environments:

- **Local**: Development with local services
- **Dev**: Development environment
- **Val**: Validation/staging environment
- **Prod**: Production environment

Environment-specific configurations are stored in `./env/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Technology Stack

### Backend

- Spring Boot 3.3.1
- Spring Security with OAuth2
- Spring Data JPA
- PostgreSQL
- Flyway (Database migrations)
- MapStruct (Object mapping)
- Lombok
- OpenAPI 3

### Frontend

- React 18.3.1
- TypeScript
- Nx (Monorepo tooling)
- Material-UI
- Redux Toolkit
- React Query
- React Hook Form
- Lexical (Rich text editor)
- i18next (Internationalization)

### DevOps

- Docker
- GitLab CI/CD
- Maven
- Yarn

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue in this repository
- Contact the development team

## Project Status

Active development - This project is currently under active development with regular updates and new features being added.
