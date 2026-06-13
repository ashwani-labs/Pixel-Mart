# Build from monorepo root: docker compose build auth-service
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY e-commerce-backend/gateway/pom.xml e-commerce-backend/gateway/
COPY e-commerce-backend/auth-service/pom.xml e-commerce-backend/auth-service/
COPY e-commerce-backend/catalog-service/pom.xml e-commerce-backend/catalog-service/
COPY e-commerce-backend/order-service/pom.xml e-commerce-backend/order-service/
COPY e-commerce-backend/notification-service/pom.xml e-commerce-backend/notification-service/
RUN mvn -B -pl e-commerce-backend/auth-service -am dependency:go-offline -DskipTests

COPY e-commerce-backend/gateway e-commerce-backend/gateway
COPY e-commerce-backend/auth-service/pom.xml e-commerce-backend/auth-service/
COPY e-commerce-backend/auth-service/src e-commerce-backend/auth-service/src
COPY e-commerce-backend/catalog-service/pom.xml e-commerce-backend/catalog-service/
COPY e-commerce-backend/order-service/pom.xml e-commerce-backend/order-service/
COPY e-commerce-backend/notification-service/pom.xml e-commerce-backend/notification-service/
RUN mvn -B -pl e-commerce-backend/auth-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/e-commerce-backend/auth-service/target/auth-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
