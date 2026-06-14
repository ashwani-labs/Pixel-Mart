FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY pixelmart-backend/gateway/pom.xml pixelmart-backend/gateway/
COPY pixelmart-backend/auth-service/pom.xml pixelmart-backend/auth-service/
COPY pixelmart-backend/catalog-service/pom.xml pixelmart-backend/catalog-service/
COPY pixelmart-backend/order-service/pom.xml pixelmart-backend/order-service/
COPY pixelmart-backend/notification-service/pom.xml pixelmart-backend/notification-service/
RUN mvn -B -pl pixelmart-backend/catalog-service -am dependency:go-offline -DskipTests

COPY pixelmart-backend/gateway pixelmart-backend/gateway
COPY pixelmart-backend/auth-service/pom.xml pixelmart-backend/auth-service/
COPY pixelmart-backend/catalog-service/pom.xml pixelmart-backend/catalog-service/
COPY pixelmart-backend/catalog-service/src pixelmart-backend/catalog-service/src
COPY pixelmart-backend/order-service/pom.xml pixelmart-backend/order-service/
COPY pixelmart-backend/notification-service/pom.xml pixelmart-backend/notification-service/
RUN mvn -B -pl pixelmart-backend/catalog-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/pixelmart-backend/catalog-service/target/catalog-service-*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
