FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar investment-service.jar
EXPOSE 8064
ENTRYPOINT ["java", "-jar", "investment-service.jar"]
