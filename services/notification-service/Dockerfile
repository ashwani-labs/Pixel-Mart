FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY gateway/pom.xml gateway/
COPY services/auth-service/pom.xml services/auth-service/
COPY services/catalog-service/pom.xml services/catalog-service/
COPY services/order-service/pom.xml services/order-service/
COPY services/notification-service/pom.xml services/notification-service/
RUN mvn -B -pl services/notification-service -am dependency:go-offline -DskipTests

COPY gateway gateway
COPY services/auth-service/pom.xml services/auth-service/
COPY services/catalog-service/pom.xml services/catalog-service/
COPY services/order-service/pom.xml services/order-service/
COPY services/notification-service services/notification-service
RUN mvn -B -pl services/notification-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/services/notification-service/target/notification-service-*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
