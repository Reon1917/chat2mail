# Frontend Technical Documentation

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- React Server Components

## Key Features
- Dashboard layout with email management
- Authentication system
- Real-time email monitoring
- Responsive design
- Dark/light theme support

## Project Structure
```
app/
├── (auth)/         # Authentication related routes
├── dashboard/      # Main dashboard pages
├── api/           # API routes
├── components/    # Reusable UI components
└── lib/          # Utility functions and configurations
```

## State Management
- React Server Components for server-side state
- React Context for theme/auth state
- Server Actions for mutations

## API Integration
- REST endpoints for email operations
- WebSocket for real-time updates
