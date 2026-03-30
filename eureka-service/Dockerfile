FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar eureka-service.jar
EXPOSE 8760
ENTRYPOINT ["java", "-jar", "eureka-service.jar"]
