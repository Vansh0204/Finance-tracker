# 🚀 Personal Finance Tracker - Project Walkthrough & Interview Guide

This document serves as a technical guide for the **Personal Finance Tracker** project. It highlights the architecture, advanced features, and technical challenges solved during development.

---

## 🏗️ 1. Technical Architecture

### **Tech Stack**
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Modern Responsive Design).
- **Backend**: Node.js, Express.js.
- **Database**: Supabase (PostgreSQL).
- **ORM**: Prisma (using v6.19.3 for stability).
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
- **Analytics**: Chart.js (CDN) for visual data representation.

### **Data Flow**
1.  **Frontend** sends requests to the **Express API** (hosted on Render).
2.  **Auth Middleware** verifies the JWT from `localStorage`.
3.  **Prisma Client** interacts with **Supabase PostgreSQL** via connection pooling (port 6543) or direct connection (port 5432).
4.  **Backend** returns JSON responses (or CSV blobs) back to the client.

---

## 🌟 2. Core & Advanced Features (Extra Credit)

### **A. Visual Analytics (Chart.js)**
- **Technical Detail**: Implemented a dynamic Doughnut chart that aggregates spending by category.
- **Aggregation**: The frontend fetches all transactions, calculates the total per category, and updates the `Chart.js` instance in real-time without page reloads.

### **B. Receipt Upload System**
- **Technical Detail**: Integrated `multer` middleware for handling `multipart/form-data`.
- **Storage**: Receipts are stored in `public/uploads/`.
- **Database**: The `receiptUrl` is saved in the `Transaction` model, allowing users to view receipts directly from the transaction list.

### **C. Intelligent Budget Alerts**
- **Technical Detail**: Used Prisma's `aggregate` function to calculate real-time spending vs. budget limits.
- **UI**: Implemented a "pulse" animation in CSS and color-coded progress bars (Green -> Orange -> Red) to give instant visual feedback on overspending.

### **D. Multi-Currency Support**
- **Technical Detail**: Added `currency` fields to the `Transaction` model and a mapping of `CURRENCY_SYMBOLS`.
- **Flexibility**: Users can track transactions in multiple currencies (USD, INR, EUR, GBP), and the UI dynamically renders the correct symbol for each entry.

### **E. Data Export (CSV)**
- **Technical Detail**: Built a frontend utility that converts the JSON transaction history into a CSV string and triggers a browser download using a `Blob` object.

---

## 🗄️ 3. Database Design

### **Prisma Schema Highlights**
- **Composite Unique Constraints**: 
    - `@@unique([categoryId, month, year, userId])` on the `Budget` model. This prevents duplicate budgets for the same category in the same month.
    - `@@unique([name, userId])` on `Category` to prevent duplicate categories per user.
- **Decimal Precision**: Used `@db.Decimal(12, 2)` for amounts to ensure financial accuracy, avoiding the floating-point errors common with `Float`.

---

## 🛠️ 4. Problem Solving (Challenges Overcome)

### **Challenge: Prisma 7 Configuration Bugs**
- **Situation**: Initially tried Prisma 7, but encountered issues with the new `prisma.config.ts` requirement on certain environments.
- **Action**: Downgraded to **Prisma 6.19.3** for better stability and legacy connection string support.
- **Result**: Successfully connected to Supabase without complex environment-specific workarounds.

### **Challenge: The "400 Bad Request" on Budgets**
- **Situation**: Users getting errors when trying to update an existing budget.
- **Action**: Replaced `prisma.create` with `prisma.upsert`. 
- **Result**: If a budget already exists, the app now updates the amount instead of crashing, providing a much smoother UX.

### **Challenge: Multi-Currency Aggregation**
- **Situation**: Aggregating totals for different currencies in the same dashboard.
- **Solution**: Implemented a unified summary logic where the primary currency is set by the user profile, but individual transactions retain their original currency code.

---

## 🛤️ 5. Future Roadmap
- **Google OAuth**: Integrating social login for faster onboarding.
- **Cloud Storage**: Moving receipts from local `uploads/` to **Supabase Storage** or **AWS S3** for better scalability.
- **Recurring Transactions**: Automating monthly rent or subscriptions.

---

## 🏁 7. Interview Checkpoints (What to Say & Show)

### **Checkpoint 1: Backend Foundation**
- **What to Say**: "I started by building a robust foundation using Node.js and Supabase. I chose Prisma as the ORM because it gives me type-safety and easy migrations. I implemented JWT-based authentication to ensure that every user's financial data is private and secure."
- **What to Show**: 
    - Open `src/index.js` to show the middleware stack.
    - Open `prisma/schema.prisma` to show the `User` and `Transaction` models.
    - Demonstrate a successful `POST /auth/register` in the console.

### **Checkpoint 2: Backend Testing & Frontend Integration**
- **What to Say**: "Once the API was solid, I focused on the bridge between the backend and the UI. I used Vanilla JS to handle asynchronous state. I implemented a `checkAuth` logic that persists the user session on page reloads and automatically routes them to the dashboard."
- **What to Show**:
    - Open `public/js/app.js` and show the `fetch` calls with the `Authorization` header.
    - Show the browser's `localStorage` containing the JWT token.
    - Refresh the dashboard to show that the user stays logged in.

### **Checkpoint 3: E2E Functionality (The "Wow" Factor)**
- **What to Say**: "The final stage was implementing the advanced features. I integrated Chart.js for visual spending analysis, built a CSV export tool for data portability, and added a file upload system for receipts. I also ensured multi-currency support to make the app ready for international use."
- **What to Show**:
    - **Visuals**: Show the Doughnut chart updating as you add an expense.
    - **Portability**: Click "Download CSV" and open the file.
    - **Receipts**: Upload an image and click "View" in the transaction table.
    - **Alerts**: Show the budget bar pulsing Red when a limit is exceeded.

---

## 💡 8. Interview "Pro-Tips"

- **"Why Vanilla JS?"**: Explain that you wanted to demonstrate a deep understanding of DOM manipulation, asynchronous fetch requests, and state management without the "magic" of a framework.
- **"Why Supabase?"**: Highlight the ease of PostgreSQL scaling and the powerful Prisma integration.
- **"How did you handle security?"**: Mention JWT tokens, password hashing, and protecting routes with middleware.

---
