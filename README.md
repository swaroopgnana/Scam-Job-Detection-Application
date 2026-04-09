# JobLens

JobLens is a full-stack web application for analyzing job listings and helping users spot potential scam signals before applying. It combines AI-assisted risk scoring, saved analysis history, authentication, plan management, and Razorpay subscription checkout in one platform.

## Features

- User signup and login with JWT authentication
- AI-powered job post risk analysis
- Risk score, verdict, reasons, and evidence cards
- Signal breakdown charts for suspicious language, payment requests, contact risk, and company trust
- Saved analysis history per user
- Subscription page with Razorpay checkout
- Light and dark mode UI
- Responsive dashboard for desktop and mobile

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Chart.js
- React Chart.js 2
- React Icons

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- OpenAI SDK with OpenRouter API base
- Razorpay

## Project Structure

```text
AI/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- server.js
|   |-- .env.example
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |-- .env.example
|
|-- README.md
```

## Main Modules

- `frontend/src/pages/Analyze.jsx`
  Main AI analysis screen for pasting and reviewing job descriptions.

- `frontend/src/pages/Subscription.jsx`
  Pricing page with Razorpay checkout integration.

- `backend/controllers/analysisController.js`
  Sends the pasted job text to the AI model and saves the analysis result in MongoDB.

- `backend/controllers/paymentController.js`
  Creates Razorpay orders and verifies payment signatures before upgrading the user plan.

- `backend/controllers/authController.js`
  Handles registration, login, and user profile retrieval.

## Environment Variables

### Backend

Create `backend/.env` using `backend/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jobscamdb
JWT_SECRET=your_super_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend

Create `frontend/.env` using `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

### 1. Clone the project

```bash
git clone <your-repository-url>
cd AI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running the Project

Open two terminals.

### Terminal 1: Start backend

```bash
cd backend
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### Terminal 2: Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Analysis

- `POST /api/analyze`

### History

- `GET /api/history`
- `DELETE /api/history/:id`

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`

## Razorpay Subscription Flow

1. User opens the Subscription page.
2. User selects a paid plan.
3. Frontend requests `/api/payments/create-order`.
4. Backend creates a Razorpay order.
5. Razorpay Checkout opens in the browser.
6. After payment, frontend sends the payment response to `/api/payments/verify`.
7. Backend verifies the Razorpay signature and updates the user's plan.

## How the AI Analysis Works

1. User pastes a job description.
2. Frontend sends it to `/api/analyze`.
3. Backend sends the prompt to the AI model through OpenRouter.
4. The response is normalized into:
   - risk score
   - verdict
   - summary
   - reasons
   - signal breakdown
   - evidence cards
5. The analysis is saved in MongoDB history for the logged-in user.

## Notes

- MongoDB must be running before starting the backend.
- A valid `OPENROUTER_API_KEY` is required for AI analysis.
- Valid Razorpay test or live keys are required for payments.
- Protected routes require a logged-in user and JWT token.

## Build Status

The frontend production build has been verified successfully during setup updates.

## Future Improvements

- Add webhook-based payment confirmation
- Add subscription expiry and billing cycle tracking
- Add admin dashboard and analytics
- Add test coverage for API routes and UI flows
- Add deployment guides for Vercel, Render, or VPS hosting

## Author

Built for a job scam detection and subscription-enabled SaaS workflow using React, Node.js, MongoDB, AI analysis, and Razorpay.
