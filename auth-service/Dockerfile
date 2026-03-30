FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar auth-service.jar
EXPOSE 8061
ENTRYPOINT ["java", "-jar", "auth-service.jar"]
