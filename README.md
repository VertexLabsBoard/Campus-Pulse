# 🏛️ Campus Pulse

> **Amity University Issue Dispatch & Resolution Platform**  
> Report a campus problem in under 30 seconds. Track live SLA timers. Resolve issues collaboratively.

---

## 🌟 Overview

**Campus Pulse** is a full-stack, enterprise-grade university incident management platform built for Amity University. It streamlines how students report campus maintenance, IT, electrical, and lab issues, and gives university staff and administrators real-time dispatch and SLA resolution capabilities.

### ✨ Key Features
- 🎓 **Amity University Verified Authentication:**
  - Student registration restricted to `@s.amity.edu` with enrollment validation (`A...`).
  - Staff registration restricted to `@amity.edu`.
  - Secure 6-digit Email OTP verification with rate limiting and database persistence.
  - Development Auto-Fill helper for instant local testing without an active email server.
- ⚡ **Rapid QR Code Issue Reporting:** Report problems in classrooms, labs, or hostels in under 30 seconds.
- ⏱️ **Live SLA Policies & Status Timers:** Auto-assigned resolution deadlines (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with real-time countdowns.
- 📣 **Community Placards & Upvoting:** Students upvote existing tickets to amplify visibility and prevent duplicates.
- 👥 **Role-Based Workspaces:**
  - **Student View:** Feed of campus issues, personal ticket history, upvoting, feedback ratings.
  - **Staff Dispatch View:** Internal ticket triage, status updates (`ASSIGNED`, `IN_PROGRESS`, `RESOLVED`), work notes.
  - **Admin View:** University-wide analytics, department resolution rates, and SLA audits.

---

## 🗂️ Project Structure

```
Campus Pulse/
├── backend/                   ← Spring Boot 3 (Java 21) REST API
│   ├── src/main/java/         ← Controllers, Services, Entities, Security
│   ├── src/main/resources/    ← Config & Flyway Database Migrations (V1–V7)
│   ├── .env.example           ← Environment variable template
│   └── pom.xml                ← Maven dependencies
├── frontend/                  ← React 19 + TypeScript (Vite)
│   ├── src/App.tsx            ← Campus Pulse application & state
│   ├── src/data/              ← Amity campus & full course directory
│   └── package.json           ← Dependencies & scripts
├── docs/                      ← Architecture, SRS, and schemas
├── .env.example               ← Root environment variables template
├── .gitignore                 ← Security-hardened gitignore (blocks all secrets)
└── start-supabase.ps1         ← 1-click Windows startup script
```

---

## 📖 Quick Links & Documentation

- 📘 **[Step-by-Step Setup & Keys Guide (SETUP_GUIDE.md)](./SETUP_GUIDE.md)** — Detailed instructions on what keys you need, how to get them, and how to run the app in different modes.
- 📐 **[Project Specifications (PROJECT_SPEC.md)](./PROJECT_SPEC.md)** — Full technical architecture and feature requirements.
- 📑 **[System Documentation (docs/)](./docs/README.md)** — SRS, entity diagrams, and workflow charts.

---

## 🔑 What Keys / APIs Do You Need to Add?

| Mode | Keys / APIs Required? | What You Need |
|---|---|---|
| **🧪 Local Dev / Testing** | ❌ **NONE (Zero setup!)** | Just run the app! Embedded database and on-screen OTP auto-fill work immediately. |
| **☁️ Cloud Supabase Mode** | ✅ **Database credentials** | Free Supabase PostgreSQL connection string + DB password in `.env`. |
| **📬 Real Email Delivery** | ⚡ **Optional SMTP / API key** | 16-character Google App Password (free) or Resend API key (`re_...`). |

> 👉 **See the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions on obtaining these free keys.**

---

## 📋 Prerequisites

Make sure you have the following installed:
- **Java JDK 21+** ([Eclipse Temurin](https://adoptium.net/) or OpenJDK)
- **Node.js 18+** ([NodeJS.org](https://nodejs.org/))
- **Git**

---

## 🚀 Quick Start (Easiest Way)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/campus-pulse.git
cd campus-pulse
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
# On Windows PowerShell:
Copy-Item backend\.env.example backend\.env

# On Mac / Linux:
cp backend/.env.example backend/.env
```

Open `backend/.env` in any text editor and fill in your database credentials (see [Database Setup](#-database-setup) below).

### 3. Launch the Application

#### Option A — Windows 1-Click Script (Recommended)
Simply run:
```powershell
.\start-supabase.ps1
```
This automatically loads your `.env` variables and starts both the Backend and Frontend in separate windows!

#### Option B — Manual Launch (Any OS)

**Terminal 1 — Backend (Spring Boot):**
```bash
cd backend
./mvnw spring-boot:run
# On Windows PowerShell:
# .\mvnw.cmd spring-boot:run
```
*Backend runs on: [http://localhost:8080](http://localhost:8080)*

**Terminal 2 — Frontend (Vite):**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: [http://localhost:5173](http://localhost:5173)*

---

## 🗄️ Database Setup

Campus Pulse uses PostgreSQL. You can use either **Cloud Supabase** (free) or a **Local PostgreSQL database**.

### Option 1: Supabase (Recommended — Free Cloud PostgreSQL)
1. Create a free account at [Supabase.com](https://supabase.com).
2. Create a new project named **Campus Pulse** (choose a region near you, e.g., Mumbai / `ap-south-1`).
3. Set your Database Password and save it.
4. Go to **Project Settings** → **Database** → **Connection String** → select **Session Pooler** (URI).
5. Copy the connection string and paste it into `backend/.env`:
   ```properties
   SPRING_PROFILES_ACTIVE=supabase
   SUPABASE_DB_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
   SUPABASE_DB_USER=postgres.your_project_ref
   SUPABASE_DB_PASSWORD=YourDatabasePassword
   ```
6. **Flyway Migrations Run Automatically:** When the backend boots, Flyway will automatically execute migrations `V1` through `V7`, creating all tables (`users`, `issues`, `departments`, `locations`, `otps`, etc.) and seeding initial campus data!

### Option 2: Local PostgreSQL / Docker
If running PostgreSQL locally or via Docker:
```bash
docker compose up db -d
```
In `backend/.env`:
```properties
SPRING_PROFILES_ACTIVE=local
DB_URL=jdbc:postgresql://localhost:5432/campus_pulse
DB_USERNAME=campus_pulse
DB_PASSWORD=changeme
```

---

## 📧 Email OTP Setup

Campus Pulse includes an automated OTP generation and verification engine.

### 🧪 Development Mode (Zero Setup Needed)
If you don't configure SMTP credentials, the backend runs in **Dev Mode**:
- OTPs are saved in PostgreSQL and logged to the terminal console.
- The frontend displays a convenient **`⚡ Dev Testing OTP`** badge with a 1-click **Auto-Fill** button.
- You can test the entire registration and sign-in flow immediately without needing an email provider!

### 📬 Real Email Delivery to Inboxes
To have verification emails land directly in student `@s.amity.edu` Outlook inboxes:

#### 1. Gmail SMTP (Recommended — 100% Free)
1. Go to your [Google Account Security](https://myaccount.google.com/security) (make sure 2-Step Verification is ON).
2. Search **"App passwords"**, create one named **`Campus Pulse`**, and copy the 16-character code.
3. In `backend/.env`, set:
   ```properties
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your_gmail@gmail.com
   SPRING_MAIL_PASSWORD=your_16_char_app_password
   ```

#### 2. Resend API
1. Create an API key at [Resend.com](https://resend.com).
2. In `backend/.env`, set:
   ```properties
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM=Campus Pulse <onboarding@resend.dev>
   ```
   *(Note: Resend's free sandbox sends to your verified Resend account email unless a custom domain DNS is verified).*

---

## 🔑 Default Accounts for Testing

The database automatically seeds with pre-configured accounts:

| Role | Email | Campus | Description |
|---|---|---|---|
| **Student** | `student1@s.amity.edu` | Noida | Undergraduate Student |
| **Student** | `student2@s.amity.edu` | Noida | Postgraduate Student |
| **Staff (IT)** | `staff.it@amity.edu` | Noida | IT Support Technician |
| **Staff (Housekeeping)** | `staff.housekeeping@amity.edu` | Noida | Facilities Specialist |
| **Staff (Electrical)** | `staff.electrical@amity.edu` | Noida | Maintenance Engineer |
| **Admin** | `admin@amity.edu` | Noida | Campus Operations Director |

*(You can sign in to any of these using the passwordless OTP flow, or register a new student account using your own `@s.amity.edu` email).*

---

## 🔒 Security & Privacy Notice

- **No Secrets in Git:** All passwords, tokens, private keys, and `.env` files are ignored via [.gitignore](file:///.gitignore).
- **Public Repository Safe:** Never commit `.env` to GitHub. Only commit `.env.example`.
- **Amity Data Integrity:** Misinformation in registrations or unauthorized escalation is strictly logged in audit tables for administrative review.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests:
```bash
cd backend
./mvnw test
# Windows: .\mvnw.cmd test
```
*Runs 19 comprehensive tests against in-memory H2 with mock authentication and Amity rule validations.*

### Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 📚 API Documentation

When the backend is running, explore the interactive OpenAPI / Swagger UI:
- **Swagger Documentation:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **Health Check:** [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
