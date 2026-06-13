FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY e-commerce-backend/gateway/pom.xml e-commerce-backend/gateway/
COPY e-commerce-backend/auth-service/pom.xml e-commerce-backend/auth-service/
COPY e-commerce-backend/catalog-service/pom.xml e-commerce-backend/catalog-service/
COPY e-commerce-backend/order-service/pom.xml e-commerce-backend/order-service/
COPY e-commerce-backend/notification-service/pom.xml e-commerce-backend/notification-service/
RUN mvn -B -pl e-commerce-backend/catalog-service -am dependency:go-offline -DskipTests

COPY e-commerce-backend/gateway e-commerce-backend/gateway
COPY e-commerce-backend/auth-service/pom.xml e-commerce-backend/auth-service/
COPY e-commerce-backend/catalog-service/pom.xml e-commerce-backend/catalog-service/
COPY e-commerce-backend/catalog-service/src e-commerce-backend/catalog-service/src
COPY e-commerce-backend/order-service/pom.xml e-commerce-backend/order-service/
COPY e-commerce-backend/notification-service/pom.xml e-commerce-backend/notification-service/
RUN mvn -B -pl e-commerce-backend/catalog-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/e-commerce-backend/catalog-service/target/catalog-service-*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
