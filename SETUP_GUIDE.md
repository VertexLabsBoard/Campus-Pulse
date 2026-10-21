# 🛠️ Campus Pulse — Step-by-Step Setup & Keys Guide

This guide explains **how to run Campus Pulse** and **what keys or APIs you need to provide**.

---

## 🎯 Quick Answer: Do I need any keys to run this?

| If you want to... | Do you need any keys or APIs? | What to do |
|---|---|---|
| **Just test/demo the app locally** | ❌ **NO KEYS NEEDED** | Run backend & frontend with default settings. It uses an embedded database and shows OTP codes directly on your screen! |
| **Store data in the cloud (Supabase)** | ✅ **YES** (Supabase connection string + DB password) | Free setup on Supabase.com (takes ~2 minutes). |
| **Send real emails to college Outlook inboxes** | ⚡ **OPTIONAL** (Google App Password or Resend API key) | Free setup via Gmail or Resend. |

---

## 🔑 Summary of All Keys & Environment Variables

All keys and configuration values go into a file named **`.env`** inside the `backend/` folder (or project root).  
*(Copy `.env.example` to create your `.env` file).*

| Variable Name | Required? | Where to Get It | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Optional (default: `local`) | Set to `supabase` or `local` | Tells Spring Boot which database configuration to use. |
| `SUPABASE_DB_URL` | Only if using Supabase | Supabase Dashboard → Project Settings → Database → Connection String (Session Pooler) | The JDBC URL to your Supabase PostgreSQL database. |
| `SUPABASE_DB_USER` | Only if using Supabase | Supabase Dashboard → Project Settings → Database → Connection String | Usually `postgres.<your-project-ref>`. |
| `SUPABASE_DB_PASSWORD` | Only if using Supabase | The password you chose when creating your Supabase project | Database password for PostgreSQL. |
| `SPRING_MAIL_HOST` | Only for real emails | `smtp.gmail.com` | SMTP host for email dispatch. |
| `SPRING_MAIL_PORT` | Only for real emails | `587` | SMTP port (STARTTLS). |
| `SPRING_MAIL_USERNAME` | Only for real emails | Your Gmail address (`your.email@gmail.com`) | Your email address. |
| `SPRING_MAIL_PASSWORD` | Only for real emails | [Google Account Security](https://myaccount.google.com/security) → App Passwords | 16-character Google App Password (NOT your regular password). |
| `RESEND_API_KEY` | Optional alternative to Gmail | [Resend.com](https://resend.com) → API Keys | Starts with `re_...` for transactional email dispatch. |

---

## 🚀 How to Run the App (Choose Your Setup)

### 🟢 Option 1: Zero-Config Mode (No Accounts or Keys Needed)

You can run Campus Pulse right now without creating any accounts or entering any keys!

1. Open a terminal in the project folder.
2. Start the Backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   # On Windows: .\mvnw.cmd spring-boot:run
   ```
3. Open a second terminal and start the Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open your browser to **[http://localhost:5173](http://localhost:5173)**.
5. **How testing works in this mode:**
   - When registering with an `@s.amity.edu` email, the 6-digit OTP code will appear directly on screen in a yellow **`⚡ Dev Testing OTP`** badge with a 1-click **Auto-Fill** button.
   - All data is saved in a local embedded database.

---

### 🔵 Option 2: Cloud Database Mode (Supabase Free Tier)

If you want your users, tickets, and OTP records saved in a live online database:

#### Step 1: Create your Supabase Project (2 Minutes)
1. Go to **[supabase.com](https://supabase.com)** and create a free account.
2. Click **New Project**:
   - **Name:** `Campus Pulse`
   - **Database Password:** Choose a secure password and remember it!
   - **Region:** Choose a region close to you (e.g. `ap-south-1` Mumbai).
3. Click **Create new project** and wait ~1 minute for it to set up.

#### Step 2: Copy Connection Details
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) → **Database**.
2. Scroll to **Connection string** and select the **Session pooler** (URI mode).
3. It will look like this:
   ```
   jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?user=postgres.YOUR_PROJECT_REF&password=[YOUR-PASSWORD]
   ```

#### Step 3: Add to `backend/.env`
Create `backend/.env` (copy from `backend/.env.example`) and fill in:
```properties
SPRING_PROFILES_ACTIVE=supabase
SUPABASE_DB_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres.YOUR_PROJECT_REF
SUPABASE_DB_PASSWORD=YourChosenPassword
```

#### Step 4: Run
- **On Windows:** Double-click or run `.\start-supabase.ps1`.
- **On Mac/Linux:** Start backend with `./mvnw spring-boot:run` and frontend with `npm run dev`.

> **Note:** Flyway automatically creates all database tables (`users`, `issues`, `otps`, etc.) and seeds initial campus data the first time you boot!

---

### 🟣 Option 3: Real Email OTP Delivery (Optional)

If you want the 6-digit verification codes to physically land in college Microsoft Outlook inboxes (`@s.amity.edu`):

#### Using Gmail App Password (Recommended & 100% Free)
1. Log into your personal Google Account and visit **[Google Security](https://myaccount.google.com/security)**.
2. Make sure **2-Step Verification** is turned ON.
3. In the search bar at the top, type **"App passwords"** and click it.
4. Set App name to **`Campus Pulse`** and click **Create**.
5. Google will display a **16-letter password** (e.g. `abcd efgh ijkl mnop`).
6. Paste it into your `backend/.env`:
   ```properties
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your_gmail@gmail.com
   SPRING_MAIL_PASSWORD=your_16_letter_app_password
   ```

Now every OTP requested on the portal will be sent directly to student and staff inboxes with an official Amity-styled HTML email template!

---

## 🔒 Security Checklist for GitHub

Before pushing your code to GitHub:
- [x] **Never commit `.env`:** Keep all real passwords inside `.env`. The repository's `.gitignore` automatically blocks `.env`.
- [x] **Only commit `.env.example`:** `.env.example` contains safe placeholders for other developers.
- [x] **No hardcoded secrets:** Verified that all application properties files use environment variable overrides.
