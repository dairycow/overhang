# Frontend (React/TypeScript)

React/TypeScript frontend for the Overhang climbing progress tracking application.

## Features

- Session logging with multiple grades and attempts
- Progress tracking and statistics visualization
- User authentication with JWT tokens
- Responsive design for desktop and mobile

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Chart.js with react-chartjs-2

## Quick Start

```bash
cd packages/frontend
npm install
npm run dev
```

Frontend available at http://localhost:3000

## Project Structure

```
packages/frontend/
├── src/
│   ├── components/        # UI components
│   │   ├── charts/        # Chart components
│   │   └── Dashboard.tsx  # Main dashboard
│   ├── services/          # API services
│   │   ├── api.ts         # Axios client
│   │   └── auth.ts        # Authentication
│   └── App.tsx            # Main application
├── public/                # Static assets
└── package.json           # Dependencies
```

## API Integration

Communicates with FastAPI backend at `http://localhost:8000`

## Documentation

- [Main README](../../README.md) - Project overview
- [API Documentation](../../docs/api.md) - Backend API reference