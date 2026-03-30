FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar user-service.jar
EXPOSE 8062
ENTRYPOINT ["java", "-jar", "user-service.jar"]
