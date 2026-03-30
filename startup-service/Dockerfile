FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar startup-service.jar
EXPOSE 8063
ENTRYPOINT ["java", "-jar", "startup-service.jar"]
