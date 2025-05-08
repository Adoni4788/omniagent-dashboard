# OmniAgent Dashboard

A modern, real-times dashboard for AI agent orchestration built with Next.js and Supabase.

![OmniAgent Dashboard](https://via.placeholder.com/1200x600?text=OmniAgent+Dashboard)

## 🚀 Features

- **Real-time Task Management**: Monitor and control AI agent tasks with live updates
- **Secure Authentication**: Email/password and magic link authentication via Supabase
- **Role-based Access Control**: Security levels for different user permissions
- **Command Console**: Direct interaction with AI agents
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **State Management**: React Query, React Context
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

## 📋 Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐
│                 │     │               │     │                 │
│  Next.js App    │━━━━▶│  Supabase API │━━━━▶│  PostgreSQL DB  │
│                 │◀━━━━│               │◀━━━━│                 │
└─────────────────┘     └───────────────┘     └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐
│  React Query    │     │  Auth Service │     │ Realtime Events │
└─────────────────┘     └───────────────┘     └─────────────────┘
```

## 🔧 Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or use mock data mode)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omniagent-dashboard.git
   cd omniagent-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to false when using real Supabase
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run validate-schema` - Validate Supabase schema
- `npm run analyze` - Analyze bundle size
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Data Models

### Tasks
Main tasks that agents work on.

| Field          | Type      | Description                             |
|----------------|-----------|-----------------------------------------|
| id             | UUID      | Primary key                             |
| name           | TEXT      | Task name                               |
| status         | TEXT      | Current status (queued, running, etc.)  |
| timestamp      | TIMESTAMP | Creation time                           |
| preview        | TEXT      | Optional preview content                |
| security_level | TEXT      | Security classification                 |
| user_id        | UUID      | Owner of the task                       |
| created_at     | TIMESTAMP | Creation timestamp                      |
| updated_at     | TIMESTAMP | Last update timestamp                   |

### Steps
Individual steps within tasks.

| Field       | Type      | Description                       |
|-------------|-----------|-----------------------------------|
| id          | UUID      | Primary key                       |
| task_id     | UUID      | Reference to parent task          |
| name        | TEXT      | Step name                         |
| action_type | TEXT      | Type of action                    |
| status      | TEXT      | Step status                       |
| log         | TEXT      | Output log                        |
| created_at  | TIMESTAMP | Creation timestamp                |
| updated_at  | TIMESTAMP | Last update timestamp             |

### User Settings
User preferences and settings.

| Field                | Type      | Description                     |
|----------------------|-----------|---------------------------------|
| id                   | UUID      | Primary key                     |
| user_id              | UUID      | User reference                  |
| theme                | TEXT      | UI theme preference             |
| security_level       | TEXT      | Default security level          |
| notifications_enabled| BOOLEAN   | Enable/disable notifications    |
| default_mode         | TEXT      | Default agent mode              |
| created_at           | TIMESTAMP | Creation timestamp              |
| updated_at           | TIMESTAMP | Last update timestamp           |

## 🔒 Security

- **Row-Level Security**: All tables have RLS policies restricting access to user's own data
- **Environment Variables**: Sensitive keys stored in environment variables
- **Input Validation**: Zod schema validation for all user inputs
- **Security Headers**: Set via Vercel configuration

## 🧪 Testing and Validation

- Schema validation script to ensure database compatibility
- Jest for unit and integration testing
- Test coverage for core components

## 📝 License

[MIT](LICENSE) 