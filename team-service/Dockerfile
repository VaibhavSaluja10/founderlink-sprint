FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar team-service.jar
EXPOSE 8065
ENTRYPOINT ["java", "-jar", "team-service.jar"]
