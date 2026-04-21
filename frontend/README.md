# JobLens

JobLens is a full-stack web application for reviewing job postings and flagging scam-like patterns before a user applies. The project combines a React frontend, an Express API, MongoDB persistence, JWT-based authentication, AI-assisted text analysis, and an optional Razorpay subscription flow.

## Project Overview

The app is designed around a simple workflow:

1. A user creates an account or signs in.
2. The user pastes a job description into the analyzer.
3. The backend evaluates the text and returns a risk score, verdict, signal breakdown, summary, reasons, and supporting evidence.
4. The analysis is saved to the user's history.
5. The user can revisit previous results or upgrade their plan through the subscription page.

This repository is split into two main parts:

- `frontend/`: React + Vite client application
- `backend/`: Node.js + Express API with MongoDB models and controllers

## Key Features

- User signup, login, and profile retrieval
- JWT-protected application routes
- AI-assisted job scam analysis
- Risk verdicts: `Low Risk`, `Medium Risk`, `High Risk`
- Signal scoring for:
  - suspicious language
  - payment request pressure
  - contact risk
  - company trust
- Evidence cards and user-friendly explanations
- Saved history of previous analyses
- Subscription page with `Free`, `Pro`, and `Enterprise` plan states
- Razorpay order creation and payment verification
- Responsive dashboard-style frontend with protected pages

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Axios
- Chart.js / `react-chartjs-2`
- Tailwind-related tooling plus project CSS

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- OpenAI SDK pointed at OpenRouter
- Razorpay

## Folder Structure

```text
AI/
|-- backend/
|   |-- config/            # DB connection and startup config
|   |-- controllers/       # Auth, analysis, history, payment logic
|   |-- middleware/        # JWT protection middleware
|   |-- models/            # Mongoose schemas
|   |-- routes/            # Express route modules
|   |-- utils/             # Gemini fallback helper(s)
|   |-- server.js          # Backend entry point
|   `-- package.json
|-- frontend/
|   |-- public/            # Static assets
|   |-- src/
|   |   |-- components/    # Shared UI components
|   |   |-- context/       # Auth and theme context
|   |   |-- pages/         # Route-level pages
|   |   |-- sections/      # Dashboard/analytics sections
|   |   |-- services/      # API client
|   |   `-- data.js        # Page content and plan metadata
|   `-- package.json
|-- backend-5001.cmd       # Optional helper launcher
|-- backend-5002.cmd       # Optional helper launcher
`-- README.md
```

## Main Application Areas

### Frontend pages

- `/login`: user login
- `/signup`: user registration
- `/analyze`: protected analysis workspace
- `/history`: protected saved analysis history
- `/about`: protected product overview page
- `/features`: protected feature showcase
- `/subscription`: protected pricing and payment page

### Backend API modules

- `authRoutes`: registration, login, current-user profile
- `analysisRoutes`: protected job-text analysis endpoint
- `historyRoutes`: protected history fetch and delete endpoints
- `paymentRoutes`: protected Razorpay order creation and payment verification

## Analysis Flow

When a user submits job text:

1. The backend validates that text was provided.
2. It loads the OpenRouter API key from `backend/.env`.
3. It sends a structured prompt to the model.
4. It normalizes the returned JSON into a consistent format.
5. It derives or cleans:
   - `riskScore`
   - `verdict`
   - `summary`
   - `reasons`
   - `safePercent`
   - `riskPercent`
   - `signals`
   - `evidence`
6. It stores the result in MongoDB history when possible.
7. If OpenRouter response handling fails, it falls back to Gemini-based analysis logic.

## Authentication and User Data

- Passwords are hashed with `bcryptjs`.
- JWTs are issued for successful signup/login.
- Protected routes expect a `Bearer` token in the `Authorization` header.
- Users include a `plan` field with one of: `Free`, `Pro`, `Enterprise`.

## Subscription and Payments

The project includes a basic SaaS-style subscription flow:

- `Free`: starter usage
- `Pro`: paid personal plan
- `Enterprise`: team-oriented plan

Payment behavior:

- The frontend loads Razorpay Checkout dynamically.
- The backend creates orders through Razorpay.
- Payment verification uses HMAC signature validation.
- On successful verification, the user plan is updated in MongoDB.

If Razorpay keys are not configured, payment endpoints respond with a setup-related message instead of processing payments.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_key
# Optional alternative variable name supported by the code:
# OPEN_ROUTER_API_KEY=your_openrouter_key

PUBLIC_APP_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173

GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

MONGO_MAX_RETRIES=5
MONGO_RETRY_DELAY_MS=1500
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If `VITE_API_BASE_URL` is not set, the frontend falls back to:

- `http://localhost:5000/api` in local development
- a hosted Render API URL outside localhost

## Installation

Install dependencies separately for backend and frontend:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running the Project

Use two terminals from the project root.

### Start the backend

```bash
cd backend
npm run dev
```

Backend default URL: `http://localhost:5000`

### Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Available Scripts

### Backend

- `npm run dev`: run the API with `nodemon`
- `npm start`: run the API with `node`

### Frontend

- `npm run dev`: start Vite development server
- `npm run build`: create a production build
- `npm run preview`: preview the production build locally

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Analysis

- `POST /api/analyze`

Example request body:

```json
{
  "jobText": "Paste the full job description here"
}
```

### History

- `GET /api/history`
- `DELETE /api/history/:id`

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`

Most endpoints except registration and login require authentication.

## Deployment Notes

- The backend allows localhost origins, private-network dev origins, and selected Vercel-hosted frontend origins.
- MongoDB startup includes retry logic for temporary connection issues.
- The backend reports a clear startup error if the selected port is already in use.
- `.env` files should stay local and must not contain committed secrets.

## Current Gaps

- There are no automated tests configured in the root project at the moment.
- The README documents the current behavior, but production deployment still depends on valid third-party keys and database connectivity.
- Uploaded/generated backend files exist in `backend/uploads/`; treat that directory as runtime data rather than core source code.
