# Frontend CLAUDE.md (React/TypeScript)

## Commands
```bash
cd packages/frontend
npm run dev   # Start dev server
npm test      # Run tests
npm run build # Build for production
```

## Architecture

**Components:**
- `App.tsx` - Main app, auth, routing
- `Login.tsx` - Login/registration
- `SessionForm.tsx` - Session logging
- `SessionList.tsx` - Session history

**Services:**
- `api.ts` - Axios with auth interceptor
- `auth.ts` - Authentication service