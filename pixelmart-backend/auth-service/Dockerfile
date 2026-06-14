# Build from monorepo root: docker compose build auth-service
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY pixelmart-backend/gateway/pom.xml pixelmart-backend/gateway/
COPY pixelmart-backend/auth-service/pom.xml pixelmart-backend/auth-service/
COPY pixelmart-backend/catalog-service/pom.xml pixelmart-backend/catalog-service/
COPY pixelmart-backend/order-service/pom.xml pixelmart-backend/order-service/
COPY pixelmart-backend/notification-service/pom.xml pixelmart-backend/notification-service/
RUN mvn -B -pl pixelmart-backend/auth-service -am dependency:go-offline -DskipTests

COPY pixelmart-backend/gateway pixelmart-backend/gateway
COPY pixelmart-backend/auth-service/pom.xml pixelmart-backend/auth-service/
COPY pixelmart-backend/auth-service/src pixelmart-backend/auth-service/src
COPY pixelmart-backend/catalog-service/pom.xml pixelmart-backend/catalog-service/
COPY pixelmart-backend/order-service/pom.xml pixelmart-backend/order-service/
COPY pixelmart-backend/notification-service/pom.xml pixelmart-backend/notification-service/
RUN mvn -B -pl pixelmart-backend/auth-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/pixelmart-backend/auth-service/target/auth-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
