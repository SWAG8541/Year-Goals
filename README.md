# Year Goals Project

A full-stack application with React frontend and Express backend for tracking yearly goals.

## Project Structure

```
Year-Goals/
├── client/          # React frontend (Port 8541)
├── server/          # Express backend (Port 4255)
└── shared/          # Shared types and schemas
```

## Setup & Installation

### Frontend Setup
```bash
cd client
npm install
```

### Backend Setup
```bash
cd server
npm install
```

Set up environment variables in `server/.env`:
```env
PORT=4255
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/year-goals
JWT_SECRET=your-jwt-secret-key-here
```

## Development

### Start Frontend (Port 8541)
```bash
cd client
npm run dev
```

### Start Backend (Port 4255)
```bash
cd server
npm run dev
```

## Production

### Build Frontend
```bash
cd client
npm run build
npm run preview
```

### Start Backend
```bash
cd server
npm start
```

## URLs

- Frontend: http://localhost:8541
- Backend API: http://localhost:4255

## Individual Commands

### Client Commands
```bash
cd client
npm run dev      # Development server on port 8541
npm run build    # Build for production
npm run preview  # Preview production build
npm run check    # TypeScript check
```

### Server Commands
```bash
cd server
npm run dev      # Development server on port 4255
npm start        # Production server
npm run build    # Build TypeScript
npm run check    # TypeScript check
npm run db:seed  # Seed database
```# Year-Goals
