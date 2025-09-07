FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /opt/app

# Copy Maven wrapper and configuration
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies (cache layer)
RUN ./mvnw dependency:go-offline

# Copy source code
COPY ./src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /opt/app

# Create non-root user for security
RUN groupadd -r endo4life && useradd -r -g endo4life endo4life

# Copy built jar from builder stage
COPY --from=builder /opt/app/target/endo4life-backend-*.jar /opt/app/app.jar

# Change ownership to non-root user
RUN chown endo4life:endo4life /opt/app/app.jar

# Switch to non-root user
USER endo4life

EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/opt/app/app.jar"]
