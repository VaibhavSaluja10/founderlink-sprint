FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar gateway-service.jar
EXPOSE 8060
ENTRYPOINT ["java", "-jar", "gateway-service.jar"]
