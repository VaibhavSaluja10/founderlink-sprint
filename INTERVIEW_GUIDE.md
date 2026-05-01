# 🎓 FounderLink Microservices - Master Interview Guide

This guide contains everything you need to explain your project's advanced architecture, from **Feign Clients** to **Git-backed Config Servers**.

---

## 1. 🏗️ Global Architecture Overview
FounderLink uses a **Microservices Architecture** with a **Shared Nothing** database pattern (each service has its own DB).

### Key Components:
- **API Gateway**: The "Receptionist". It handles all incoming traffic (port 8060) and routes it.
- **Eureka Server**: The "Phonebook". Every service registers here so they can find each other by name (e.g., `STARTUP-SERVICE`) instead of IP addresses.
- **Config Server**: The "Brain". It holds all the settings in a central place.
- **Feign Client**: The "Declarative Communicator". It makes cross-service calls look like simple Java method calls.

---

## 2. 📡 Advanced Communication: Feign Client
Previously, we used `RestTemplate`. Now, we use **Feign Clients** in the `Team` and `Investment` services.

### Q: Why did you switch from RestTemplate to Feign?
> **A**: "RestTemplate is imperative and requires manual URL building and header management. **Feign is Declarative**. I just create an interface with `@FeignClient`, and Spring handles the rest. It's cleaner, more readable, and integrates perfectly with Eureka for Load Balancing."

### Q: How do you handle Security (JWT) between services?
> **A**: "I implemented a **Feign RequestInterceptor**. It automatically captures the JWT from the current request context and injects it into the outgoing Feign call. This ensures that when `Team Service` calls `Startup Service`, the user's identity is preserved."

---

## 3. 🧠 Centralized Configuration: Git Config Server
We moved from "local files" to a **GitHub-backed Config Server**.

### Q: Where are your configurations stored?
> **A**: "They are stored in a private/dedicated GitHub repository: `https://github.com/VaibhavSaluja10/founder-link-configServer.git`. The Config Server clones this repo on startup."

### Q: How do you handle different environments (Dev vs Prod)?
> **A**: "I use **Spring Profiles**. In GitHub, I have `service-dev.yml` for my local Docker environment (with debug logs and auto-update DBs) and `service-prod.yml` for production (with restricted CORS and environment-variable-based secrets)."

---

## 4. ✉️ Asynchronous Events: RabbitMQ
### Q: How does the Notification Service work?
> **A**: "It is a **Message Consumer**. When a Startup is created in `Startup Service`, a message is published to an **Exchange**. RabbitMQ routes it to a **Queue**, and the `Notification Service` (using `@RabbitListener`) picks it up to send an alert. This decouples the services—the Startup Service doesn't need to wait for the notification to be sent."

---

## 5. 🛡️ Security: Spring Security & JWT
### Q: How is the system secured?
> **A**: "We use **Stateless JWT Authentication**. The `Auth Service` issues a token. The `Gateway` and individual services use a `JwtFilter` to validate the token's signature. I've implemented **Role-Based Access Control (RBAC)**, so only `INVESTORS` can create investments and only `FOUNDERS` can manage teams."

---

## 🚀 Final Presentation Tip:
If asked to demo: 
1. Open **Eureka** ([http://localhost:8760](http://localhost:8760)) to show all services are "UP".
2. Open **RabbitMQ** ([http://localhost:15672](http://localhost:15672)) to show the message exchanges.
3. Show your **GitHub Config Repo** to demonstrate Cloud-Native configuration management.
