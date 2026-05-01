# FounderLink - Microservices Sprint Project

FounderLink is a robust microservices-based ecosystem designed to connect founders, investors, and team members. This project leverages Spring Boot, Spring Cloud, Docker, and RabbitMQ to provide a scalable and secure platform for managing startups and investments.

## 🏗️ Architecture Overiew

The system is built using a modern microservice architecture, comprising infrastructure services and specialized business services.

### Infrastructure Services
- **Eureka Service (Port 8760)**: Service discovery and registration.
- **Config Server (Port 8887)**: Centralized configuration management.
- **API Gateway (Port 8060)**: Single entry point for all client requests, routing traffic to relevant services.
- **Zipkin (Port 9411)**: Distributed tracing and observability.
- **RabbitMQ (Ports 5672, 15672)**: Event-driven communication for asynchronous tasks.

### Business Microservices
- **Auth Service (Port 8061)**: Handles JWT-based authentication and security.
- **User Service (Port 8062)**: Manages user profiles (Founders/Investors).
- **Startup Service (Port 8063)**: Core logic for startups and project listings.
- **Investment Service (Port 8064)**: Manages investment proposals and tracking.
- **Team Service (Port 8065)**: Handles team recruitment and role management.
- **Messaging Service (Port 8066)**: Direct messaging between founders and investors.
- **Notification Service (Port 8067)**: Event-driven alerts and push notifications.

---

## 🛠️ Technology Stack
- **Framework**: Spring Boot 3.2.3
- **Cloud Components**: Netflix Eureka, Config Server, API Gateway
- **Security**: Spring Security & JWT (JSON Web Token)
- **Database**: MySQL 8.0
- **Messaging**: RabbitMQ
- **Tracing**: Micrometer & Zipkin
- **Documentation**: SpringDoc OpenAPI / Swagger

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** installed.
- **Maven** installed.
- **Docker & Docker Compose** installed.

### Method 1: Run with Docker Compose (Recommended)
This method spins up all services and infrastructure (MySQL, RabbitMQ, Zipkin) automatically.

1.  Build the project:
    ```bash
    mvn clean install -DskipTests
    ```
2.  Start the containers:
    ```bash
    docker-compose up --build
    ```

### Method 2: Run Locally (via IDE)
If you wish to run individual services for debugging:

1.  **Start Infrastructure Services** via Docker:
    ```bash
    docker-compose up mysql-db rabbitmq zipkin
    ```
2.  **Order of Execution**: Start services in this specific order:
    1.  `Eureka-Service`
    2.  `Config-Server`
    3.  `Auth-Service`
    4.  All other business services.

> [!IMPORTANT]
> If running locally (not in Docker), update the `spring.datasource.url` in individual `application.yml` files to use `localhost` instead of `mysql-db`.

---

## 📡 API Endpoints
All business service endpoints are exposed through the **API Gateway** on port `8060`.
- **Auth**: `/auth/**`
- **Users**: `/users/**`
- **Startups**: `/startups/**`
- **Investments**: `/investments/**`

You can view the full API documentation (Swagger) by visiting any service port at `/swagger-ui.html`.

---

## 📄 License
This project was developed as part of the Capgemini Sprint project.
