# Frontend Technical Documentation

## Tech Stack
- Next.js 15.2.1 (App Router)
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
├── components/     # Reusable UI components
│   ├── ui/        # Shadcn components
│   ├── email/     # Email-related components
│   └── landing/   # Landing page components
├── api/           # API routes
└── lib/          # Utility functions and configurations
```

## State Management
- React Server Components for server-side state
- React Context for theme/auth state
- Server Actions for mutations

## Landing Page Components
- Uses actual dashboard components as mockups
- Simplified preview sections
- Feature showcase with screenshots
- Clean, modern design without 3D effects
- Performance-focused animations

## API Integration
- REST endpoints for email operations
- WebSocket for real-time updates

## Design System
- Shadcn/ui for consistent UI
- Dark/light theme support
- Responsive breakpoints
- Custom color schemes
- Modern gradient effects
