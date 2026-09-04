# 🚀 Complete Deployment Guide: Hostinger + Render + MongoDB Cloud Atlas

This guide provides step-by-step instructions to deploy **THE SM GROUPS Enterprise Management System (EMS)** to production using **Render.com** (for Node.js Backend API) and **Hostinger** (for Vite React Frontend).

---

## 🏗 System Architecture Overview
- **Database**: MongoDB Cloud Atlas (Database: `id_scan`) — *Persists data across all server restarts*.
- **Backend API**: Node.js + Express.js hosted on **Render.com** Web Service.
- **Frontend SPA**: React + Vite hosted on **Hostinger** (Apache `public_html`).

---

## 📋 Step 1: Zip & Transfer Project to Company Laptop

1. Zip the entire `EMS` project directory.
   - *Note*: You can exclude `node_modules` folders to keep the zip file size small.
2. Unzip the project on your target company laptop.
3. Open terminal in both folders and run:
   ```bash
   # In backend directory
   cd backend
   npm install

   # In frontend directory
   cd frontend
   npm install
   ```

---

## ⚙️ Step 2: Deploy Backend to Render.com

1. Sign in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your Git repository (or upload code).
4. Configure Web Service details:
   - **Name**: `sm-groups-ems-backend` (or any custom name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add **Environment Variables** under *Settings -> Environment*:
   - `MONGO_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection string from `backend/.env`)
   - `JWT_SECRET` = `your_jwt_secret_key`
   - `PORT` = `5000` (Render will assign its own port dynamically)
6. Click **Create Web Service**.
7. Once deployed, copy your Live Backend URL provided by Render (e.g. `https://sm-groups-ems-backend.onrender.com`).

---

## 🎨 Step 3: Configure & Build Frontend for Hostinger

1. Open `frontend/.env` (or create `frontend/.env.production`).
2. Update `VITE_API_URL` to point to your live Render Backend URL:
   ```env
   VITE_API_URL=https://sm-groups-ems-backend.onrender.com/api
   ```
3. Open terminal in `frontend/` and run:
   ```bash
   npm run build
   ```
4. This creates a production-ready `frontend/dist` folder.
   - *Note*: The `.htaccess` file for React Router SPA routing is automatically bundled inside `dist/`.

---

## 🌐 Step 4: Deploy Frontend to Hostinger `public_html`

1. Log in to your Hostinger hPanel.
2. Go to **File Manager** -> Open `public_html`.
3. Open your local `frontend/dist` folder.
4. Upload **ALL CONTENTS** of `frontend/dist/` directly into Hostinger `public_html`:
   - `index.html`
   - `.htaccess`
   - `assets/` (CSS, JS, images)
5. Ensure `.htaccess` is present in `public_html` so React Router paths (`/admin`, `/employee/attendance`, `/scan`) refresh seamlessly without 404 errors.

---

## ⚡ Step 5: Post-Deployment Verification Checklist

- [ ] Visit your Hostinger domain (e.g., `https://yourcompany.com`).
- [ ] Log in with Admin credentials (`admin@company.com` / `Password@123`).
- [ ] Test Employee Directory, QR Code Scanner (`/scan`), and Attendance check-in.
- [ ] Verify real-time data persistence with MongoDB Cloud Atlas.

---

*Guide generated for THE SM GROUPS Enterprise Management System.*
