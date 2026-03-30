FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar config-server.jar
EXPOSE 8887
ENTRYPOINT ["java", "-jar", "config-server.jar"]
