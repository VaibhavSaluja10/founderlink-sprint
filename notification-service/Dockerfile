FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar notification-service.jar
EXPOSE 8067
ENTRYPOINT ["java", "-jar", "notification-service.jar"]
