# FounderLink Backend System

FounderLink is a platform designed to connect startup founders with investors and potential co-founders. This project is built using a **Microservices Architecture** with Spring Boot and Spring Cloud.

## 🏗️ Architecture Overview
- **API Gateway (8080):** Single entry point that routes requests to appropriate services and handles authentication.
- **Eureka Server (8761):** Service Registry where all microservices register themselves.
- **Auth Service (9898):** Manages user registration, login, and JWT token generation.
- **User Service (8081):** Manages user profiles (skills, bio, experience).
- **Startup Service (8082):** Handles startup listings and publishes `STARTUP_CREATED` events.
- **Investment Service (8083):** Manages investments and publishes `INVESTMENT_CREATED` events.
- **Team Service (8084):** Handles team invitations and publishes `TEAM_INVITE_SENT` events.
- **Messaging Service (8085):** Manages communication between users.
- **Notification Service (8086):** Consumes events from RabbitMQ and "sends" alerts.
- **Payment Service (8087):** Simulates payment processing (Stripe/Razorpay style).

## 🚀 Tech Stack
- **Core:** Spring Boot 3.2.0
- **Cloud:** Spring Cloud 2023.0.0 (Eureka, Gateway)
- **Security:** Spring Security + JWT
- **Messaging:** RabbitMQ
- **Database:** MySQL (One DB per service)
- **Third Party API:** CoinDesk API (Integration in Investment Service)
- **Build Tool:** Maven

## 🛠️ How to Run

### 1. Prerequisites
- Java 17
- Maven
- RabbitMQ
- MySQL (Ensure databases: `founderlink_auth`, `founderlink_user`, `founderlink_startup`, `founderlink_investment`, `founderlink_team`, `founderlink_messaging`, `founderlink_payment` exist or will be created).

### 2. Execution Order
1. **Eureka Server**
2. **Auth Service**
3. **API Gateway**
4. **All other services**

### 📝 New API Endpoints

#### Payments
- `POST /payments/create?amount=1000&userId=1` - Create Order
- `POST /payments/verify/{orderId}` - Verify Payment

#### Third Party Integration (Investment Service)
- `GET /investments/market-price/bitcoin` - Fetch live price from external API

#### Authentication
- `POST /auth/register` - {name, email, password, role}
- `POST /auth/login` - {email, password} -> Returns Token

#### Startups
- `POST /startups` - {name, description, industry, stage, fundingGoal, founderId}
- `GET /startups` - List all
- `GET /startups/search?industry=Tech` - Search

#### Investments
- `POST /investments` - {startupId, investorId, amount}
- `GET /investments/startup/{id}` - View by startup

#### Teams
- `POST /teams/invite` - {startupId, userId, role}

#### Messaging
- `POST /messages` - {senderId, receiverId, content}
- `GET /messages/conversation?user1=1&user2=2` - Chat history

