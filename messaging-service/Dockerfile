FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar messaging-service.jar
EXPOSE 8066
ENTRYPOINT ["java", "-jar", "messaging-service.jar"]
