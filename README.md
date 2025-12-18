<div align="center">

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&pause=1000&color=336791;BC13FE;00F0FF&center=true&vCenter=true&width=600&lines=Email+Service;Spring+Boot+%2B+Angular;Powered+by+PostgreSQL" alt="Typing SVG" />
</a>

<p>
    <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Java_SMTP-007396?style=for-the-badge&logo=openjdk&logoColor=white" />
</p>

<a href="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/archive/refs/heads/main.zip">
  <img src="https://img.shields.io/badge/Download-Latest_Release-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="Download Now"/>
</a>

</div>

---

## 📧 Project Overview

> A full-stack email simulation platform. Users can register, compose emails, and manage their inbox with real-time updates. The system ensures data persistence using **PostgreSQL** and secure API communication via **Spring Boot**.

---

## ⚡ Functionality

![App Demo](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmUzZnZ2b2R5NGkzOTQ3N2YzZW95bW54YXd3aDN1djAxMDJhZmN6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oz8xSwIOv5FGhZFjq/giphy.gif)

---

## 🛠️ System Architecture

This system follows a layered architecture with a relational database.

```mermaid
graph LR
    Client[Angular Client] -- JSON/HTTP --> Controller[Spring Controller]
    Controller --> Service[Email Logic Service]
    Service -- JDBC/JPA --> DB[(PostgreSQL Database)]
    Service -- SMTP --> MailServer[JavaMailSender]
    DB -- Data Persistence --> Service
```
# 🚀 Key Features

# 💻 How to Run
1. Database Setup
Ensure PostgreSQL is installed and running. Create a database named email_db.

2. Backend Configuration
Update src/main/resources/application.properties:

Properties

spring.datasource.url=jdbc:postgresql://localhost:5432/email_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
3. Start Application



# Backend
```
Bash
cd backend
mvn spring-boot:run
Server runs on: http://localhost:8080
```
---


# Frontend
```
cd frontend
npm install
ng serve
Open browser at: http://localhost:4200
```

---

# 👨‍💻 Author
Mohamed G. AbdAlzaher  ✅
--
Mohamed Mahmoud Ali ✅
--
Mohamed Gamal Eldin ✅
--
Anas Mahmoud ✅
--
