# Overhang Frontend

React/TypeScript frontend for the Overhang climbing progress tracking application.

## Setup

From the repository root:

```bash
cd packages/frontend
npm install
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── assets/        # Static assets (CSS, images)
├── utils/         # Utility functions
├── services/      # API service layer
├── types/         # TypeScript type definitions
└── views/         # Page components
```

## Development Notes

- The frontend communicates with the backend API at `http://localhost:8000`
- Proxy is configured in vite.config.ts to handle CORS issues during development
- All frontend code is written in TypeScript for better type safety