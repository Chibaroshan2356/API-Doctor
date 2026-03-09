# 🩺 API Doctor – API Monitoring System

API Doctor is a **Spring Boot based API monitoring system** that periodically checks the health and performance of external APIs.
It measures **response time, status codes, and uptime metrics**, storing the results in a database for monitoring and analysis.

---

## 🚀 Features

* 🔄 **Scheduled API Monitoring** using Spring Boot `@Scheduled`
* 🌐 **Non-blocking HTTP calls** with **WebClient (Spring WebFlux)**
* 🗄 **Metrics storage** using **PostgreSQL**
* 📊 **API Monitoring Dashboard Endpoint**
* ⚡ **Response time measurement**
* ❌ **Failure detection & error handling**
* 🔧 **Dynamic API configuration from database**

---

## 🏗 Project Architecture

```
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL Database
```

Monitoring Flow:

```
Scheduler
   ↓
WebClient API Call
   ↓
Capture Response Metrics
   ↓
Store Metrics in Database
   ↓
Expose Monitoring API
```

---

## 🛠 Tech Stack

| Technology     | Purpose               |
| -------------- | --------------------- |
| Java 17        | Programming language  |
| Spring Boot    | Backend framework     |
| Spring WebFlux | Reactive HTTP client  |
| PostgreSQL     | Metrics database      |
| Maven          | Dependency management |
| Git & GitHub   | Version control       |

---

## 📂 Project Structure

```
src/main/java/com/apidoctor/api_doctor
│
├── config        → WebClient configuration
├── controller    → REST API endpoints
├── service       → Business logic
├── repository    → Database operations
├── entity        → JPA entities
├── dto           → Data transfer objects
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Chibaroshan2356/API-Doctor.git
cd API-Doctor
```

---

### 2️⃣ Configure Database

Update `application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/apidoctor
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

---

### 3️⃣ Run the Application

```
mvn spring-boot:run
```

Server will start at:

```
http://localhost:8080
```

---

## 📡 API Endpoints

### Get API Metrics Summary

```
GET /api/metrics
```

Example Response:

```json
[
  {
    "apiName": "Google",
    "avgResponseTime": 140.5,
    "totalChecks": 20,
    "successCount": 20
  }
]
```

---

### Health Check

```
GET /api/health
```

---

## 📊 Database Tables

### `api_config`

Stores APIs to monitor.

| Column          | Description          |
| --------------- | -------------------- |
| id              | API ID               |
| name            | API Name             |
| url             | API URL              |
| expected_status | Expected HTTP Status |

---

### `api_metrics`

Stores monitoring results.

| Column           | Description      |
| ---------------- | ---------------- |
| api_name         | API name         |
| response_time_ms | Response time    |
| status_code      | HTTP status      |
| success          | API success flag |
| checked_at       | Timestamp        |

---

## 📈 Future Improvements

* 📊 Real-time monitoring dashboard
* 📧 Email alerts for API failures
* ⚡ Parallel API monitoring
* 📉 Uptime percentage calculation
* 🌐 React frontend dashboard

---

## 👨‍💻 Author

**Chiba Roshan**
Software Developer | Web Development | Backend Systems

GitHub:
https://github.com/Chibaroshan2356
