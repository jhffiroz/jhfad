# Ad Reward Platform 🚀
A premium, highly secure, full-stack video-ad earning and KYC-compliance platform.

> **Made with ❤️ by Jahid Hasan**

---

## 🌟 Highlights & Core Features

### 1. 📺 Smart Ad Player & Earning Engine
- **Dynamic Rewards**: Users watch real-time or configured video advertisements to earn BDT rewards.
- **Anti-Spoofing & Fraud Detection**: Includes client-time elapsed verification and server-side checks. Attempting to bypass the timer triggers anti-cheating audit trail flags.
- **Real-time Balance Updates**: User wallets instantly update with BDT rewards on successful ad completion.

### 2. 🛡️ Intelligent KYC Verification (Selfie & ID)
- **Webcam/Camera Capture**: Live capture of ID cards and user selfies directly from the interface.
- **Simulated AI OCR Extraction**: Automatically extracts details like Full Name, National ID Number, and Date of Birth from captured ID images.
- **Dossier & Audit Trail**: Admin can manually approve, reject, or request re-submission for pending KYC requests.

### 3. 💳 Premium Club Membership Upgrade
- **Tier-based Benefits**: Upgrade from standard accounts to **Premium Bronze, Silver, or Gold** to gain higher payouts per ad.
- **Transaction Verification**: Users initiate an upgrade by providing a translation ID (TxID) of their BKash, Nagad, or Rocket mobile banking deposit.
- **Approval Queue**: Admins verify deposits, matching transaction IDs to approve upgraded tiers.

### 4. 💸 Secure Withdrawal & Payout Engine
- **Multi-Method Payouts**: Integrates with leading mobile financial services including BKash, Nagad, and Rocket.
- **Fulfillment Operations**: Admin panel with instant payout triggers, allowing direct status toggles (`PENDING`, `APPROVED`, `REJECTED`).

### 5. 👑 Comprehensive Admin Control Center
- **System Statistics Overview**: Visual dashboards tracking platform-wide revenue, active users, pending withdrawals, and total served ad hours.
- **User Management Operations**: Admins can inspect complete details, approve manually, or issue instant account bans/unbans.
- **Security Audit Logs**: High-fidelity system compliance trail logs tracking every event, authentication request, payment reviewed, and fraud triggers.

---

## ⚙️ Technical Architecture

This application is built as a highly optimized, single-directory full-stack application using **React (TS) + Vite + Tailwind CSS** on the client side, and **Express + TypeScript Parser (`tsx`)** on the server side.

- **Frontend**: Single-directory modular React component structures:
  - `App.tsx`: Context orchestration, session storage checking, and app views.
  - `UserDashboard.tsx`: Wallet management, ad watching interfaces, and historical rewards tracking.
  - `AdminPanel.tsx`: Audit logs, user list, withdrawal requests, and KYC evaluations.
  - `KycCapture.tsx`: Webcam hooks, camera canvas frames, and AI extraction wrappers.
  - `AdPlayer.tsx`: Smooth timer controls and completion validators.
  - `UpgradePremium.tsx` & `WithdrawalModal.tsx`: Cash-in deposits and payout configurations.
- **Backend (`server.ts`)**: Built-in REST APIs, session token verification, and fallback middleware that serves the compiled React client smoothly in production.

---

## 🌐 How to Deploy to Railway

The app is fully pre-configured and 100% prepared for instant deployment to cloud container platforms like **Railway**. Follow these instructions:

### Step 1: Push to GitHub
Create a new GitHub repository and push this codebase:
```bash
git init
git add .
git commit -m "feat: Ad Reward Platform complete"
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 2: Set Up Railway App
1. Go to [Railway.app](https://railway.app/) and sign in with your GitHub account.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.

### Step 3: Configure Environment Variables
In the **Variables** tab of your Railway service, add:
- `PORT` (Railway will automatically provision this, our `server.ts` resolves it dynamically using `process.env.PORT`).
- `NODE_ENV` = `production`

### Step 4: Verification & Run Commands
Railway will automatically read the `package.json` scripts and run the optimal commands:
- **Build Phase**: Executes `npm run build` which bundles both high-performance frontend static files into `dist/` and compiles the Express backend seamlessly to commonJS (`dist/server.cjs`).
- **Start Phase**: Running `npm run start` launches Node behind their cloud proxy (`node dist/server.cjs`) to render the full stack instantly.

---

## 🔬 Local Development Instructions

Ready to run locally? Follow these simple steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the live dashboard!

3. **Production Test Build**:
   ```bash
   npm run build
   npm run start
   ```

---
*Created by **Jahid Hasan** as a secure, high-yield, premium-performance Ad Earn system.*
