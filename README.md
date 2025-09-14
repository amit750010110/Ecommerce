# E-Commerce Frontend

This is the frontend part of the E-Commerce application built with React and Material-UI.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Backend service running on http://localhost:8080

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env.development` file with the following content:

   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Alternatively, you can use the provided start script:

   ```bash
   ./start-frontend.bat
   ```

4. The application will be available at http://localhost:5173

## Features

- User authentication (login/register)
- Product catalog with filtering and pagination
- Shopping cart
- Checkout process
- Order history
- User profile management
- Admin dashboard (for users with admin role)

## Backend Integration

The frontend connects to the Spring Boot backend running on port 8080. Make sure the backend is running before starting the frontend application.

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for API requests (default: http://localhost:8080/api)

## Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.
