# Build from monorepo root: docker compose build auth-service
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY gateway/pom.xml gateway/
COPY services/auth-service/pom.xml services/auth-service/
COPY services/catalog-service/pom.xml services/catalog-service/
COPY services/order-service/pom.xml services/order-service/
COPY services/notification-service/pom.xml services/notification-service/
RUN mvn -B -pl services/auth-service -am dependency:go-offline -DskipTests

COPY gateway gateway
COPY services/auth-service/pom.xml services/auth-service/
COPY services/auth-service/src services/auth-service/src
COPY services/catalog-service/pom.xml services/catalog-service/
COPY services/order-service/pom.xml services/order-service/
COPY services/notification-service/pom.xml services/notification-service/
RUN mvn -B -pl services/auth-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/services/auth-service/target/auth-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
