# Backend Technical Documentation

## Tech Stack
- NextJS
- TypeScript
- PostgreSQL
- Drizzle ORM
- IMAP/SMTP Integration

## Core Components
- Email Service
  - IMAP connection management
  - Email fetching and parsing
  - SMTP sending capabilities
- Database Schema
  - Users
  - Email accounts
  - Rules/Filters
  - Message logs

## API Endpoints
```
/api/
├── auth/          # Authentication endpoints
├── email/         # Email management
├── accounts/      # Email account settings
└── rules/         # Filter rules management
```

## Security
- JWT authentication
- Email credentials encryption
- Rate limiting
- CORS configuration

## Background Jobs
- Email polling
- Notification system
- Auto-responder logic
